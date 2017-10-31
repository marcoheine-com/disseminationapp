'use strict';

var axios = require('axios');
var Promise = require('../../../lib/promise-proxy');
var sdk = require('../../../');
var baseUrl = 'https://api.mendeley.com';
var mockAuth = require('../../mocks/auth');

describe('followers api', function() {
    var followersApi = sdk({
      baseUrl: baseUrl,
      authFlow: mockAuth.mockImplicitGrantFlow()
    }).followers;

    describe('create method', function() {
        var ajaxSpy;
        var ajaxRequest;
        var params = {
            followed: 'c52e97f5-dd72-3cbe-a4cc-14bea2ed88f0'
        };

        it('should be defined', function(done) {
            expect(typeof followersApi.create).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve({headers: {}}));
            followersApi.create(params).then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            }
        });

        it('should use POST', function() {
            expect(ajaxRequest.method).toBe('post');
        });

        it('should use endpoint /followers', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/followers');
        });

        it('should have a have a Content-Type header', function() {
            expect(ajaxRequest.headers['Content-Type']).toEqual('application/vnd.mendeley-follow-request.1+json');
        });

        it('should have an Authorization header', function() {
            expect(ajaxRequest.headers.Authorization).toBeDefined();
            expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
        });

        it('should allow parameters', function() {
            expect(ajaxRequest.data).toEqual(params);
        });

    });

    describe('list method', function() {
        var ajaxRequest;
        var params = {
            follower: 'c52e97f5-dd72-3cbe-a4cc-14bea2ed88f0',
            limit: 50
        };

        it('should be defined', function(done) {
            expect(typeof followersApi.list).toBe('function');
            var ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve({headers: {}}));

            followersApi.list(params).then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            }
        });

        it('should use GET', function() {
            expect(ajaxRequest.method).toBe('get');
        });

        it('should use endpoint /followers', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/followers');
        });

        it('should NOT have a Content-Type header', function() {
            expect(ajaxRequest.headers['Content-Type']).not.toBeDefined();
        });

        it('should have an Authorization header', function() {
            expect(ajaxRequest.headers.Authorization).toBeDefined();
            expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
        });

        it('should apply request params', function() {
            expect(ajaxRequest.params).toEqual(params);
        });

    });

    describe('remove method', function() {
        var ajaxRequest;
        var relationshipId = 'c52e97f5-dd72-3cbe-a4cc-14bea2ed88f0';

        it('should be defined', function(done) {
            expect(typeof followersApi.remove).toBe('function');
            var ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve({headers: {}}));

            followersApi.remove(relationshipId).then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            }
        });

        it('should use DELETE', function() {
            expect(ajaxRequest.method).toBe('delete');
        });

        it('should use endpoint /followers/{id}', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/followers/' + relationshipId);
        });

        it('should NOT have a Content-Type header', function() {
            expect(ajaxRequest.headers['Content-Type']).not.toBeDefined();
        });

        it('should have an Authorization header', function() {
            expect(ajaxRequest.headers.Authorization).toBeDefined();
            expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
        });

    });

    describe('accept method', function() {
        var ajaxRequest;
        var relationshipId = 'c52e97f5-dd72-3cbe-a4cc-14bea2ed88f0';

        it('should be defined', function(done) {
            expect(typeof followersApi.accept).toBe('function');
            var ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve({headers: {}}));

            followersApi.accept(relationshipId, { status: 'following' }).then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            }
        });

        it('should use PATCH', function() {
            expect(ajaxRequest.method).toBe('patch');
        });

        it('should use endpoint /followers/{id}', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/followers/' + relationshipId);
        });

        it('should have a Content-Type header', function() {
            expect(ajaxRequest.headers['Content-Type']).toBeDefined();
        });

        it('should have an Authorization header', function() {
            expect(ajaxRequest.headers.Authorization).toBeDefined();
            expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
        });

    });
});
