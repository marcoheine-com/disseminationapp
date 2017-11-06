// Karma configuration
// Generated on Fri Sep 12 2014 15:16:30 GMT+0100 (BST)

var webpack = require('webpack');

module.exports = function(config) {

    'use strict';

    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            'node_modules/es5-shim/es5-shim.js',
            'test/spec/**/*.spec.js'
        ],

        // list of files to exclude
        exclude: [
        ],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'lib/**/*.js': 'coverage',
            'test/spec/**/*.spec.js': ['webpack']
        },

        coverageReporter: {
            type: 'html',
            dir: 'coverage/html'
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'coverage'],

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: [
            //'Chrome',
            //'Firefox',
            //'Safari',
            'PhantomJS'
        ],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        webpack: Object.assign( {},
                     require(process.cwd() + '/webpack.config'),
                     { plugins: [new webpack.ProvidePlugin({ Promise: 'es6-promise-promise' })] }
                 ),

        // Prevents webpack from logging stats on all the chunks
        webpackMiddleware: {
            noInfo: true,
            stats: 'errors-only'
        },

        client: {
            captureConsole: false
        }
    });
};
