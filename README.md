[![Build Status](https://travis-ci.org/pocesar/grunt-typescript-project.svg?branch=master)](https://travis-ci.org/pocesar/grunt-typescript-project)
[![npm](https://img.shields.io/npm/v/grunt-typescript-project.svg?maxAge=2592000?style=flat-square)](https://www.npmjs.com/package/grunt-typescript-project)
[![Dependencies](https://david-dm.org/pocesar/grunt-typescript-project.svg)](https://david-dm.org/pocesar/grunt-typescript-project)

# grunt-typescript-project

> Make use of tsc --project, no need for extra code! Yet another typescript grunt plugin but for simplicity's sake, let's lend the heavy lifting to tsc, shall we?

## Getting Started
This plugin requires Grunt `^1.0.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-typescript-project --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-typescript-project');
```

## Motivation

The main thing this task does is passing `options` as-is to a temporary .json file, that will call `tsc --project` on it.
But why? Instead of having a lot of `tsconfig.json` files inside many folders (when your project is scattered across many folders).
Plus, you can reuse the same options and overwrite the config per target, either using files or options.

Since it doesn't rely on internal API of Typescript, it should work with current and future versions, plus any future options can
be added to the json without having to update this plugin.

Automated tests are made against `typescript@latest`, `typescript@next`, `typescript@rc` and `typescript@1` (considered legacy now)

Some features won't work with TypeScript < 2 (like include, exclude, rootDirs, etc). For that, use the grunt `files`
property.

## The "typescript_project" task

### Overview
In your project's Gruntfile, add a section named `typescript_project` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  typescript_project: {
    options: {
      compilerOptions: {
        noImplicitAny: true,
        module: "system",
        target: "es6"
      }
    },
    your_target: {
      // ALWAYS use files, instead of src/dest
      // Note that for EACH dest, will be created a separated TSC project json file, keep that in mind
      files: {
        // its a folder == outDir
        'dest/has/no/extension': ['srcs/**/*.ts'],
        // its a file == outFile
        'dest/has/extension.js': ['srcs/**/*.ts']
      },
      options: {
        compilerOptions: {
          module: "umd"
        },
        include: [
          './typings/**/*.d.ts'
        ],
        exclude: [
          "node_modules",
          "jspm_packages",
          "bower_components"
        ]
      }
    },
  },
});
```

### Options

Everything that does inside `options` can be defined from this options:

https://www.typescriptlang.org/docs/handbook/tsconfig-json.html

There are no default options, so the minimum required setting is to set [`options.tsconfig` to true (to use your
existing tsconfig.json file](#tsconfig.json)


Note: Passing a "files" options will **MERGE** the ones specified in `files`. This is mainly useful to include typings
for all your compile targets. But don't include non typings!

```js
  grunt.initConfig({
    typescript_project: {
      options: {
        files: [
          "./typings/type1.d.ts",
          "./typings/type2.d.ts",
          "./typings/type3.d.ts"
        ]
      },
      target: {
        files: {
          'dest/all.js': ['moar/files/*.ts'] // will include each typings above.
        }
      },
      anotherTarget: {
        files: {
          'dist/': ['files/**/*.ts']  // will include each typings above.
        }
      }
    }
  })
```

Also note that tsconfig.json doesn't allow wildcards in `files`. For that, you need to use `include` (available in Typescript 2.0+)

This hasn't been tested with `compilerOptions.watch` setting.

Using `grunt typescript_project --verbose` will pass `--listFiles` to tsc internally

Also having `noEmitOnError` anywhere on your settings will make the grunt task itself fail (otherwise it will continue)

### tsconfig.json

You can specify existing `tsconfig.json` files to `options.tsconfig`, that is the only option inside `options` object that doesn't
get passed to the generated tsconfig.json is `options.tsconfig`, which can be a boolean, a string or an array of strings, it will
merge the current tsconfig.json specified to the options.

```js
 grunt.initConfig({
    typescript_project: {
      target1: {
        options: {
          tsconfig: './tsstuff/some-tsconfig.json' // specify your own filename or another location
        }
      },
      target2: {
        options: {
          tsconfig: ['tsconfig.json','./subfolder/tsconfig.json'] // the files will be merged from left to right, in this case
          // subfolder/tsconfig.json will overwrite tsconfig.json configurations
        }
      },
      target3: {
        options: {
          tsconfig: true // will use the sibling tsconfig.json from Gruntfile
        }
      }
    }
 })
```

NB: The `tsconfig.json` working dir (regardless where it's placed) is considered to be the same level of `Gruntfile.js` unless
you specify `rootDir`. Because the merge happens with only the file contents, the plugin is unaware of file paths
(and tampering trying to fix file paths inside the merged options is a foot gun)

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

