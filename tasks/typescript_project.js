/*
 * grunt-typescript-project
 * https://github.com/pocesar/grunt-typescript-project
 *
 * Copyright (c) 2016 Paulo Cesar
 * Licensed under the MIT license.
 */

'use strict';

var tmp = require('tmp')
var mergeOptions = require('merge-options')
var bluebird = require('bluebird')
var arrayUnique = require('array-unique')
var path = require('path')
var which = require('which')

module.exports = function (grunt) {

	// Please see the Grunt documentation for more information regarding task
	// creation: http://gruntjs.com/creating-tasks

	function consideredFolder(s) {
		return s && !consideredFile(s)
	}

	function consideredFile(s) {
		return s && s.indexOf('.js') !== -1
	}

	function reportVersion(compiler, cb) {
		which(compiler, function(err, resultPath){
			if (err) {
				return cb(err)
			}

			grunt.util.spawn({
				cmd: compiler,
				args: ['-v'],
				opts: {
					cwd: process.cwd(),
					stdio: false
				}
			}, function(err, result){
				if (err) {
					return cb(new Error(err))
				}

				grunt.verbose.ok('Using Typescript', '' + result, '(' + resultPath + ')')
				cb()
			})
		})
	}

	function runTsc(json, noEmitOnError, compiler) {
		return new bluebird(function (resolve, reject) {
			grunt.util.spawn({
				cmd: compiler,
				args: ['--project', json].concat(grunt.option.flags().indexOf('--verbose') !== -1 ? ['--listFiles'] : []),
				opts: {
					cwd: process.cwd(),
					env: process.env,
					stdio: [process.stdin, process.stdout, process.stderr]
				}
			}, function(error, result, code){
				if (error && noEmitOnError) {
					reject(error instanceof Error ? error : new Error(error))
				} else {
					resolve()
				}
			})
		})
	}

	function commonRoot(paths) {
		return paths.reduce(function(current, p){
			if (current.indexOf(p) === -1 && p.length > current.length) {
				current = path.dirname(p).replace(process.cwd(), '')
			}
			return current;
		}, '.');
	}

	grunt.registerMultiTask('typescript_project', 'Make use of tsc --project, no need for extra code!', function () {
		// Merge task-specific and/or target-specific options with these defaults.
		function customMerge(opts) {
			return mergeOptions.apply({concatArrays: true}, [grunt.config.get('typescript_project.options')].concat(opts));
		}

		var options = customMerge(this.options())
		var dests
		var compiler = 'tsc'

		if (Object.getOwnPropertyNames(options).length === 0) {
			grunt.fail.warn('You must specify at least the `options.tsconfig` inside your target')
		}

		if (options.tsconfig) {
			if (options.tsconfig === true) {
				grunt.log.ok('Using tsconfig.json in CWD as base')
				options = customMerge([grunt.file.readJSON('tsconfig.json'), this.options()])
			} else if (typeof options.tsconfig === 'string') {
				if (grunt.file.exists(options.tsconfig)) {
					grunt.log.ok('Using ' + options.tsconfig + ' as base')
					options = customMerge([grunt.file.readJSON(options.tsconfig), this.options()])
				} else {
					grunt.fail.fatal(grunt.util.error('options.tsconfig defined by not found: ' + options.tsconfig))
				}
			} else if (typeof options.tsconfig === 'object' && options.tsconfig.length) {
				options = customMerge([options.tsconfig.reduce(function(current, tsconfig, index){
					grunt.verbose.ok('Current options', current);
					if (grunt.file.exists(tsconfig)) {
						grunt.log.ok('Reading ' + tsconfig)
						return customMerge([current, grunt.file.readJSON(tsconfig)])
					} else {
						grunt.fail.fatal(grunt.util.error('options.tsconfig[' + index + ']  defined by not found: ' + tsconfig))
					}
					return current
				}, {}), this.options()])
			}

			delete options.tsconfig
		}

		if (options.customCompiler) {
			compiler = options.customCompiler
			delete options.customCompiler
		}

		grunt.verbose.ok('Current options', options)

		var done = this.async()

		reportVersion(compiler, function(err){
			if (err) {
				return done(err)
			}

			if (this.files.length) {
				dests = this.files.reduce(function (dests, element) {
					dests[element.dest] = arrayUnique(element.src.concat(options.files ? options.files : []))
					return dests
				}, {})

				tmp.setGracefulCleanup()

				bluebird.reduce(Object.keys(dests), function (current, dest) {
					return new bluebird(function (resolve, reject) {
						tmp.file({ dir: process.cwd(), prefix: 'tsconfig-', postfix: '.json' }, function (err, tmpPath, fd, cleanupCallback) {
							if (err) {
								return reject(err)
							}

							var cleanup = function(err) {
								cleanupCallback()

								if (err) {
									return reject(err)
								}

								return resolve()
							}

							var opts = mergeOptions.call({concatArrays: true}, {compilerOptions: {
								//rootDir: commonRoot(dests[dest])
							}}, options, {files: dests[dest]})

							if (opts.compilerOptions.outFile == null && consideredFile(dest)) {
								opts.compilerOptions.outFile = dest
							}

							if (opts.compilerOptions.outDir == null && consideredFolder(dest)) {
								opts.compilerOptions.outDir = dest
							}

							grunt.verbose.ok('Will generate', opts)

							grunt.file.write(tmpPath, JSON.stringify(opts))

							runTsc(tmpPath, opts && opts.compilerOptions && opts.compilerOptions.noEmitOnError, compiler).then(cleanup, cleanup)
						})
					})
				}, true).then(function () {
					done()
				}, done)

			} else if (Object.keys(options).length) {
				(new bluebird(function (resolve, reject) {
					tmp.file({ dir: process.cwd(), prefix: 'tsconfig-', postfix: '.json' }, function (err, tmpPath, fd, cleanupCallback) {
						if (err) {
							return reject(err)
						}

						var cleanup = function(err) {
							cleanupCallback()

							if (err) {
								return reject(err)
							}

							return resolve()
						}

						grunt.verbose.ok('Will generate', options)

						grunt.file.write(tmpPath, JSON.stringify(options))

						runTsc(tmpPath, options && options.compilerOptions && options.compilerOptions.noEmitOnError, compiler).then(cleanup, cleanup)
					})
				})).then(function(){
					done()
				}, done)
			} else {
				grunt.fail.warn('Found no options or files, doing nothing');
				done()
			}

		}.bind(this))

	});

};
