'use strict';

var axios = require('axios');
var Promise = require('../../../lib/promise-proxy');
var sdk = require('../../../');
var baseUrl = 'https://api.mendeley.com';
var mockAuth = require('../../mocks/auth');

describe('groups api', function() {
    var groupApi = sdk({
      baseUrl: baseUrl,
      authFlow: mockAuth.mockImplicitGrantFlow()
    }).groups;

    describe('list method', function() {
        var ajaxSpy;
        var ajaxRequest;
        var params = {
            limit: 500
        };

        it('be defined', function(done) {
            expect(typeof groupApi.list).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve({headers: {}}));

            groupApi.list(params).then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            }
        });

        it('should use GET', function() {
            expect(ajaxRequest.method).toBe('get');
        });

        it('should use endpoint /groups', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/groups/v2');
        });

        it('should use the correct "Accept" header', function() {
            expect(ajaxRequest.headers.Accept).toEqual('application/vnd.mendeley-group-list+json');
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

    describe('retrieve method', function() {
        var ajaxSpy;
        var ajaxRequest;

        it('should be defined', function(done) {
            expect(typeof groupApi.retrieve).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve({headers: {}}));
            groupApi.retrieve(123).then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            }
        });

        it('should use GET', function() {
            expect(ajaxRequest.method).toBe('get');
        });

        it('should use endpoint /groups/{id}', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/groups/v2/123');
        });

        it('should use the correct "Accept" header', function() {
            expect(ajaxRequest.headers.Accept).toEqual('application/vnd.mendeley-group+json');
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

    describe('pagination', function() {
        var linkNext = baseUrl + '/groups/?limit=5&reverse=false&marker=03726a18-140d-3e79-9c2f-b63473668359',
        linkLast = baseUrl + '/groups/?limit=5&reverse=true';

        function ajaxSpy() {
            return spyOn(axios, 'request').and.returnValue(Promise.resolve({
                data: [],
                headers: {
                    link: ['<' + linkNext + '>; rel="next"', '<' + linkLast + '>; rel="last"'].join(', '),
                    'mendeley-count': 56
                }
            }));
        }

        it('should parse link headers', function(done) {
            ajaxSpy();

            groupApi.list()
            .then(function (groups) {
                expect(groups.next).toEqual(jasmine.any(Function));
                expect(groups.last).toEqual(jasmine.any(Function));
                expect(groups.previous).toEqual(undefined);
                done();
            });
        });

        it('should get correct link on next()', function(done) {
            var spy = ajaxSpy();

            groupApi.list().then(function(page) {
                return page.next();
            })
            .then(_finally, _finally);

            function _finally() {
                expect(spy.calls.mostRecent().args[0].url).toEqual(linkNext);
                done();
            }
        });

        it('should get correct link on last()', function(done) {
            var spy = ajaxSpy();

            groupApi.list().then(function(page) {
                return page.last();
            })
            .then(_finally, _finally);

            function _finally() {
                expect(spy.calls.mostRecent().args[0].url).toEqual(linkLast);
                done();
            }
        });

        it('should store the total document count', function(done) {
            ajaxSpy();

            groupApi.list()
            .then(function (page) {
                expect(page.total).toEqual(56);
                done();
            });
        });
    });
});
