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
var ZipsListToCrxConstructor = require('./../lib/zips-list-to-crx.js'),
  zipsListToCrx = new ZipsListToCrxConstructor();

exports.zip_to_crx = {
  setUp: function(done) {
    this.wrongPrivateKey = { privateKey: 'doesNotExists.pem' };
    this.goodPrivateKey = { privateKey: 'test/ssl-keys/private-key.pem' };
    this.faultyPrivateKey = { privateKey: 'test/ssl-keys/faulty-key.pem' };
    this.nullSrcZips = null;
    this.emptySrcZips = [];
    this.doesNotExistsSrcZips = ['doesNotExists.zip'];
    this.directorySrcZips = ['test'];
    this.goodSrcZips = ['test/data/test-1.zip'];
    this.multipleGoodSrcZips = ['test/data/test-1.zip', 'test/data/test-2.zip'];
    this.nullCrxDestination = null;
    this.emptyCrxDestination = '';
    this.directoryAsFileCrxDestination = 'test';
    this.directoryCrxDestination = 'tmp/distribution/';
    this.fileCrxDestination = 'tmp/distribution/file.crx';
    this.originalSrcZip = 'originalSrcZip';
    this.originalCrxDestination = 'originalCrxDestination';
    // setup here if necessary
    done();
  },
  /*error_in_configuration: function(test) {
    var originalSrcZip = this.originalSrcZip;
    var doesNotExistsSrcZip = this.doesNotExistsSrcZips[0];
    var multipleGoodSrcZips = this.multipleGoodSrcZips;
    test.expect(6);
    zipsListToCrx.thickThing(this.goodPrivateKey, this.nullSrcZips, this.directoryCrxDestination, this.originalSrcZip, this.originalCrxDestination, function(onError){
      test.equal(onError, 'The `'+ originalSrcZip+'` file(s) specification matched no files.', 'should be ');
    });
    zipsListToCrx.thickThing(this.goodPrivateKey, this.emptySrcZips, this.directoryCrxDestination, this.originalSrcZip, this.originalCrxDestination, function(onError){
      test.equal(onError, 'The `'+ originalSrcZip+'` file(s) specification matched no files.', 'should be ');
    });
    zipsListToCrx.thickThing(this.goodPrivateKey, this.doesNotExistsSrcZips, this.directoryCrxDestination, this.originalSrcZip, this.originalCrxDestination, function(onError){
      test.equal(onError, 'The `' + doesNotExistsSrcZip + '` file does not exists.', 'should be ');
    });
    zipsListToCrx.thickThing(this.goodPrivateKey, this.directorySrcZips, this.directoryCrxDestination, this.originalSrcZip, this.originalCrxDestination, function(onError){
      test.equal(onError, 'The `originalSrcZip` src specification matched `test` directory. It should be a file.', 'should be ');
    });
    zipsListToCrx.thickThing(this.goodPrivateKey, this.goodSrcZips, this.directoryAsFileCrxDestination, this.originalSrcZip, this.originalCrxDestination, function(onError){
      test.equal(onError, 'Supposed output file `originalCrxDestination` is an existing directory. Use slash in the end if you meant to place file inside that directory.', 'should be ');
    });
    zipsListToCrx.thickThing(this.goodPrivateKey, this.multipleGoodSrcZips, this.fileCrxDestination, this.originalSrcZip, this.originalCrxDestination, function(onError){
      test.equal(onError, 'Source specification `'+originalSrcZip+'` matches multiple ('+multipleGoodSrcZips.length+') files. Corresponding `dest` must be a directory.', 'should be ');
    });
    test.done();
  },*/
  faulty_pem_file: function(test) {
    var originalSrcZip = this.originalSrcZip;
    var multipleGoodSrcZips = this.multipleGoodSrcZips;
    test.expect(1);
    zipsListToCrx.thickThing(this.faultyPrivateKey, this.goodSrcZips, this.fileCrxDestination, this.originalSrcZip, this.originalCrxDestination, function(onError){
      test.equal(onError, 'wtf', 'should be ');
    });
    test.done();
  }/*,
  multiple_crx: function(test) {
    //this.multipleGoodSrcZips = ['test/data/test-1.zip', 'test/data/test-2.zip'];
    //this.directoryCrxDestination = 'tmp/distribution/';
    test.expect(2);

    var actual = grunt.file.read('tmp/default_options');
    var expected = grunt.file.read('test/expected/default_options');
    test.equal(actual, expected, 'should describe what the default behavior is.');

    test.done();
  },
  single_crx: function(test) {
    //this.goodSrcZips = ['test/data/test-1.zip'];
    //this.fileCrxDestination = 'tmp/distribution/file.crx';
    test.expect(1);

    var actual = grunt.file.read('tmp/default_options');
    var expected = grunt.file.read('test/expected/default_options');
    test.equal(actual, expected, 'should describe what the default behavior is.');

    test.done();
  }*/
};
