/*
 * grunt-typescript-project
 * https://github.com/pocesar/grunt-typescript-project
 *
 * Copyright (c) 2016 Paulo Cesar
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    typescript_project: {
      usingBooleanTsconfig: {
        options: {
          tsconfig: true
        }
      },
      usingArrayTsconfig: {
        options: {
          tsconfig: ['tsconfig.json','test/tsconfig.json','test/tsconfig-array.json']
        }
      },
      usingStringTsconfig: {
        options: {
          tsconfig: 'test/tsconfig.json'
        }
      },
      usingOptions: {
        files: {
          'tmp/file1.js': ['test/fixtures/*.ts']
        },
        options: {
          compilerOptions: {
            module: "system"
          }
        }
      },
      usingFiles: {
        files: {
          'tmp/usingFiles': ['test/fixtures/def.d.ts']
        },
        options: {
          compilerOptions: {
            rootDir: "."
          },
          files: [
            'test/fixtures/file1.ts'
          ]
        }
      },
      usingNothing: { },
      usingNoEmitOnError: {
        files: {
          'tmp/usingNoEmitOnError': ['test/fixtures/shouldfail/*.ts']
        },
        options: {
          compilerOptions: {
            noEmitOnError: true
          }
        }
      },
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-continue');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', [
    'clean',
    'continue:on',
    'typescript_project',
    'nodeunit'
  ]);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
