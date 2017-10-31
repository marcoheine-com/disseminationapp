'use strict';

var assign = require('object-assign');
var axios = require('axios');
var formUrlEncoded = require('form-urlencoded');
var defaults = require('./defaults');
var need = require('./need');
var noop = require('./noop');

module.exports = function clientCredentialsFlow(options) {
  var settings = assign({}, {
    tokenUrl: 'https://api.mendeley.com/oauth/token',
    clientId: undefined,
    clientSecret: undefined,
    redirectUri: undefined,
    scope: defaults.OAUTH_DEFAULT_SCOPE,
    onAccessToken: noop,
    onNotAuthenticated: function() {
      // Client credentials auth flow only refreshes
      throw new Error('Cannot authenticate');
    }
  }, options);

  need(settings.clientId, 'You must provide a clientId for client credentials flow');
  need(settings.clientSecret, 'You must provide a clientSecret for client credentials flow');
  need(settings.redirectUri, 'You must provide a redirectUri for client credentials flow');

  return {
    authenticate: settings.onNotAuthenticated,
    getToken: function () {
      return settings.accessToken;
    },
    refreshToken: function () {
      return axios.post(settings.tokenUrl, formUrlEncoded({
        'grant_type': 'client_credentials',
        'client_id': settings.clientId,
        'client_secret': settings.clientSecret,
        'redirect_uri': settings.redirectUri,
        'scope': settings.scope
      }))
      .then(function (result) {
        /*jshint camelcase: false */
        var expiresIn = result.data.expires_in * 1000;

        settings.accessToken = result.data.access_token;
        settings.onAccessToken(settings.accessToken, expiresIn);

        return {
          accessToken: settings.accessToken,
          expiresIn: expiresIn
        };
      });
    }
  };
};
