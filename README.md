# grunt-zip-to-crx

> Generates [chrome extension](https://developer.chrome.com/extensions) files (.crx) from zipped projects.

[![Build Status](https://travis-ci.org/SomMeri/grunt-zip-to-crx.svg?branch=master)](https://travis-ci.org/SomMeri/grunt-zip-to-crx) 
Chrome extension is zipped electronically signed file. Signature is distributed together with packed content inside .crx file. 

This plugin is not able to generate zip itself, mostly because [grunt-contrib-compress](https://github.com/gruntjs/grunt-contrib-compress#readme) does a good job and is actively maintained by grunt team. Use it to pack your extension files. Once you have .zip with `manifest.json` and everything else inside, this plugin will sign it and generate chrome extension (.crx) file.

Resources:
* general chrome extension [documentation](https://developer.chrome.com/extensions),
* crx file [specification](https://developer.chrome.com/extensions/crx).

## External Dependencies
The project requires [`openssl`](http://www.openssl.org/) installed and available on path. Windows and solaris distributions are available [here](https://www.openssl.org/related/binaries.html). 

Note: I would like to remove this dependency. Unfortunately, that requires me to decode/encode ans1 files. Although decoder is available, I did not found encoder yet.

## Alternatives
There is another project [grunt-crx](https://github.com/oncletom/grunt-crx) able to generate .crx files. Its main advantage is ability to both zip files and sign files, so you might want to give it a try. Its main disadvantage is speed - it copies everything into temporary directory, then deletes excluded files and packs the result. This is fine on small projects or when you have all extension files in separate directory. However, it may end up copying a lot of files (whole `.git` directory) on some projects and that was very slow.

## Getting Started
Install this plugin with this command:

```shell
npm install grunt-zip-to-crx --save-dev
```

Installed plugin is enabled inside Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-zip-to-crx');
```

## The "zip_to_crx" task
The zip_to_crx needs to know:
* private key to be used for signing,
* which file(s) should be converted into .crx,
* where to put the result and how to name it.

### Private Key
Private key must be stored in a pem encoded file. OpenSSL is able to [generate](https://www.openssl.org/docs/HOWTO/keys.txt) such files from command line. Use either of these two commands:
```
# generate password protected private key file
openssl genrsa -des3 -out private-key.pem 2048
# generate private key without password
openssl genrsa -out private-key.pem 2048
```

Both create `private-key.pem` file with newly generated private key inside current directory.

### Options
Zip_to_crx task requires `privateKey` option property. Its value must be a string and must contain path to pem encoded private key file.

Example:
```js
options: {
  // Location of pem encoded private key. 
  privateKey: "../ssl-keys/private-key.pem"
}
```

### Source and Destination
Input and output files are configured using the usual `src` and `dest` pairs. Source property `src` may contain either a path towards .zip file or a list of them.

Examples:
* `src: 'path/to/file.zip'`,
* `src: 'all/in/this/directory/*.zip'`
* `src: ['path/to/file.zip', 'different/zipped.zip', 'globbing/*.zip']`.

Destination property `dest` must contain path to single directory ended by a slash `/` or single filename. If the `src`property references multipe files,  then the `dest` must contain directory. 

Examples:
* `dest: 'path/to/file.crx'`,
* `dest: 'path/to/directory/`.

Destination property is optional. If the `dest` does not specify filename, e.g. is empty or contains a directory, plugin guesses output filename from input file name.

### Usage Examples
First three examples show three different ways how to configure zip_to_crx task. Last example shows whole Grunt.js file, including [grunt-contrib-compress](https://github.com/gruntjs/grunt-contrib-compress#readme) part.

#### Crx From All Zip Files
Find all .zip files in `tmp/` directory, sign them and place results into the `distribution` directory:
```js
grunt.initConfig({
  zip_to_crx: {
    options: {
      // Location of pem encoded private key. 
      privateKey: "../ssl-keys/private-key.pem"
    },
    your_target: {
        // all zip files in tmp are assumed to be future extentions
        src: "tmp/*.zip", 
        // .crx will be placed in the distribution directory
        dest: "distribution/"
    },
  },
});
```

#### Crx From One Zip File
Convert `tmp/my-supercool-extension-<version>.zip` into `distribution/my-supercool-extension-<version>.crx` file:
```js
grunt.initConfig({
  zip_to_crx: {
    options: {
      // Location of pem encoded private key. 
      privateKey: "../ssl-keys/private-key.pem"
    },
    your_target: {
        // input zip file
        src: "tmp/my-supercool-extension-<version>.zip", 
        // output .crx file
        dest: "distribution/my-supercool-extension-<version>.crx"
    },
  },
});
```

#### Crx From One Zip File - Alternative
If the `dest` ends with slash `/`, plugin will treat it as a directory. .crx file name is guessed from input .zip file name. This generates the same output file as the previous configuration:
```js
grunt.initConfig({
  zip_to_crx: {
    options: {
      // Location of pem encoded private key. 
      privateKey: "../ssl-keys/private-key.pem"
    },
    your_target: {
        // input zip file
        src: "tmp/my-supercool-extension-<version>.zip", 
        // output .crx file
        dest: "distribution/"
    },
  },
});
```

#### Full Configuration
Example configuration that does both zipping and signing. It generates the same output file as previous two examples:
```js
module.exports = function(grunt) {

  grunt.initConfig({
      compress: {
        main: {
          options: {
            archive: 'tmp/my-supercool-extension.zip'
          },
          files: [
            {src: ['_locales/**']},
            {src: ['doc/**']}, 
            {src: ['icons/**']}, 
            {src: ['lib/**']}, 
            {src: ['skin/**']}, 
            {src: ['src/**']}, 
            {src: ['tests/**']},
            {src: ['manifest.json']}
          ]
        }
      },
    zip_to_crx: {
      options: {
        // Location of pem encoded private key. 
        privateKey: "../ssl-keys/private-key.pem"
      },
      your_target: {
          // input zip file
          src: "tmp/my-supercool-extension.zip", 
          // output .crx file
          dest: "distribution/"
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-zip-to-crx');

  grunt.registerTask('build', ['compress', 'zip_to_crx']);
};
```

## Contributing
Take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
