'use strict';

var axios = require('axios');
var Promise = require('../../../lib/promise-proxy');
var sdk = require('../../../');
var baseUrl = 'https://api.mendeley.com';
var mockAuth = require('../../mocks/auth');

describe('institutions api', function() {
    var institutionsApi = sdk({
      baseUrl: baseUrl,
      authFlow: mockAuth.mockImplicitGrantFlow()
    }).institutions;

    describe('search method', function() {
        var ajaxSpy;
        var ajaxRequest;
        var params = {
            hint: 'lon',
            limit: 10
        };

        it('should be defined', function(done) {
            expect(typeof institutionsApi.search).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve({headers: {}}));
            institutionsApi.search(params).then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            }
        });

        it('should use GET', function() {
            expect(ajaxRequest.method).toBe('get');
        });

        it('should use endpoint /institutions', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/institutions');
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
            expect(typeof institutionsApi.retrieve).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve({headers: {}}));
            institutionsApi.retrieve('some-id').then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            }
        });

        it('should use GET', function() {
            expect(ajaxRequest.method).toBe('get');
        });

        it('should use endpoint /institutions/some-id', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/institutions/some-id');
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
