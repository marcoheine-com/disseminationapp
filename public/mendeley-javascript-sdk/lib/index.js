'use strict';

var api = require('./api');
var auth = require('./auth');
var request = require('./request');
var mimeTypes = require('./mime-types');
var PromiseProxy = require('./promise-proxy');

// Exports Mendeley SDK
module.exports = function (options) {
    if (!options) {
      throw new Error('Please pass an options object with an authFlow property');
    }

    options.baseUrl = options.baseUrl || 'https://api.mendeley.com';
    options.authFlow = options.authFlow || {};

    if (typeof options.authFlow !== 'function') {
        var authFlow = options.authFlow;

        options.authFlow = function () {
          return authFlow;
        };
    }

    if (typeof options.baseUrl !== 'function') {
        var baseUrl = options.baseUrl;

        options.baseUrl = function () {
          return baseUrl;
        };
    }

    return api(options);
};

module.exports.Auth = auth;
module.exports.Request = request;
module.exports.MimeTypes = mimeTypes;

/**
 * Allows a custom Promise library to be used.
 * The method is chainable to allow ease of use when importing, for example:
 * 
 * var api = require('@mendeley/api').withPromise(require('bluebird'));
 * 
 * @param {Promise} customPromise
 * @returns {function}
 */
module.exports.withPromise = function(customPromise) {
  PromiseProxy.setPromise(customPromise);
  return module.exports;
};
