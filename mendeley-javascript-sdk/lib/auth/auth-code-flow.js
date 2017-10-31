'use strict';

var assign = require('object-assign');
var axios = require('axios');
var defaults = require('./defaults');
var cookie = require('./cookie');

module.exports = function authCodeFlow(options) {
    var settings = assign({}, {
      win: window,
      authenticateOnStart: defaults.AUTHENTICATE_ON_START,
      accessTokenCookieName: defaults.ACCESS_TOKEN_COOKIE_NAME,
      scope: defaults.OAUTH_DEFAULT_SCOPE,
      refreshAccessTokenUrl: undefined,

      apiAuthenticateUrl: function () {
        return '/login';
      },
      onNotAuthenticated: function () {
        cookie.clear(settings.win, settings.accessTokenCookieName);

        settings.win.location = settings.apiAuthenticateUrl();
      }
    }, options);

    if (settings.authenticateOnStart && !cookie.get(settings.win, settings.accessTokenCookieName)) {
        settings.onNotAuthenticated();
    }

    if (typeof settings.apiAuthenticateUrl !== 'function') {
      settings.apiAuthenticateUrl = function (url) {
        return url;
      }.bind(null, settings.apiAuthenticateUrl);
    }

    return {
        authenticate: settings.onNotAuthenticated,
        getToken: cookie.get.bind(null, settings.win, settings.accessTokenCookieName),
        refreshToken: function () {
          if (settings.refreshAccessTokenUrl) {
              return axios.get(settings.refreshAccessTokenUrl);
          }

          return false;
        }
    };
};
