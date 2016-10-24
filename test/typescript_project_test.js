'use strict';

var grunt = require('grunt');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.typescript_project = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  usingStringTsconfig: function(test) {
    test.expect(1);

    test.ok(grunt.file.isFile('tmp/usingStringTsconfig/fixtures/file1.js'), 'tmp/usingStringTsconfig/fixtures/file1.js doesnt exists');

    test.done();
  },
  usingBooleanTsconfig: function(test) {
    test.expect(1);

    test.ok(grunt.file.isFile('tmp/usingBooleanTsconfig/fixtures/file1.js'), 'tmp/usingBooleanTsconfig/fixtures/file1.js doesnt exists');

    test.done();
  },
  usingArrayTsconfig: function(test) {
    test.expect(1);

    test.ok(grunt.file.isFile('tmp/usingArrayTsconfig/fixtures/file1.js'), 'tmp/usingArrayTsconfig/fixtures/file1.js doesnt exists');

    test.done();
  },
  usingFiles: function(test) {
    test.expect(1);

    test.ok(grunt.file.isFile('tmp/usingFiles/test/fixtures/file1.js'), 'tmp/usingFiles/test/fixtures/file1.js doesnt exists');

    test.done();
  },
  usingOptions: function(test) {
    test.expect(1);

    test.ok(grunt.file.isFile('tmp/file1.js'), 'tmp/file1.js doesnt exists');

    test.done();
  }
};
