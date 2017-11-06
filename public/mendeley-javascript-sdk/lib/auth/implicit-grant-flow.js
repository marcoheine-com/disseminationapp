'use strict';

var assign = require('object-assign');
var qs = require('querystring');
var cookie = require('./cookie');
var defaults = require('./defaults');
var need = require('./need');

function getAccessTokenCookieOrUrl(win, name) {
    var cookieValue = cookie.get(win, name);
    var hashParts = (win.location.hash || '').split('=');
    var hash = null;

    if (hashParts[0] === '#access_token') {
      hash = hashParts[1];
    }

    if (hash && !cookieValue) {
        cookie.set(win, name, hash);
        return hash;
    }

    if (!hash && cookieValue) {
        return cookieValue;
    }

    if (hash && cookieValue) {
        if (hash !== cookieValue) {
            cookie.set(win, name, hash);
            return hash;
        }
        return cookieValue;
    }

    return '';
}

module.exports = function implicitGrantFlow(options) {
    var settings = assign({}, {
      win: window,
      authenticateOnStart: true,
      accessTokenCookieName: defaults.ACCESS_TOKEN_COOKIE_NAME,
      scope: defaults.OAUTH_DEFAULT_SCOPE,
      clientId: false,
      redirectUrl: null,
      apiAuthenticateUrl: function () {
        return defaults.OAUTH_AUTHORISE_URL;
      },
      onNotAuthenticated: function () {
        cookie.clear(settings.win, settings.accessTokenCookieName);

        settings.win.location = settings.apiAuthenticateUrl();
      }
    }, options);

    need(settings.clientId, 'You must provide a clientId for implicit grant flow');

    // OAuth redirect url defaults to current url, without hash part or querystring
    if (!settings.redirectUrl) {
      settings.redirectUrl = settings.win.location.origin + settings.win.location.pathname;
    }

    var apiAuthenticateUrl = settings.apiAuthenticateUrl() +
        '?' + qs.stringify({
          'client_id': settings.clientId,
          'redirect_uri': settings.redirectUrl,
          'scope': settings.scope,
          'response_type': 'token'
        });

    settings.apiAuthenticateUrl = function () {
      return apiAuthenticateUrl;
    };

    if (settings.authenticateOnStart && !getAccessTokenCookieOrUrl(settings.win, settings.accessTokenCookieName)) {
        settings.onNotAuthenticated();
    }

    return {
        authenticate: settings.onNotAuthenticated,
        getToken: getAccessTokenCookieOrUrl.bind(null, settings.win, settings.accessTokenCookieName),
        refreshToken: function () {
          return false;
        }
    };
};
