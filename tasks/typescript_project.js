/*
 * grunt-typescript-project
 * https://github.com/pocesar/grunt-typescript-project
 *
 * Copyright (c) 2016 Paulo Cesar
 * Licensed under the MIT license.
 */

'use strict';

var tmp = require('tmp')
var deepAssign = require('deep-assign')
var bluebird = require('bluebird')
var arrayUnique = require('array-unique')
var path = require('path')

module.exports = function (grunt) {

	// Please see the Grunt documentation for more information regarding task
	// creation: http://gruntjs.com/creating-tasks

	function consideredFolder(s) {
		return s && !consideredFile(s)
	}

	function consideredFile(s) {
		return s && s.indexOf('.js') !== -1
	}

	function runTsc(json) {
		return new bluebird(function (resolve, reject) {
			grunt.util.spawn({
				cmd: 'tsc',
				args: ['--project', json].concat(grunt.option.flags().indexOf('--verbose') !== -1 ? ['--listFiles'] : []),
				opts: {
					cwd: process.cwd(),
					stdio: [process.stdin, process.stdout, process.stderr]
				}
			}, function(error, result, code){
				resolve()
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
		var options = this.options()
		var dests

		if (Object.getOwnPropertyNames(options).length === 0) {
			grunt.fail.warn('You must specify at least tsconfig option')
		}

		if (options.tsconfig) {
			if (options.tsconfig === true) {
				grunt.log.ok('Using tsconfig.json in CWD as base')
				options = this.options(grunt.file.readJSON('tsconfig.json'))
			} else if (typeof options.tsconfig === 'string') {
				if (grunt.file.exists(options.tsconfig)) {
					grunt.log.ok('Using ' + options.tsconfig + ' as base')
					options = this.options(grunt.file.readJSON(options.tsconfig))
				} else {
					grunt.fail.fatal(grunt.util.error('options.tsconfig defined by not found: ' + options.tsconfig))
				}
			}

			delete options.tsconfig
		}

		grunt.verbose.ok('Current options', options)

		var done = this.async()

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

						var opts = deepAssign({compilerOptions: {
							//rootDir: commonRoot(dests[dest])
						}}, options, {files: dests[dest]})

						if (consideredFile(dest)) {
							opts.compilerOptions.outFile = dest
						}

						if (consideredFolder(dest)) {
							opts.compilerOptions.outDir = dest
						}

						grunt.verbose.ok('Will generate', opts)

						grunt.file.write(tmpPath, JSON.stringify(opts))

						runTsc(tmpPath).then(cleanup, cleanup)
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

					runTsc(tmpPath).then(cleanup, cleanup)
				})
			})).then(function(){
				done()
			}, done)
		} else {
			grunt.fail.warn('Found no options or files, doing nothing');
			done()
		}
	});

};
