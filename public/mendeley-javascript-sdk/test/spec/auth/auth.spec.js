'use strict';

var axios = require('axios');
var Promise = require('../../../lib/promise-proxy');

if (typeof process === 'object' && process + '' === '[object process]') {
    global.window = {};
}

describe('auth', function() {

    var mockWindow = require('../../mocks/window');
    var auth = require('../../../lib/auth');

    describe('implicit grant flow', function() {
        it('should authenticate on start by default', function() {
            var win = mockWindow();
            var options = {win: win, clientId: 9999};

            auth.implicitGrantFlow(options);
            expect(win.location).toMatch(new RegExp('^https://api.mendeley.com/oauth/authorize?.+'));
        });

        it('should NOT authenticate on start if authenticateOnStart: false', function() {
            var win = mockWindow('https:', 'example.com', '/app');
            var options = {win: win, clientId: 9999, authenticateOnStart: false};
            auth.implicitGrantFlow(options);
            expect(win.location.toString()).toEqual('https://example.com/app');
        });

        it('should trigger a redirect on calling authenticate()', function() {
            var win = mockWindow();
            var options = {win: win, clientId: 9999, authenticateOnStart: false};

            auth.implicitGrantFlow(options).authenticate();
            expect(win.location).toMatch(new RegExp('^https://api.mendeley.com/oauth/authorize?.+'));
        });

        it('should allow specifying a redirect url', function() {
            var win = mockWindow();
            var redirectUrl = 'http://foo.com';
            var options = {win: win, clientId: 9999, authenticateOnStart: true, redirectUrl: redirectUrl};

            auth.implicitGrantFlow(options);
            expect(win.location).toMatch(new RegExp(encodeURIComponent(redirectUrl)));
        });

        it('should read the access token from a cookie', function() {
            var win = mockWindow();
            win.document.cookie = 'accessToken=auth';
            var options = {win: win, clientId: 9999};

            var flow = auth.implicitGrantFlow(options);
            expect(flow.getToken()).toEqual('auth');
        });

        it('should read the access token from a URL hash', function() {
            var win = mockWindow('https:', 'example.com', 'app', '#access_token=auth');
            var options = {win: win, clientId: 9999};

            var flow = auth.implicitGrantFlow(options);
            expect(flow.getToken()).toEqual('auth');
        });

        it('should prefer an access token in the hash over the URL', function() {
            var win = mockWindow('https:', 'example.com', 'app', '#access_token=hash-auth');
            win.document.cookie = 'accessToken=cookie-auth';
            var options = {win: win, clientId: 9999};

            var flow = auth.implicitGrantFlow(options);
            expect(flow.getToken()).toEqual('hash-auth');
        });

        it('should NOT support refresh token URL', function() {
            var win = mockWindow();
            var options = {win: win, clientId: 9999, refreshAccessTokenUrl: '/refresh'};

            var flow = auth.implicitGrantFlow(options);
            expect(flow.refreshToken()).toBe(false);
        });

    });

    describe('auth code flow', function() {
        it('should authenticate on start by default', function() {
            var win = mockWindow();
            var options = {win: win, clientId: 9999};

            auth.authCodeFlow(options);
            expect(win.location).toEqual('/login');
        });

        it('should NOT authenticate on start if authenticateOnStart: false', function() {
            var win = mockWindow('https:', 'example.com', '/app');
            var options = {win: win, clientId: 9999, authenticateOnStart: false};

            auth.authCodeFlow(options);
            expect(win.location.toString()).toEqual('https://example.com/app');
        });

        it('should trigger a redirect on calling authenticate()', function() {
            var win = mockWindow();
            var options = {win: win, clientId: 9999, authenticateOnStart: false};

            auth.authCodeFlow(options).authenticate();
            expect(win.location).toEqual('/login');
        });

        it('should support using a function to get the auth URL', function() {
            var win = mockWindow();
            var options = {
              win: win,
              clientId: 9999,
              authenticateOnStart: false,
              apiAuthenticateUrl: function() {
                  return '/login?state=foo';
              }
           };

            auth.authCodeFlow(options).authenticate();
            expect(win.location).toEqual('/login?state=foo');
        });

        it('should support using a string to get the auth URL', function() {
            var win = mockWindow();
            var options = {
              win: win,
              clientId: 9999,
              authenticateOnStart: false,
              apiAuthenticateUrl: '/login?state=foo'
           };

            auth.authCodeFlow(options).authenticate();
            expect(win.location).toEqual('/login?state=foo');
        });

        it('should read the access token from a cookie', function() {
            var win = mockWindow();
            win.document.cookie = 'accessToken=auth';
            var options = {win: win, clientId: 9999};

            var flow = auth.authCodeFlow(options);
            expect(flow.getToken()).toEqual('auth');
        });

        it('should NOT read the access token from a URL hash', function() {
            var win = mockWindow('https:', 'example.com', 'app', '#access_token=auth');
            var options = {win: win, clientId: 9999};

            var flow = auth.authCodeFlow(options);
            expect(flow.getToken()).toEqual('');
        });

        it('should support refresh token URL', function() {
            var ajaxRequest;
            var ajaxSpy = spyOn(axios, 'get').and.returnValue(Promise.resolve());
            var win = mockWindow();
            var options = {win: win, clientId: 9999, refreshAccessTokenUrl: '/refresh'};

            var flow = auth.authCodeFlow(options);
            flow.refreshToken();
            expect(ajaxSpy).toHaveBeenCalled();

            ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
            expect(ajaxRequest).toBe('/refresh');
        });

        it('should allow not having a refresh token URL', function() {
            var win = mockWindow();
            var options = {win: win, clientId: 9999, refreshAccessTokenUrl: null};

            var flow = auth.authCodeFlow(options);
            var result = flow.refreshToken();
            expect(result).toBe(false);
        });

    });

    describe('pre auth flow', function() {

        it('should return the previously created access token', function() {
            var authFlow = auth.authenticatedFlow('token1234');
            expect(authFlow.getToken()).toBe('token1234');
        });

    });

    describe('client credentials auth flow', function() {

        it('should require a client id', function() {
            expect(function () {
                auth.clientCredentialsFlow();
            }).toThrow();
        });

        it('should require a client secret', function() {
            expect(function () {
                auth.clientCredentialsFlow({
                    clientId: 5
                });
            }).toThrow();
        });

        it('should require a redirect uri', function() {
            expect(function () {
                auth.clientCredentialsFlow({
                    clientId: 5,
                    clientSecret: 'sssh'
                });
            }).toThrow();
        });

        it('should fetch an access token', function(done) {
            var authFlow = auth.clientCredentialsFlow({
                clientId: 5,
                clientSecret: 'sssh',
                redirectUri: 'https://example.com/foo'
            });

            var accessToken = 'accessToken';
            var ajaxSpy = spyOn(axios, 'post').and.returnValue(Promise.resolve({
                data: {
                    'access_token': accessToken
                }
            }));

            expect(authFlow.getToken()).toBeUndefined();

            authFlow.refreshToken()
            .then(function () {
                expect(authFlow.getToken()).toEqual(accessToken);

                done();
            });

            expect(ajaxSpy).toHaveBeenCalled();
        });

    });

    describe('refresh token auth flow', function() {

        it('should require a client id', function() {
            expect(function () {
                auth.refreshTokenFlow();
            }).toThrow();
        });

        it('should require a client secret', function() {
            expect(function () {
                auth.refreshTokenFlow({
                    clientId: 5
                });
            }).toThrow();
        });

        it('should require a refresh token', function() {
            expect(function () {
                auth.refreshTokenFlow({
                    clientId: 5,
                    clientSecret: 'sssh'
                });
            }).toThrow();
        });

        it('should fetch an access token', function(done) {
            var authFlow = auth.refreshTokenFlow({
                clientId: 5,
                clientSecret: 'sssh',
                refreshToken: 'token'
            });

            var accessToken = 'accessToken';
            var refreshToken = 'newRefreshToken';

            var ajaxSpy = spyOn(axios, 'post').and.returnValue(Promise.resolve({
                data: {
                    'access_token': accessToken,
                    'refresh_token': refreshToken
                }
            }));

            expect(authFlow.getToken()).toBeUndefined();

            authFlow.refreshToken()
            .then(function (result) {
                expect(authFlow.getToken()).toEqual(accessToken);
                expect(result.accessToken).toEqual(accessToken);

                done();
            });

            expect(ajaxSpy).toHaveBeenCalled();
        });
    });
});
