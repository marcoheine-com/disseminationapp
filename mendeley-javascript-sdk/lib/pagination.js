
var Request = require('./request');
var PAGINATION_LINKS = ['first', 'previous', 'next', 'last'];
var assign = require('object-assign');


module.exports = {
    filter : filter,
    decorate : decorate
};


/**
 * Decorates pagination response with the methods for next/previous/first/last.
 * Used generally for building pagination object from a server called api response. For example:
 *
 * window.__data = JSON.stringify(serverPagination);
 * var clientPagination = pagination.decorate(window.__data);
 *
 * @param {object} data, the pagination.filter object without the handlers.
 * @param {function} authFlow the mendeley authflow to use.
 */
function decorate(data, authFlow) {
    var page = assign({}, data);

    if(!data.pageData || !data.pageData.link || typeof data.pageData.link!=='object') {
        // soft fail
        return page;
    }

    PAGINATION_LINKS.forEach(function (name) {
        var url = data.pageData.link[name];
        if(url) {
            page[name] = getPaginationHandler(url, authFlow, data.pageData.headers);
        }
    });
    return page;
}

/**
 * A responseFilter. Processes the api response and returns items and pagination information.
 * @param {object} options
 * @param {object} response the service response
 * @returns pagination object with items, total and methods to call next, previous, last, first.
 */
function filter (options, response) {
    var headers = response.headers || {};
    var page = {
        items: response.data || []
    };
    page.total = page.items.length;

    if (headers.hasOwnProperty('mendeley-count')) {
        page.total = parseInt(headers['mendeley-count'], 10);
    }

    page.pageData = {
        link: {},
        headers: options.headers
    };

    if (headers.link) {
        PAGINATION_LINKS.forEach(function (name) {
            if (!headers.link[name]) {
                return
            }
            page[name] = getPaginationHandler(headers.link[name], options.authFlow, options.headers, options.responseFilter);
            page.pageData.link[name] = headers.link[name];
        });
    }

    return page;
}


/**
 * Gets a handler that fetches the paginated page.
 *
 * @param {string} url of the pagination link
 * @param {function} authFlow the mendeley authflow to use.
 * @param {object} headers to pass in the request.
 * @param {function} [responseFilter] - Optional filter to control which part of the response the promise resolves with
 */
function getPaginationHandler(url, authFlow, headers, responseFilter) {
    var request = {
        method: 'GET',
        responseType: 'json',
        url: url,
        headers: getRequestHeaders(headers)
    };

    var settings = {
        maxRetries: 1,
        authFlow: authFlow
    };

    if (typeof settings.authFlow === 'function') {
        settings.authFlow = authFlow();
    }

    var options = {
        headers: headers,
        authFlow: authFlow,
        responseFilter: responseFilter || filter
    };

    return function () {
        return Request.create(request, settings)
            .send()
            .then(options.responseFilter.bind(null, options));
    };
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

