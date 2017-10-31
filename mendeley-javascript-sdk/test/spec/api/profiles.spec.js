/* jshint camelcase: false */
'use strict';

var axios = require('axios');
var Promise = require('../../../lib/promise-proxy');
var sdk = require('../../../');
var baseUrl = 'https://api.mendeley.com';
var mockAuth = require('../../mocks/auth');

describe('profiles api', function() {
    var profilesApi = sdk({
      baseUrl: baseUrl,
      authFlow: mockAuth.mockImplicitGrantFlow()
    }).profiles;

    var mockPromiseUpdate = Promise.resolve({
        data: [],
        status: 200,
        headers: {
            location: baseUrl + '/profiles/me'
        }
    });

    // Get a function to return promises in order
    function getMockPromises() {
        var responses = Array.prototype.slice.call(arguments);
        var calls = 0;
        return function() {
            return responses[calls++];
        };
    }

    describe('me method', function() {
        var ajaxSpy;
        var ajaxRequest;

        it('should be defined', function(done) {
            expect(typeof profilesApi.me).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve({headers: {}}));
            profilesApi.me().then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            }
        });

        it('should use GET', function() {
            expect(ajaxRequest.method).toBe('get');
        });

        it('should use endpoint /profiles/me', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/profiles/me');
        });

        it('should NOT have a Content-Type header', function() {
            expect(ajaxRequest.headers['Content-Type']).not.toBeDefined();
        });

        it('should have an Authorization header', function() {
            expect(ajaxRequest.headers.Authorization).toBeDefined();
            expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
        });

        it('should NOT have a body', function() {
            expect(ajaxRequest.data).toBeUndefined();
        });

    });

    describe('retrieve method', function() {
        var ajaxSpy;
        var ajaxRequest;

        it('should be defined', function(done) {
            expect(typeof profilesApi.retrieve).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve({headers: {}}));
            profilesApi.retrieve(123).then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            }
        });

        it('should use GET', function() {
            expect(ajaxRequest.method).toBe('get');
        });

        it('should use endpoint /profiles/{id}', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/profiles/123');
        });

        it('should NOT have a Content-Type header', function() {
            expect(ajaxRequest.headers['Content-Type']).not.toBeDefined();
        });

        it('should have an Authorization header', function() {
            expect(ajaxRequest.headers.Authorization).toBeDefined();
            expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
        });

        it('should NOT have a body', function() {
            expect(ajaxRequest.data).toBeUndefined();
        });
    });

    describe('update method', function() {
        var ajaxRequest;
        var requestData = { first_name: 'John', last_name: 'Doe' };

        it('should be defined', function(done) {
            expect(typeof profilesApi.update).toBe('function');
            var ajaxSpy = spyOn(axios, 'request').and.callFake(getMockPromises(mockPromiseUpdate));
            profilesApi.update(requestData).then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            }
        });

        it('should use PATCH', function() {
            expect(ajaxRequest.method).toBe('patch');
        });

        it('should use endpoint /profiles/me', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/profiles/me');
        });

        it('should have a Content-Type header', function() {
            expect(ajaxRequest.headers['Content-Type']).toBeDefined();
        });

        it('should have an Authorization header', function() {
            expect(ajaxRequest.headers.Authorization).toBeDefined();
            expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
        });

        it('should pass request data in body', function() {
            expect(ajaxRequest.data).toBe(requestData);
        });
    });

    describe('retrieve by email method', function() {
        var ajaxSpy;
        var ajaxRequest;

        beforeEach(function(done) {
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve({headers: {}}));
            profilesApi.retrieveByEmail('test@test.com').then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            }
        });

        it('should be defined', function() {
            expect(typeof profilesApi.retrieveByEmail).toBe('function');
        });

        it('should use GET', function() {
            expect(ajaxRequest.method).toBe('get');
        });

        it('should use endpoint /profiles?email=test@test.com', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/profiles?email=test@test.com');
        });

        it('should NOT have a Content-Type header', function() {
            expect(ajaxRequest.headers['Content-Type']).not.toBeDefined();
        });

        it('should have an Authorization header', function() {
            expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
        });

        it('should NOT have a body', function() {
            expect(ajaxRequest.data).not.toBeDefined();
        });
    });

    describe('retrieve by identifier method', function() {
        var ajaxSpy;

        beforeEach(function() {
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve({headers: {}}));
        });

        it('should pass scopus id through to the api request', function(done) {
            var params = {
                scopus_author_id: '12345'
            };

            profilesApi.retrieveByIdentifier(params).then(_finally, _finally);

            function _finally() {
                var ajaxRequest = ajaxSpy.calls.mostRecent().args[0];

                expect(ajaxSpy).toHaveBeenCalled();
                expect(ajaxRequest.params).toBe(params);
                done();
            }
        });

        it('should pass link paramter through to the api request', function(done) {
            var params = {
                link: 'hermione-granger'
            };

            profilesApi.retrieveByIdentifier(params).then(_finally, _finally);

            function _finally() {
                var ajaxRequest = ajaxSpy.calls.mostRecent().args[0];

                expect(ajaxSpy).toHaveBeenCalled();
                expect(ajaxRequest.params).toBe(params);
                done();
            }
        });
    });

});
/* jshint camelcase: true */
