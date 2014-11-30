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

var fs = require('fs'), deleteFolderRecursive = function(path) {
  console.info('deleteFolderRecursive ' + path );
  if (path[path.length-1]==='/') {
    path = path.substring(0, path.length-1);
  }
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        console.info('-- deleting: ' + curPath);
        deleteFolderRecursive(curPath);
      } else { // delete file
        console.info('-- deleting: ' + curPath);
        fs.unlinkSync(curPath);
      }
    });
    console.info('err here: ' + path);
    fs.readdirSync(path).forEach(function(file,index){
        console.info('++ wtf: ' + file);
    });
    fs.rmdirSync(path);
  }
};

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
    this.directoryCrxDestination = 'tmp/test-distribution/';
    this.fileCrxDestination = 'tmp/test-distribution/custom-file.crx';
    this.originalSrcZip = 'originalSrcZip';
    this.originalCrxDestination = 'originalCrxDestination';
    // setup here if necessary
    done();
  },
  error_in_configuration: function(test) {
    var originalSrcZip = this.originalSrcZip;
    var doesNotExistsSrcZip = this.doesNotExistsSrcZips[0];
    var multipleGoodSrcZips = this.multipleGoodSrcZips;
    var unreachable = function(){
      test.ok(false, "this place should not been reached");
      test.done();
    };
    test.expect(6);
    zipsListToCrx.thickThing(this.goodPrivateKey, this.nullSrcZips, this.directoryCrxDestination, this.originalSrcZip, this.originalCrxDestination, unreachable, function(onError){
      test.equal(onError, 'The `'+ originalSrcZip+'` file(s) specification matched no files.', 'should be ');
    });
    zipsListToCrx.thickThing(this.goodPrivateKey, this.emptySrcZips, this.directoryCrxDestination, this.originalSrcZip, this.originalCrxDestination, unreachable, function(onError){
      test.equal(onError, 'The `'+ originalSrcZip+'` file(s) specification matched no files.', 'should be ');
    });
    zipsListToCrx.thickThing(this.goodPrivateKey, this.doesNotExistsSrcZips, this.directoryCrxDestination, this.originalSrcZip, this.originalCrxDestination, unreachable, function(onError){
      test.equal(onError, 'The `' + doesNotExistsSrcZip + '` file does not exists.', 'should be ');
    });
    zipsListToCrx.thickThing(this.goodPrivateKey, this.directorySrcZips, this.directoryCrxDestination, this.originalSrcZip, this.originalCrxDestination, unreachable, function(onError){
      test.equal(onError, 'The `originalSrcZip` src specification matched `test` directory. It should be a file.', 'should be ');
    });
    zipsListToCrx.thickThing(this.goodPrivateKey, this.goodSrcZips, this.directoryAsFileCrxDestination, this.originalSrcZip, this.originalCrxDestination, unreachable, function(onError){
      test.equal(onError, 'Supposed output file `test` is an existing directory. Use slash in the end if you meant to place file inside that directory.', 'should be ');
    });
    zipsListToCrx.thickThing(this.goodPrivateKey, this.multipleGoodSrcZips, this.fileCrxDestination, this.originalSrcZip, this.originalCrxDestination, unreachable, function(onError){
      test.equal(onError, 'Source specification `'+originalSrcZip+'` matches multiple ('+multipleGoodSrcZips.length+') files. Corresponding `dest` must be a directory.', 'should be ');
    });
    test.done();
  },
  faulty_pem_file: function(test) {
    var originalSrcZip = this.originalSrcZip;
    var multipleGoodSrcZips = this.multipleGoodSrcZips;
    test.expect(1);
    zipsListToCrx.thickThing(this.faultyPrivateKey, this.goodSrcZips, this.fileCrxDestination, this.originalSrcZip, this.originalCrxDestination, function(){
      test.ok(false, "this place should not been reached");
      test.done();
    }, function(error){
      var expectedErrorstart = "unable to load Private Key", errorCorrect = error.substring(0, expectedErrorstart.length) === expectedErrorstart;
      console.info('********************** UNBELIEVABLE **************************');
      console.info('********************** UNBELIEVABLE **************************: ' + error.substring(0, expectedErrorstart.length));
      test.equal(error.substring(0, expectedErrorstart.length), expectedErrorstart, 'should be ');
      test.done();
    });
  },
  multiple_crx: function(test) {
    var directoryCrxDestination = this.directoryCrxDestination;
    test.expect(2);
    deleteFolderRecursive(directoryCrxDestination);
    zipsListToCrx.thickThing(this.goodPrivateKey, this.multipleGoodSrcZips, this.directoryCrxDestination, this.originalSrcZip, this.originalCrxDestination, function(){
      test.ok(fs.existsSync(directoryCrxDestination + '/test-1.crx'), 'test-1.crx was not created');
      test.ok(fs.existsSync(directoryCrxDestination + '/test-2.crx'), 'test-2.crx was not created');
      test.done();
    }, function(error){
      test.ok(false, "this place should not been reached");
      test.ok(false, "this place should not been reached");
      test.done();
    });
  },
  single_crx: function(test) {
    var fileCrxDestination = this.fileCrxDestination, directoryCrxDestination = this.directoryCrxDestination,
      goodPrivateKey = this.goodPrivateKey, goodSrcZips = this.goodSrcZips,
      originalSrcZip = this.originalSrcZip, originalCrxDestination = this.originalCrxDestination;

    test.expect(1);

    setTimeout(function() {
      deleteFolderRecursive(directoryCrxDestination);
      zipsListToCrx.thickThing(goodPrivateKey, goodSrcZips, fileCrxDestination, originalSrcZip, originalCrxDestination, function(){
        test.ok(fs.existsSync(fileCrxDestination), fileCrxDestination + ' was not created');
        test.done();
      }, function(error){
        test.ok(false, "should not err: " + error);
        test.done();
      });
    }, 0); //TODO: investigate and maybe report bug to nodejs
  }
};
