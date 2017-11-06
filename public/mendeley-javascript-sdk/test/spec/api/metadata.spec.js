/* jshint sub: true */
'use strict';

var axios = require('axios');
var Promise = require('../../../lib/promise-proxy');
var sdk = require('../../../');
var baseUrl = 'https://api.mendeley.com';
var mockAuth = require('../../mocks/auth');

describe('metadata api', function() {
    var metadataApi = sdk({
      baseUrl: baseUrl,
      authFlow: mockAuth.mockImplicitGrantFlow()
    }).metadata;

    describe('retrieve method', function() {
        var ajaxSpy;
        var ajaxRequest;
        var params = {
            filehash: 'aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d' // SHA1('hello')
        };

        it('should be defined', function(done) {
            expect(typeof metadataApi.retrieve).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve({headers: {}}));
            metadataApi.retrieve(params).then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            }
        });

        it('should use GET', function() {
            expect(ajaxRequest.method).toBe('get');
        });

        it('should use endpoint /metadata', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/metadata');
        });

        it('should NOT have a Content-Type header', function() {
            expect(ajaxRequest.headers['Content-Type']).not.toBeDefined();
        });

        it('should have a Accept header', function() {
            expect(ajaxRequest.headers['Accept']).toBeDefined();
        });

        it('should have an Authorization header', function() {
            expect(ajaxRequest.headers.Authorization).toBeDefined();
            expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
        });

        it('should allow paramaters', function() {
            expect(ajaxRequest.params).toEqual(params);
        });

    });

});
/* jshint sub: false */
