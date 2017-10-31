'use strict';

var assign = require('object-assign');
var axios = require('axios');
var formUrlEncoded = require('form-urlencoded');
var defaults = require('./defaults');
var need = require('./need');
var noop = require('./noop');

module.exports = function refreshTokenFlow(options) {
  var settings = assign({}, {
    tokenUrl: defaults.OAUTH_TOKEN_URL,
    clientId: undefined,
    clientSecret: undefined,
    refreshToken: undefined,
    accessToken: undefined,
    onAccessToken: noop,
    onRefreshToken: noop,
    onNotAuthenticated: noop
  }, options);

  need(settings.clientId, 'You must provide a clientId for refresh token flow');
  need(settings.clientSecret, 'You must provide a clientSecret for refresh token flow');
  need(settings.refreshToken, 'You must provide a refreshToken for refresh token flow');

  return {
      authenticate: settings.onNotAuthenticated,
      getToken: function () {
        return settings.accessToken;
      },
      refreshToken: function () {
        return axios.post(settings.tokenUrl, formUrlEncoded({
          'grant_type': 'refresh_token',
          'client_id': settings.clientId,
          'client_secret': settings.clientSecret,
          'refresh_token': settings.refreshToken
        }))
        .then(function (result) {
          /*jshint camelcase: false */
          var expiresIn = result.data.expires_in * 1000;

          settings.accessToken = result.data.access_token;
          settings.refreshToken = result.data.refresh_token;
          settings.onAccessToken(settings.accessToken, expiresIn);
          settings.onRefreshToken(settings.refreshToken);

          return {
            refreshToken: settings.refreshToken,
            accessToken: settings.accessToken,
            expiresIn: expiresIn
          };
        });
      }
  };
};
