/* jshint camelcase: false */
'use strict';

var axios = require('axios');
var Promise = require('../../../lib/promise-proxy');
var sdk = require('../../../');
var baseUrl = 'https://api.mendeley.com';
var mockAuth = require('../../mocks/auth');

describe('annotations api', function() {
    var annotationsApi = sdk({
      baseUrl: baseUrl,
      authFlow: mockAuth.mockImplicitGrantFlow()
    }).annotations;

    describe('list method', function() {

        var ajaxSpy;
        var ajaxRequest;
        var params = {
            limit: 500
        };

        it('be defined', function(done) {
            expect(typeof annotationsApi.list).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve({headers: {}}));

            annotationsApi.list(params).then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            }
        });

        it('should use GET', function() {
            expect(ajaxRequest.method).toBe('get');
        });

        it('should use endpoint /annotations', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/annotations');
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
            expect(typeof annotationsApi.retrieve).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve({headers: {}}));
            annotationsApi.retrieve(123).then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            }
        });

        it('should use GET', function() {
            expect(ajaxRequest.method).toBe('get');
        });

        it('should use endpoint /annotations/{id}', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/annotations/123');
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

    describe('create method', function() {
        var ajaxSpy, ajaxRequest;
        var requestData = { document_id: 123, text: 'new annotation' };

        it('should be defined', function(done) {
            expect(typeof annotationsApi.create).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve({headers: {}}));
            annotationsApi.create(requestData).then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            }
        });

        it('should use POST', function() {
            expect(ajaxRequest.method).toBe('post');
        });

        it('should use endpoint https://api.mendeley.com/annotations/', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/annotations');
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

    describe('delete method', function() {
        var ajaxSpy, ajaxRequest;

        it('should be defined', function(done) {
            expect(typeof annotationsApi.delete).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve({headers: {}}));
            annotationsApi.delete(123).then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            }
        });

        it('should use DELETE', function() {
            expect(ajaxRequest.method).toBe('delete');
        });

        it('should use endpoint https://api.mendeley.com/annotations/{annotation_id}', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/annotations/123');
        });

        it('should have an Authorization header', function() {
            expect(ajaxRequest.headers.Authorization).toBeDefined();
            expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
        });

        it('should not have a response body', function() {
            expect(ajaxRequest.data).toBeUndefined;
        });

    });

    describe('patch method', function() {
        var ajaxSpy, ajaxRequest;
        var requestData = { text: 'updated annotation' };

        it('should be defined', function(done) {
            expect(typeof annotationsApi.patch).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve({headers: {}}));
            annotationsApi.patch(123, requestData).then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            }
        });

        it('should use PATCH', function() {
            expect(ajaxRequest.method).toBe('patch');
        });

        it('should use endpoint https://api.mendeley.com/annotations/{annotation_id}', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/annotations/123');
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

    describe('pagination', function() {

        var linkFirst = baseUrl + '/annotations/?limit=5&reverse=false&marker=03726a18-140d-3e79-9c2f-b63473668360';
        var linkNext = baseUrl + '/annotations/?limit=5&reverse=false&marker=03726a18-140d-3e79-9c2f-b63473668359';
        var linkLast = baseUrl + '/annotations/?limit=5&reverse=true';

        function ajaxSpy() {
            return spyOn(axios, 'request').and.returnValue(Promise.resolve({
                headers: {
                    link: '<' + linkNext + '>; rel="next",<' + linkLast + '>; rel="last",<' + linkFirst + '>; rel="first"',
                    'mendeley-count': 56
                }
            }));
        }

        it('should parse link headers', function(done) {
            ajaxSpy();

            annotationsApi.list().then(function(annotations) {
                expect(annotations.first).toEqual(jasmine.any(Function));
                expect(annotations.next).toEqual(jasmine.any(Function));
                expect(annotations.last).toEqual(jasmine.any(Function));
                expect(annotations.previous).toEqual(undefined);
                done();
            }).catch(function() {});
        });

        it('should get correct link on nextPage()', function(done) {
            var spy = ajaxSpy();

            annotationsApi.list().then(function(page) {
                return page.next();
            })
            .then(_finally, _finally);

            function _finally() {
                expect(spy.calls.mostRecent().args[0].url).toEqual(linkNext);
                done();
            }
        });

        it('should get correct link on lastPage()', function(done) {
            var spy = ajaxSpy();

            annotationsApi.list().then(function(page) {
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

            annotationsApi.list().then(function(page) {
                expect(page.total).toEqual(56);
                done();
            });
        });
    });
});
/* jshint camelcase: true */
