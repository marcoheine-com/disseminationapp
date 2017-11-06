'use strict';

var axios = require('axios');
var Promise = require('../../../lib/promise-proxy');
var sdk = require('../../../');
var baseUrl = 'https://api.mendeley.com';
var mockAuth = require('../../mocks/auth');

describe('trash api', function() {
    var trashApi = sdk({
      baseUrl: baseUrl,
      authFlow: mockAuth.mockImplicitGrantFlow()
    }).trash;

    describe('retrieve method', function() {
        var ajaxSpy;
        var ajaxRequest;

        it('should be defined', function(done) {
            expect(typeof trashApi.retrieve).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve({headers: {}}));
            trashApi.retrieve(15).then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            }
        });

        it('should use GET', function() {
            expect(ajaxRequest.method).toBe('get');
        });

        it('should use endpoint /trash/{id}', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/trash/15');
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

    describe('list method', function() {
        var ajaxSpy;
        var ajaxRequest;
        var sampleData = {
            sort: 'created',
            order: 'desc',
            limit: 50
        };

        it('be defined', function(done) {
            expect(typeof trashApi.list).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve({headers: {}}));

            trashApi.list(sampleData).then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            }
        });

        it('should use GET', function() {
            expect(ajaxRequest.method).toBe('get');
        });

        it('should use endpoint /trash', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/trash');
        });

        it('should NOT have a Content-Type header', function() {
            expect(ajaxRequest.headers['Content-Type']).not.toBeDefined();
        });

        it('should have an Authorization header', function() {
            expect(ajaxRequest.headers.Authorization).toBeDefined();
            expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
        });

        it('should apply request params', function() {
            expect(ajaxRequest.params).toEqual(sampleData);
        });
    });

    describe('restore method', function() {
        var ajaxSpy;
        var ajaxRequest;

        it('should be defined', function(done) {
            expect(typeof trashApi.restore).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve({headers: {}}));
            trashApi.restore(15).then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            }
        });

        it('should use POST', function() {
            expect(ajaxRequest.method).toBe('post');
        });

        it('should use endpoint /trash/{id}/restore', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/trash/15/restore');
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

    describe('restore method failures', function() {
        it('should reject restore errors with the response', function(done) {
            var ajaxFailureResponse = function() {
                return Promise.reject({ response: { status: 404 } });
            };
            spyOn(axios, 'request').and.callFake(ajaxFailureResponse);
            trashApi.restore().catch(function(error) {
                expect(error.response.status).toEqual(404);
                done();
            });
        });
    });

    describe('destroy method', function() {
        var ajaxSpy;
        var ajaxRequest;

        it('should be defined', function(done) {
            expect(typeof trashApi.destroy).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve({headers: {}}));
            trashApi.destroy(15).then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            }
        });

        it('should use DELETE', function() {
            expect(ajaxRequest.method).toBe('delete');
        });

        it('should use endpoint /trash/{id}', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/trash/15');
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
        var sendMendeleyCountHeader = true,
            documentCount = 155,
            sendLinks = true,
            linkNext = baseUrl + '/trash/?limit=5&reverse=false&sort=created&order=desc&marker=03726a18-140d-3e79-9c2f-b63473668359',
            linkLast = baseUrl + '/trash/?limit=5&reverse=true&sort=created&order=desc';

        function ajaxSpy() {
            var headers = {
                data: [],
                status: 200
            };
            var spy = jasmine.createSpy('axios');

            if (sendMendeleyCountHeader) {
                headers['mendeley-count'] = documentCount.toString();
            }

            if (sendLinks) {
                headers.link = ['<' + linkNext + '>; rel="next"', '<' + linkLast + '>; rel="last"'].join(', ');
            }

            spy.and.returnValue(Promise.resolve({
                headers: headers
            }));
            axios.request = spy;

            return spy;
        }

        it('should parse link headers', function(done) {
            ajaxSpy();

            trashApi.list()
            .then(function (trash) {
                expect(trash.next).toEqual(jasmine.any(Function));
                expect(trash.last).toEqual(jasmine.any(Function));
                expect(trash.previous).toEqual(undefined);
                done();
            });
        });

        it('should get correct link on next()', function(done) {
            var spy = ajaxSpy();

            trashApi.list().then(function(page) {
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

            trashApi.list().then(function(page) {
                return page.last();
            })
            .then(_finally, _finally);

            function _finally() {
                expect(spy.calls.mostRecent().args[0].url).toEqual(linkLast);
                done();
            }
        });

        it('should store the total trashed documents count', function(done) {
            ajaxSpy();

            trashApi.list()
            .then(function(page) {
                expect(page.total).toEqual(155);
                done();
            });
        });
    });
});
