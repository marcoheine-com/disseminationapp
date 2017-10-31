'use strict';

var axios = require('axios');
var Promise = require('../../../lib/promise-proxy');

process.on('unhandledRejection', function() {});

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

// Get a function to return promises in order
function getMockPromises() {
    var responses = Array.prototype.slice.call(arguments);
    var calls = 0;
    return function() {
        return responses[calls++];
    };
}

describe('request', function() {
    var request = require('../../../lib/request');
    var mockAuth = require('../../mocks/auth');

    it('should have a request type property', function() {
        var myRequest = request.create({ method: 'get' }, { authFlow: mockAuth.mockImplicitGrantFlow() });
        expect(myRequest.request.method).toBe('get');
    });

    it('should have allow setting the type to whatever you like', function() {
        var myRequest = request.create({ method: 'POST' }, { authFlow: mockAuth.mockImplicitGrantFlow() });
        expect(myRequest.request.method).toBe('POST');
    });

    it('should remove headers without a value', function(done) {
        var myRequest = request.create({ method: 'POST', headers: {
          foo: undefined
        } }, { authFlow: mockAuth.mockImplicitGrantFlow() });

        var fun = getMockPromises(
            Promise.resolve({ status: 200, headers: {} })
        );
        spyOn(axios, 'request').and.callFake(fun);

        myRequest.send().then(_finally, _finally);

        function _finally() {
            expect(myRequest.request.headers.hasOwnProperty('foo')).toBe(false);
            done();
        }
    });

    describe('authentication', function() {

        it('should add optional accessToken to the Authorization header', function(done) {
            var myRequest = request.create({ method: 'get' }, { authFlow: mockAuth.mockImplicitGrantFlow() });
            var fun = getMockPromises(
                Promise.resolve({ status: 200, headers: {} })
            );
            spyOn(axios, 'request').and.callFake(fun);

            myRequest.send().then(_finally, _finally);

            function _finally() {
                expect(myRequest.request.headers.Authorization).toEqual('Bearer auth');
                done();
            }
        });
    });

    describe('authentication failures', function() {

        it('should try calling authFlow.refreshToken() if using authCodeFlow', function(done) {
            var mockAuthInterface = mockAuth.mockAuthCodeFlow();
            var myRequest = request.create({ method: 'get' }, { authFlow: mockAuthInterface });
            var fun = getMockPromises(
                Promise.reject({ response: { status: 401 } }), // Auth failure
                Promise.resolve({ status: 200, headers: {} }) // Original request success
            );
            var ajaxSpy = spyOn(axios, 'request').and.callFake(fun);
            var authRefreshSpy = spyOn(mockAuthInterface, 'refreshToken').and.callThrough();

            myRequest.send().then(function() {
                expect(authRefreshSpy.calls.count()).toEqual(1);
                expect(ajaxSpy.calls.count()).toEqual(2);
                expect(ajaxSpy.calls.mostRecent().args[0].headers.Authorization).toEqual('Bearer auth-refreshed');
                done();
            });
        });

        it('should fail and call authenticate if cannot refresh token', function(done) {
            var mockAuthInterface = mockAuth.mockAuthCodeFlow();
            var myRequest = request.create({ method: 'get' }, { authFlow: mockAuthInterface });
            var fun = getMockPromises(
                Promise.reject({ response: { status: 401 } }), // Auth failure
                Promise.resolve({ status: 200, headers: {} }) // Original request success
            );
            var ajaxSpy = spyOn(axios, 'request').and.callFake(fun);
            var authRefreshSpy = spyOn(mockAuthInterface, 'refreshToken').and.returnValue(Promise.reject({ status: 500 }));
            var authAuthenticateSpy = spyOn(mockAuthInterface, 'authenticate').and.callThrough();

            myRequest.send().catch(function() {
                expect(ajaxSpy.calls.count()).toEqual(1);
                expect(authRefreshSpy.calls.count()).toEqual(1);
                expect(authAuthenticateSpy.calls.count()).toEqual(1);
                done();
            });
        });

        it('should NOT do more than maxAuthRetries', function(done) {
            var mockAuthInterface = mockAuth.mockAuthCodeFlow();
            var myRequest = request.create({ method: 'get' }, { maxAuthRetries: 2, authFlow: mockAuthInterface });

            var ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.reject(mockAuth.unauthorisedError));
            var authRefreshSpy = spyOn(mockAuthInterface, 'refreshToken').and.callThrough();
            var authAuthenticateSpy = spyOn(mockAuthInterface, 'authenticate').and.callThrough();

            myRequest.send().catch(function() {
                expect(ajaxSpy.calls.count()).toEqual(3);
                expect(authRefreshSpy.calls.count()).toEqual(2);
                expect(authAuthenticateSpy.calls.count()).toEqual(1);
            }).then(done, done);
        });

        it('should NOT exceed maxAuthRetries for multiple requests', function(done) {
            var mockAuthInterface = mockAuth.slowAuthCodeFlow();
            var ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.reject(mockAuth.unauthorisedError));
            var authRefreshSpy = spyOn(mockAuthInterface, 'refreshToken').and.callThrough();
            var authAuthenticateSpy = spyOn(mockAuthInterface, 'authenticate').and.callThrough();

            Promise.all([
                request.create({ method: 'get' }, { authFlow: mockAuthInterface }).send(),
                request.create({ method: 'get' }, { authFlow: mockAuthInterface }).send()
            ]).catch(function() {
                expect(ajaxSpy.calls.count()).toEqual(1);
                expect(authRefreshSpy.calls.count()).toEqual(1);
                expect(authAuthenticateSpy.calls.count()).toEqual(1);
                done();
            });
        });

        it('should not make multiple concurrent requests to refresh an access token', function(done) {
            var mockAuthInterface = mockAuth.slowAuthCodeFlow();
            var ajaxSpy = spyOn(axios, 'request').and.callFake(function (config) {
                if (config.headers.Authorization === 'Bearer auth-refreshed-1') {
                    return Promise.resolve({ status: 200, headers: {} });
                }

                return Promise.reject({
                    response: mockAuth.unauthorisedError
                });
            });
            var authRefreshSpy = spyOn(mockAuthInterface, 'refreshToken').and.callThrough();

            Promise.all([
                request.create({ method: 'get' }, { authFlow: mockAuthInterface }).send(),
                request.create({ method: 'get' }, { authFlow: mockAuthInterface }).send(),
                request.create({ method: 'get' }, { authFlow: mockAuthInterface }).send(),
                request.create({ method: 'get' }, { authFlow: mockAuthInterface }).send(),
                request.create({ method: 'get' }, { authFlow: mockAuthInterface }).send()
            ])
            .then(function() {
                expect(authRefreshSpy.calls.count()).toEqual(1);
                expect(ajaxSpy.calls.count()).toEqual(5);
                expect(ajaxSpy.calls.mostRecent().args[0].headers.Authorization).toEqual('Bearer auth-refreshed-1');
                expect(mockAuthInterface.getToken()).toEqual('auth-refreshed-1');
                done();
            });
        });

        it('should propagate the refresh error if authenticate throws', function(done) {
            var refreshError = new Error('refresh error');
            var mockAuthInterface = mockAuth.mockAuthCodeFlow();
            var myRequest = request.create({ method: 'get' }, { authFlow: mockAuthInterface });
            spyOn(axios, 'request').and.returnValue(Promise.reject({ response: { status: 401 } }));
            spyOn(mockAuthInterface, 'refreshToken').and.returnValue(Promise.reject(refreshError));

            myRequest.send().catch(function(caughtError) {
                expect(refreshError).toEqual(caughtError);
                done();
            });
        });
    });

    describe('timeout failures', function() {
        it('should NOT retry by default', function(done) {
            var myRequest = request.create({ method: 'get' }, { authFlow: mockAuth.mockImplicitGrantFlow() });
            var fun = getMockPromises(
                Promise.reject(mockAuth.unauthorisedError),
                Promise.resolve({ status: 200, headers: {} })
            );
            var ajaxSpy = spyOn(axios, 'request').and.callFake(fun);

            myRequest.send().then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy.calls.count()).toEqual(1);
                done();
            }
        });

        it('should allow setting maximum number of retries', function(done) {
            var myRequest = request.create({ method: 'get' }, { maxRetries: 1, authFlow: mockAuth.mockImplicitGrantFlow() });
            var fun = getMockPromises(
                Promise.reject(mockAuth.timeoutError),
                Promise.resolve({ status: 200, headers: {} })
            );
            var ajaxSpy = spyOn(axios, 'request').and.callFake(fun);

            myRequest.send().then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy.calls.count()).toEqual(2);
                done();
            }
        });


        it('should NOT do more than maxRetries', function(done) {
            var myRequest = request.create({ method: 'get' }, { maxRetries: 1, authFlow: mockAuth.mockImplicitGrantFlow() });
            var fun = getMockPromises(
                Promise.reject(mockAuth.timeoutError),
                Promise.reject(mockAuth.timeoutError),
                Promise.resolve({ status: 200, headers: {} })
            );
            var ajaxSpy = spyOn(axios, 'request').and.callFake(fun);

            myRequest.send().catch(function() {
                expect(ajaxSpy.calls.count()).toEqual(2);
                done();
            });
        });

        it('should correctly resolve the original deferred', function(done) {
            var myRequest = request.create({ method: 'get' }, { maxRetries: 10, authFlow: mockAuth.mockImplicitGrantFlow() });
            var fun = getMockPromises(
                Promise.reject(mockAuth.timeoutError),
                Promise.reject(mockAuth.timeoutError),
                Promise.reject(mockAuth.timeoutError),
                Promise.reject(mockAuth.timeoutError),
                Promise.reject(mockAuth.timeoutError),
                Promise.reject(mockAuth.timeoutError),
                Promise.reject(mockAuth.timeoutError),
                Promise.reject(mockAuth.timeoutError),
                Promise.reject(mockAuth.timeoutError),
                Promise.resolve({ status: 200, headers: {} })
            );
            var ajaxSpy = spyOn(axios, 'request').and.callFake(fun);

            myRequest.send().then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy.calls.count()).toEqual(10);
                done();
            }
        });

        it('should not cache failing access token promises for single request', function(done) {
            var mockAuthInterface = mockAuth.mockAuthCodeFlow();
            var ajaxSpy = spyOn(axios, 'request').and.returnValues(
                Promise.reject({ response: { status: 401 } }), // request auth fail
                Promise.reject({ response: { status: 401 } }), // request auth fail
                Promise.resolve({ status: 200, headers: {} }) // request success
            );
            var refreshTokenSpy = spyOn(mockAuthInterface, 'refreshToken').and.returnValues(
                Promise.reject({ response: { status: 401 } }), // token request fail
                Promise.resolve({ status: 200, headers: {} }) // token request success
            );

            request.create({ method: 'get' }, { authFlow: mockAuthInterface }).send()
              .catch(function(err) {
                  expect(err.response.status).toEqual(401);
                  expect(ajaxSpy.calls.count()).toEqual(1);
                  expect(refreshTokenSpy.calls.count()).toEqual(1);

                  request.create({ method: 'get' }, { authFlow: mockAuthInterface }).send()
                    .then(function(res) {
                        expect(res.status).toEqual(200);
                        expect(ajaxSpy.calls.count()).toEqual(3);
                        expect(refreshTokenSpy.calls.count()).toEqual(2);
                        done();
                    });
              });
        });
    });

    describe('generic failures', function() {
        it('should NOT retry on generic errors', function(done) {
            var myRequest = request.create({ method: 'get' }, { maxRetries: 1, authFlow: mockAuth.mockImplicitGrantFlow() });
            var fun = getMockPromises(
                Promise.reject(mockAuth.notFoundError),
                Promise.resolve({ status: 200, headers: {} })
            );
            var ajaxSpy = spyOn(axios, 'request').and.callFake(fun);

            myRequest.send().catch(function() {
                expect(ajaxSpy.calls.count()).toEqual(1);
            }).then(done, done);
        });

        it('should retry when a service is temporarily unavailable', function(done) {
            var myRequest = request.create({ method: 'get' }, { maxRetries: 5, authFlow: mockAuth.mockImplicitGrantFlow() });
            var fun = getMockPromises(
                Promise.reject(mockAuth.unavailableError),
                Promise.resolve({ status: 200, headers: {} })
            );
            var ajaxSpy = spyOn(axios, 'request').and.callFake(fun);

            myRequest.send().then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy.calls.count()).toEqual(2);
                done();
            }
        });

        it('should survive vanilla Errors', function(done) {
            var error = new Error('Kaboom!');
            var myRequest = request.create({ method: 'get' }, { maxRetries: 1, authFlow: mockAuth.mockImplicitGrantFlow() });
            var fun = getMockPromises(
                Promise.reject(error),
                Promise.resolve({ status: 200, headers: {} })
            );
            spyOn(axios, 'request').and.callFake(fun);

            myRequest.send().catch(function(e) {
                expect(e).toEqual(error);
            }).then(done, done);
        });
    });
});
