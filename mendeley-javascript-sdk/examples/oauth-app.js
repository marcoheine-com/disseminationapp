/*jshint camelcase: false */
module.exports = function(app, config) {

    'use strict';

    var oauth2 = require('simple-oauth2')({
        site: 'https://api.mendeley.com',
        clientID: config.clientId,
        clientSecret: config.clientSecret
    });

    var cookieParser = require('cookie-parser');
    var sdk = require('../lib/api');
    var Promise = require('../lib/promise-proxy');
    var accessTokenCookieName = 'accessToken';
    var refreshTokenCookieName = 'refreshToken';
    var examplesPath = '/examples';
    var tokenExchangePath = '/oauth/token-exchange';

    app.use(cookieParser());

    app.use(function(req, res, next) {
        res.locals.authFlow = serverClientCredentialsFlow(req, res);
        sdk.setAuthFlow(res.locals.authFlow);
        next();
    });

    app.get('/', function(req, res) {
        var token = res.locals.authFlow.getToken();

        if (!token) {
            console.log('No token set - authenticate');
            res.locals.authFlow.authenticate();
        } else {
            console.log('Access token set, redirecting to', examplesPath);
            res.redirect(examplesPath);
        }
    });

    app.get('/profile', function(req, res) {
        sdk.profiles.retrieve('185e304e-af77-3ce2-9d69-f68f60d2ee4f').then(function(docs) {
            res.send(JSON.stringify(docs));
        }).catch(function(reason) {
            res.status(reason.status).send();
        })
    });

    app.get(tokenExchangePath, function (req, res, next) {
        console.log('Starting token exchange');
        var code = req.query.code;

        oauth2.authCode.getToken({
            redirect_uri: config.redirectUri,
            code: code,
        }, function(error, result) {
            if (error) {
                console.log('Error exchanging token', error);
                res.redirect('/logout');
            } else {
                setCookies(res, result);
                res.redirect(examplesPath);
            }
        });
    });

    app.get('/login', function(req, res) {
        console.log('Logging in, clearing any existing cookies');
        res.clearCookie(accessTokenCookieName);
        res.clearCookie(refreshTokenCookieName);
        res.locals.authFlow.authenticate();
    });

    app.get('/oauth/refresh', function(req, res, next) {
        res.set('Content-Type', 'application/json');

        res.locals.authFlow.refreshToken().then(function() {
            return {
                json: '{ message: "Refresh token succeeded" }',
                status: 200
            };
        }).catch(function() {
            return {
                status: 401,
                json: '{ message: "Refresh token invalid" }'
            };
        }).then(function(result) {
            res.status(result.status).send(result.json);
        });
    });

    function setCookies(res, token) {
        res.cookie(accessTokenCookieName, token.access_token, { maxAge: token.expires_in * 1000 });
        res.cookie(refreshTokenCookieName, token.refresh_token, { httpOnly: true });
    }

    function serverAuthCodeFlow(req, res) {
        var accessToken = req.cookies[accessTokenCookieName];
        var refreshToken = req.cookies[refreshTokenCookieName];

        return {

            authenticate: function() {
                var authorizationUri = oauth2.authCode.authorizeURL({
                    redirect_uri: config.redirectUri,
                    scope: config.scope || 'all'
                });

                console.log('No cookie defined, redirecting to', authorizationUri);
                res.redirect(authorizationUri);
            },

            getToken: function() {
                return accessToken;
            },

            refreshToken: function() {
                if (!refreshToken) {
                    return Promise.reject(new Error('No refresh token'));
                } else {
                    return new Promise(function(resolve, reject) {
                        oauth2.accessToken.create({
                            access_token: accessToken,
                            refresh_token: refreshToken
                        }).refresh(function(error, result) {
                            if (error) {
                                console.log('Error while refreshing token', error);
                                reject(error);
                            } else {
                                accessToken = result.token.access_token;
                                refreshToken = result.token.refresh_token;
                                setCookies(res, result.token);
                                resolve();
                            }
                        });
                    });
                }
            }

        };
    }


    function serverClientCredentialsFlow(req, res) {
        var accessToken = req.cookies[accessTokenCookieName];

        return {

            authenticate: function() {},

            getToken: function() {
                return accessToken;
            },

            refreshToken: function() {
                console.log('Refreshing token');
                return new Promise(function(resolve, reject) {
                    oauth2.client.getToken({
                        scope: 'all'
                    }, function(error, token) {
                        if (error) {
                            reject(error);
                        } else {
                            accessToken = token.access_token;
                            resolve();
                        }
                    });
                });
            }

        };
    }

};
