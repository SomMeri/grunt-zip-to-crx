# grunt-zip-to-crx

> Converts zipped file into chrome extension file (.crx).

The plugin generates [chrome extension](https://developer.chrome.com/extensions) files (.crx) from zipped projects. It is meant to be used together with [grunt-contrib-compress](https://github.com/gruntjs/grunt-contrib-compress#readme) plugin.

Chrome extension bundles all its content inside a zipped file. The zip file must be signed and distributed along with signature inside file with .crx suffix. This plugin is not able to generate zip itself, mostly because [grunt-contrib-compress](https://github.com/gruntjs/grunt-contrib-compress#readme) does a good job and is actively maintained. 

This plugin takes generated .zip file, signs it and 

Note: there is another project [grunt-crx](https://github.com/oncletom/grunt-crx) able to generate .crx files. Its main advantage is that it is able to both zip files and sign files. Its main disadvantage is that it is slow and copies/deletes a lot of files.

## Dependencies
The project requires [`openssl`](http://www.openssl.org/) installed and available on path. Windows and solaris distributions are available [here](https://www.openssl.org/related/binaries.html).

Note: If I will have time, I will remove this dependency. Unfortunately, that reuqires me to decode/encode ans1 files. Altrough decoder is available, I did not found encoder yet.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-zip-to-crx --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-zip-to-crx');
```

## The "zip_to_crx" task

### Overview
In your project's Gruntfile, add a section named `zip_to_crx` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  zip_to_crx: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### Options

#### options.separator
Type: `String`
Default value: `',  '`

A string value that is used to do something with whatever.

#### options.punctuation
Type: `String`
Default value: `'.'`

A string value that is used to do something else with whatever else.

### Usage Examples

#### Default Options
In this example, the default options are used to do something with whatever. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result would be `Testing, 1 2 3.`

```js
grunt.initConfig({
  zip_to_crx: {
    options: {},
    files: {
      'dest/default_options': ['src/testing', 'src/123'],
    },
  },
});
```

#### Custom Options
In this example, custom options are used to do something else with whatever else. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result in this case would be `Testing: 1 2 3 !!!`

```js
grunt.initConfig({
  zip_to_crx: {
    options: {
      separator: ': ',
      punctuation: ' !!!',
    },
    files: {
      'dest/default_options': ['src/testing', 'src/123'],
    },
  },
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
