/*
 * grunt-zip-to-crx
 * https://github.com/SomMeri/grunt-zip-to-crx
 *
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('zip_to_crx', 'Converts zipped files into chrome extension file (.crx).', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options, filesList, allInputFilesTripples, CrxCreatorConstructor, crxCreator, done;
    done = this.async();

    CrxCreatorConstructor = require('./createCrxWithOpenSSL.js');
    crxCreator = new CrxCreatorConstructor();

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
    allInputFilesTripples.forEach(function(filesTripples) {
      var destination, destinationDirectory, destinationFilename, destinationIsDir = false;
      if (filesTripples.src == null ) { //this evaluate to true for both undefined and null
        grunt.log.warn('No source file was defined. Use `src` property to do so.');
        return ;
      }
      if (filesTripples.src.length===0) {
        grunt.log.warn('The `'+filesTripples.orig.src+'` file(s) specification matched no files.');
        return ;
      }
      destination = filesTripples.dest;
      if (filesTripples.src.length>1 && destination != null) {
        //grunt.log.writeln('Source specification `'+filesTripples.orig.src+'` matches multiple ('+filesTripples.src.length+') files. Corresponding `dest` must be directory. Since '+destination+' is not a directory, the `desc` property will be ignored.');
        destinationIsDir = true;
      }

      filesTripples.src.forEach(function(srcPath){
        if (grunt.file.isDir(srcPath)) {
          grunt.log.warn('The `'+filesTripples.orig.src+'` file(s) specification matched `'+srcPath+'` directory');
          return ;
        }
        var destinationCoordinates = constructOutputCoordinates(srcPath, destination, destinationIsDir), fullDestination;
        // create destination directory
        if (!isEmpty(destinationCoordinates.directory)) {
          grunt.file.mkdir(destinationCoordinates.directory);
        }
        fullDestination = destinationCoordinates.directory+destinationCoordinates.filename;
        if (grunt.file.isDir(fullDestination)) {
          grunt.log.warn('Supposed output file `'+filesTripples.orig.dest+'` is a directory. Use slash in the end if you meant directory.');// TODO: maybe accept it as such?
          return ;
        }
        grunt.log.writeln(destinationCoordinates.directory+ ": " + destinationCoordinates.filename + " -> " + fullDestination);
        crxCreator.generateCrxFile(srcPath, fullDestination, options.privateKey);
      });

    });

  });

  function printAllProperties(object, prefix) {
    prefix = prefix || '';
    for(var propName in object) {
      var propValue = object[propName];
      grunt.log.writeln(prefix + propName+": "+propValue);
    }
  }

  function constructOutputCoordinates(sourcePath, destination, assumeDestinationAsDir) {
    var pathParts, sourceFilename, namebase, destinationFilename, destinationDirectory;

    destination = destination || '';
    assumeDestinationAsDir = assumeDestinationAsDir || false;

    if (endsWithSlash(destination) || assumeDestinationAsDir) {
      pathParts = sourcePath.split('/');
      sourceFilename = pathParts[pathParts.length -1];
      namebase = endsWith(sourceFilename, '.zip') ? sourceFilename.substr(0, sourceFilename.length - 4) : sourceFilename;
      destinationFilename = namebase + '.crx';
      destinationDirectory = addEndingSlashIfNeeded(destination);
    } else {
      pathParts = destination.split('/');
      destinationFilename = pathParts.pop();
      destinationDirectory = pathParts.join('/');
      if (!isEmpty(destinationDirectory)) {
        destinationDirectory = destinationDirectory + '/';
      }
    }

    return {directory:destinationDirectory, filename: destinationFilename};
  }

  function constructDestinationDirectory(destination, treatAsDir) {
    var pathParts;
    if (destination==null) {
      return '';
    }

    if (endsWithSlash(destination)) {
      return destination;
    }

    if (treatAsDir) {
      return addEndingSlashIfNeeded(destination);
    }

    pathParts = destination.split('/');
  }

  function endsWithSlash(directory) {
    return directory[directory.length-1]==='/';
  }


  function addEndingSlashIfNeeded(directory) {
    if (isEmpty(directory)) {
      return directory;
    }

    if (endsWithSlash(directory)) {
      return directory;
    }

    return directory + '/';
  }

  function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  }

  function isEmpty(string) {
    return string.length === 0;
  }

};
