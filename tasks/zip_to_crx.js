/*
 * grunt-zip-to-crx
 * https://github.com/SomMeri/grunt-zip-to-crx
 *
 * Licensed under the MIT license.
 */

'use strict';


module.exports = function(grunt) {
  var ZipsToCrxConstructor = require('./../lib/zips-list-to-crx.js'), zipsToCrx = new ZipsToCrxConstructor();

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('zip_to_crx', 'Converts zipped files into chrome extension file (.crx).', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options, filesList, allInputFilesTripples, CrxCreatorConstructor, crxCreator, done;
    done = this.async();

    options = this.options({ /* fill default options here */  });

    if (typeof this.files === "undefined") {
      grunt.log.warn('No source file was defined. Use `src` or `files` property to do so.');
      return ;
    }
    if (options.privateKey == null) {
      grunt.log.warn('Private key was not provided. It is supposed to be inside `privateKey` option property.');
      return ;
    }
    if (!grunt.file.exists(options.privateKey)) {
      grunt.log.warn('The file '+options.privateKey+' does not exists. The `privateKey` option property  should point to pem encoded private key.');
      return ;
    }
    /**
     * this.files contains tripples: orig <- what was specified, dest, src <- undefined if file does not exist
     */
    allInputFilesTripples = this.files;
    allInputFilesTripples.forEach(function(filesTripple) {
      var allSrcZips = filesTripple.src, crxDestination = filesTripple.dest, originalSrcZip = filesTripple.orig.src, error;
      error = zipsToCrx.thickThing(options, allSrcZips, crxDestination, originalSrcZip, filesTripple.orig.dest, function(){}, function(error) {
        grunt.log.warn(error);
      });
    });

  });

};
