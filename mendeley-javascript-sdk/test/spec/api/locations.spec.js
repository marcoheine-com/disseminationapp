'use strict';

var axios = require('axios');
var Promise = require('../../../lib/promise-proxy');
var sdk = require('../../../');
var baseUrl = 'https://api.mendeley.com';
var mockAuth = require('../../mocks/auth');

describe('locations api', function() {
    var locationsApi = sdk({
      baseUrl: baseUrl,
      authFlow: mockAuth.mockImplicitGrantFlow()
    }).locations;

    describe('search method', function() {
        var ajaxSpy;
        var ajaxRequest;
        var params = {
            prefix: 'lon',
            limit: 10
        };

        it('should be defined', function(done) {
            expect(typeof locationsApi.search).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve({headers: {}}));
            locationsApi.search(params).then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            }
        });

        it('should use GET', function() {
            expect(ajaxRequest.method).toBe('get');
        });

        it('should use endpoint /locations', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/locations');
        });

        it('should NOT have a Content-Type header', function() {
            expect(ajaxRequest.headers['Content-Type']).not.toBeDefined();
        });

        it('should have an Authorization header', function() {
            expect(ajaxRequest.headers.Authorization).toBeDefined();
            expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
        });

        it('should allow paramaters', function() {
            expect(ajaxRequest.params).toEqual(params);
        });

    });

    describe('retrieve method', function() {
        var ajaxSpy;
        var ajaxRequest;

        it('should be defined', function(done) {
            expect(typeof locationsApi.retrieve).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve({headers: {}}));
            locationsApi.retrieve('some-id').then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            }
        });

        it('should use GET', function() {
            expect(ajaxRequest.method).toBe('get');
        });

        it('should use endpoint /locations/some-id', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/locations/some-id');
        });

        it('should NOT have a Content-Type header', function() {
            expect(ajaxRequest.headers['Content-Type']).not.toBeDefined();
        });

        it('should have an Authorization header', function() {
            expect(ajaxRequest.headers.Authorization).toBeDefined();
            expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
        });
    });
});
