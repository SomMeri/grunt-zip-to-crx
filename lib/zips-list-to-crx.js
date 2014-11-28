module.exports = function() {
  var grunt = require("grunt"),  CrxCreatorConstructor = require('./createCrxWithOpenSSL.js'),
    crxCreator = new CrxCreatorConstructor(), async = require("async");

  this.thickThing = function (options, allSrcZips, crxDestination, originalSrcZip, originalCrxDestination, onDone, onError) {
    var destinationDirectory, destinationFilename, destinationIsDir = false;
    if (allSrcZips == null || allSrcZips.length===0) {
      onError('The `'+ originalSrcZip+'` file(s) specification matched no files.');
      return ;
    }
    if (allSrcZips.length>1 && crxDestination != null && !endsWithSlash(crxDestination)) {
      onError('Source specification `'+originalSrcZip+'` matches multiple ('+allSrcZips.length+') files. Corresponding `dest` must be a directory.');
      return ;
      //grunt.log.writeln('Source specification `'+filesTripple.orig.src+'` matches multiple ('+filesTripple.src.length+') files. Corresponding `dest` must be directory. Since '+destination+' is not a directory, the `desc` property will be ignored.');
      //destinationIsDir = true;
    }

    allSrcZips.forEach(function(srcPath){
      if (!grunt.file.exists(srcPath)) {
        onError('The `' + srcPath + '` file does not exists.');
        return ;
      }
      if (grunt.file.isDir(srcPath)) {
        onError('The `' + originalSrcZip + '` src specification matched `'+srcPath+'` directory. It should be a file.');
        return ;
      }
      var destinationCoordinates = constructOutputCoordinates(srcPath, crxDestination, destinationIsDir), fullDestination;
      // create destination directory
      if (!isEmpty(destinationCoordinates.directory)) {
        grunt.file.mkdir(destinationCoordinates.directory);
      }
      fullDestination = destinationCoordinates.directory+destinationCoordinates.filename;
      if (grunt.file.isDir(fullDestination)) {
        onError('Supposed output file `' + fullDestination + '` is an existing directory. Use slash in the end if you meant to place file inside that directory.');
        return ;
      }
      crxCreator.generateCrxFile(srcPath, fullDestination, options.privateKey);
    });

  };

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