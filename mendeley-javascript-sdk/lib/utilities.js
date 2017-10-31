'use strict';

var Request = require('./request');
var assign = require('object-assign');
var pagination = require('./pagination');

/**
 * Utilities
 *
 * @namespace
 * @name utilities
 */
module.exports = {
    passFilter: passFilter,
    requestFun: requestFun,
    requestWithDataFun: requestWithDataFun,
    requestWithFileFun: requestWithFileFun,
    paginationFilter:  pagination.filter
};

/**
 * Pass the second argument as it is. This is to allow receiving non-standard
 * API responses (no 'data' property in response body).
 *
 * @param {object} options Additional options, ignored in this case
 * @param {object} response Response body
 * @returns {object} Untouched response body
 */
function passFilter(options, response) {
    return response;
}

function dataFilter(options, response) {
    return response.data;
}

function normaliseOptions(options) {
  options.requestFilter = options.requestFilter || passFilter;
  options.responseFilter = options.responseFilter || dataFilter;
  options.args = options.args || [];
  options.headers = options.headers || {};

  return options;
}

/**
 * Determines of the HTTP request was successful or not based on the response
 * HTTP result code. This is to allow treating HTTP redirects as successful as
 * axios handles them as failed by default.
 *
 * @private
 * @param {number} status HTTP status code number
 * @returns {bool} Result says if the request was successful or not
 */
function allowRedirectHttpCodes(status) {
    return status >= 200 && status < 400;
}

/**
 * A general purpose request functions
 *
 * @private
 * @param {function} [responseFilter] - Optional filter to control which part of the response the promise resolves with
 * @param {string} method
 * @param {string} uriTemplate
 * @param {array} uriVars
 * @param {array} headers
 * @returns {function}
 */
function requestFun(options) {
    options = normaliseOptions(options);

    return function() {
        var args = Array.prototype.slice.call(arguments, 0);
        var url = getUrl(options, args);
        var params = args[options.args.length];

        var request = {
            method: options.method,
            responseType: 'json',
            url: url,
            headers: getRequestHeaders(options.headers),
            params: params
        };

        if (options.noFollow) {
            request.maxRedirects = 0;
            request.validateStatus = allowRedirectHttpCodes;
        }

        var settings = {
            authFlow: options.authFlow()
        };

        if (options.method === 'GET') {
            settings.maxRetries = 1;
        }

        // pass-through axios property for how querystring params are serialized.
        if(options.paramsSerializer) {
            request.paramsSerializer = options.paramsSerializer;
        }

        request = options.requestFilter(options, request);

        return Request.create(request, settings)
            .send()
            .then(options.responseFilter.bind(null, options));
    };
}

/**
 * Get a request function that sends data i.e. for POST, PUT, PATCH
 * The data will be taken from the calling argument after any uriVar arguments.
 *
 * @private
 * @param {function} [responseFilter] - Optional filter to control which part of the response the promise resolves with
 * @param {string} method - The HTTP method
 * @param {string} uriTemplate - A URI template e.g. /documents/{id}
 * @param {array} uriVars - The variables for the URI template in the order
 * they will be passed to the function e.g. ['id']
 * @param {object} headers - Any additional headers to send
 *  e.g. { 'Content-Type': 'application/vnd.mendeley-documents+1.json'}
 * @param {bool} followLocation - follow the returned location header? Default is false
 * @returns {function}
 */
function requestWithDataFun(options) {
    options = normaliseOptions(options);

    return function() {
        var args = Array.prototype.slice.call(arguments, 0);
        var url = getUrl(options, args);
        var data = args[options.args.length];
        var request = {
            method: options.method,
            url: url,
            headers: getRequestHeaders(options.headers, data),
            data: data
        };

        var settings = {
            authFlow: options.authFlow(),
            followLocation: options.followLocation
        };

        request = options.requestFilter(options, request);

        return Request.create(request, settings)
            .send()
            .then(options.responseFilter.bind(null, options));
    };
}

