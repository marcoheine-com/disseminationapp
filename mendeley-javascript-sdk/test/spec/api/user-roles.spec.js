/* jshint camelcase: false */
'use strict';

var axios = require('axios');
var Promise = require('../../../lib/promise-proxy');
var sdk = require('../../../');
var baseUrl = 'https://api.mendeley.com';
var mockAuth = require('../../mocks/auth');

describe('user roles api', function() {
    var userRolesApi = sdk({
      baseUrl: baseUrl,
      authFlow: mockAuth.mockImplicitGrantFlow()
    }).userRoles;

    describe('list method', function() {

        var ajaxSpy;
        var ajaxRequest;
        var params = {
            limit: 500
        };

        it('be defined', function(done) {
            expect(typeof userRolesApi.list).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve({headers: {}}));

            userRolesApi.list(params).then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            }
        });

        it('should use GET', function() {
            expect(ajaxRequest.method).toBe('get');
        });

        it('should use endpoint /user_roles', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/user_roles');
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
});
/* jshint camelcase: true */
