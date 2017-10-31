'use strict';

var axios = require('axios');
var assign = require('object-assign');
var Promise = require('./promise-proxy');

var defaults = {
    authFlow: false,
    maxRetries: 0,
    maxAuthRetries: 1,
    followLocation: false
};

function create(request, settings) {
    return new Request(request, assign({}, defaults, settings));
}

function Request(request, settings) {
    if (!settings.authFlow) {
        throw new Error('Please provide an authentication interface');
    }
    this.request = request;
    this.settings = settings;
    this.retries = 0;
    this.authRetries = 0;
}

function send(request) {
    request = request || this.request;

    var token = this.settings.authFlow.getToken();

    // If no token at all (cookie deleted or expired), attempt to refresh token
    if (!token) {
        if (this.authRetries < this.settings.maxAuthRetries) {
            this.authRetries++;
            return refreshToken.call(this);
        } else {
            this.settings.authFlow.authenticate();
            throw new Error('maxAuthRetries exceeded');
        }
    }

    // remove any headers without values because axios objects to them
    for (var key in request.headers) {
        if (request.headers[key] === null || request.headers[key] === undefined) {
            delete request.headers[key];
        }
    }

    // add default accept header
    request.headers = assign({
        Accept: ''
    }, request.headers);

    // add auth header
    request.headers.Authorization = 'Bearer ' + token;

    request.method = request.method.toLowerCase();

    return axios.request(request)
        .then(onDone.bind(this))
        .catch(onFail.bind(this));
}

function onFail(error) {
    if (!error.response) {
        throw error;
    }

    switch (error.response.status) {
        case 0:
        case 503:
            // 503 Service unavailable
        case 504:
            // 504 Gateway timeout or communication error
            if (this.retries < this.settings.maxRetries) {
                this.retries++;
                return this.send();
            } else {
                throw error;
            }
            break;

        case 401:
            // 401 Unauthorized
            if (this.authRetries < this.settings.maxAuthRetries) {
                this.authRetries++;
                return refreshToken.call(this);
            } else {
                this.settings.authFlow.authenticate();
                throw error;
            }
            break;

        default:
            throw error;
    }
}

function onDone(response) {
    var locationHeader = response.headers.location;

    if (locationHeader && this.settings.followLocation && response.status === 201) {
        var redirect = {
            method: 'GET',
            url: locationHeader,
            responseType: 'json'
        };

        return this.send(redirect);
    } else {
        if (response.headers.link && typeof response.headers.link === 'string') {
            response.headers.link = extractLinkHeaders(response.headers.link);
        }

        return response;
    }
}

function refreshToken() {
    var authFlow = this.settings.authFlow;

    // if we are already in the middle of requesting an access token, wait for
    // the result of that request instead of making a new one
    if (authFlow._refreshTokenPromise) {
        return authFlow._refreshTokenPromise.then(function () {
            return this.send();
        }.bind(this));
    }

    var refresh = this.settings.authFlow.refreshToken();

    if (refresh) {
        var promise = refresh
            // If fails then we need to re-authenticate
            .catch(function(refreshError) {
                // Make sure we can request new refresh tokens in the future
                delete authFlow._refreshTokenPromise;

                try {
                    this.settings.authFlow.authenticate();
                } catch(authenticationError) {
                    // If authenticate throws, we want to propagate the refresh error
                    throw refreshError;
                }
            }.bind(this))
            // If OK update the access token and re-send the request
            .then(function() {
                // Make sure we can request new refresh tokens in the future
                delete authFlow._refreshTokenPromise;

                // Resend the request
                return this.send();
            }.bind(this));

        authFlow._refreshTokenPromise = promise;

        return promise;
    } else {
        this.settings.authFlow.authenticate();
        return Promise.reject(new Error('No token'));
    }
}

function extractLinkHeaders(links) {
    // Tidy into nice object like {next: 'http://example.com/?p=1'}
    var tokens, url, rel, linksArray = links.split(','), value = {};
    for (var i = 0, l = linksArray.length; i < l; i++) {
        tokens = linksArray[i].split(';');
        url = tokens[0].replace(/[<>]/g, '').trim();
        rel = tokens[1].trim().split('=')[1].replace(/"/g, '');
        value[rel] = url;
    }

    return value;
}

Request.prototype = {
    send: send
};

module.exports = {
    create: create
};