/**
 * Get a request function that sends a file
 *
 * @private
 * @param {function} [responseFilter] - Optional filter to control which part of the response the promise resolves with
 * @param {string} method
 * @param {string} uriTemplate
 * @param {string} linkType - Type of the element to link this file to
 * @param {object} headers - Any additional headers to send
 * @returns {function}
 */
function requestWithFileFun(options) {
    options = normaliseOptions(options);

    return function() {
        var args = Array.prototype.slice.call(arguments, 0);
        var url = getUrl(options, args);
        var file = args[0];
        var linkId = args[1];
        var requestHeaders = assign({}, getRequestHeaders(uploadHeaders(options, file, linkId), options.method), options.headers);
        var progressHandler;

        if (typeof args[args.length - 1] === 'function') {
            progressHandler = args[args.length - 1];
        }

        var request = {
            method: options.method,
            url: url,
            headers: requestHeaders,
            data: file,
            onUploadProgress: progressHandler,
            onDownloadProgress: progressHandler
        };

        var settings = {
            authFlow: options.authFlow()
        };

        request = options.requestFilter(options, request);

        return Request.create(request, settings)
            .send()
            .then(options.responseFilter.bind(null, options));
    };
}

/**
 * Provide the correct encoding for UTF-8 Content-Disposition header value.
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
 *
 * @private
 * @param {string} str
 * @returns {string}
 */
function encodeRFC5987ValueChars(str) {
    return encodeURIComponent(str).
        replace(/'/g, '%27').
        replace(/\(/g, '%28').
        replace(/\)/g, '%29').
        replace(/\*/g, '%2A');
}

/**
 * Get headers for an upload
 *
 * @private
 * @param {object} file
 * @param {string} [file.type='application/octet-stream'] Value for the Content-Type header
 * @param {string} file.name File name e.g. 'foo.pdf'
 * @param {string} linkId
 * @param {string} linkType either 'group' or 'document'
 * @returns {object}
 */
function uploadHeaders(options, file, linkId) {
    var headers = {
        'Content-Type': !!file.type ? file.type : 'application/octet-stream',
        'Content-Disposition': 'attachment; filename*=UTF-8\'\'' + encodeRFC5987ValueChars(file.name)
    };
    if (options.linkType && linkId) {
        var baseUrl = options.baseUrl(options.method, options.resource, options.headers);

        switch(options.linkType) {
            case 'group':
                headers.Link = '<' + baseUrl + '/groups/' + linkId +'>; rel="group"';
                break;
            case 'document':
                headers.Link = '<' + baseUrl + '/documents/' + linkId +'>; rel="document"';
                break;
        }
    }

    return headers;
}

/**
 * Generate a URL from a template with properties and values
 *
 * @private
 * @param {string} uriTemplate
 * @param {array} uriProps
 * @param {array} uriValues
 * @returns {string}
 */
function getUrl(options, args) {
    var baseUrl = options.baseUrl(options.method, options.resource, options.headers);

    if (!options.args.length) {
        return baseUrl + options.resource;
    }

    var uriParams = {};

    options.args.forEach(function(prop, index) {
        uriParams[prop] = args[index];
    });

    return baseUrl + expandUriTemplate(options.resource, uriParams);
}

/**
 * Get the headers for a request
 *
 * @private
 * @param {array} headers
 * @param {array} data
 * @returns {array}
 */
function getRequestHeaders(headers, data) {
    for (var headerName in headers) {
        var val = headers[headerName];
        if (typeof val === 'function') {
            headers[headerName] = val(data);
        }
    }

    return headers;
}

/**
 * Populate a URI template with data
 *
 * @private
 * @param {string} template
 * @param {object} data
 * @returns {string}
 */
function expandUriTemplate(template, data) {
    var matches = template.match(/\{[a-z]+\}/gi);
    matches.forEach(function(match) {
        var prop = match.replace(/[\{\}]/g, '');
        if (!data.hasOwnProperty(prop)) {
            throw new Error('Endpoint requires ' + prop);
        }
        template = template.replace(match, data[prop]);
    });

    return template;
}
