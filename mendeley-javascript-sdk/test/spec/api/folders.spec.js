'use strict';

var axios = require('axios');
var Promise = require('../../../lib/promise-proxy');
var sdk = require('../../../');
var baseUrl = 'https://api.mendeley.com';
var mockAuth = require('../../mocks/auth');

describe('folders api', function() {
    var foldersApi = sdk({
      baseUrl: baseUrl,
      authFlow: mockAuth.mockImplicitGrantFlow()
    }).folders;

    describe('create method', function() {

        // Set up fake XHR to return Location header for first call and a folder for second call
        var ajaxSpy;
        var ajaxRequest;
        var ajaxCalls = 0;
        var ajaxResponse = function() {
            if (ajaxCalls++ % 2 === 0) {
                return Promise.resolve({
                    status: 201,
                    headers: {
                        location: baseUrl + '/folders/123'
                    }
                });
            } else {
                return Promise.resolve({
                    status: 200,
                    data: { id: '123', name: 'foo' },
                    headers: {}
                });
            }
        };

        beforeEach(function() {
            ajaxSpy = spyOn(axios, 'request').and.callFake(ajaxResponse);
        });

        it('should be defined', function(done) {
            expect(typeof foldersApi.create).toBe('function');
            foldersApi.create({ name: 'foo' }).then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                done();
            }
        });

        it('should use POST', function(done) {
            foldersApi.create({ name: 'foo' }).then(_finally, _finally);

            function _finally() {
                ajaxRequest = ajaxSpy.calls.first().args[0];
                expect(ajaxRequest.method).toBe('post');
                done();
            }
        });

        it('should use endpoint /folders', function(done) {
            foldersApi.create({ name: 'foo' }).then(_finally, _finally);

            function _finally() {
                ajaxRequest = ajaxSpy.calls.first().args[0];
                expect(ajaxRequest.url).toBe(baseUrl + '/folders');
                done();
            }
        });

        it('should have a Content-Type header', function(done) {
            foldersApi.create({ name: 'foo' }).then(_finally, _finally);

            function _finally() {
                ajaxRequest = ajaxSpy.calls.first().args[0];
                expect(ajaxRequest.headers['Content-Type']).toBeDefined();
                done();
            }
        });

        it('should have an Authorization header', function(done) {
            foldersApi.create({ name: 'foo' }).then(_finally, _finally);

            function _finally() {
                ajaxRequest = ajaxSpy.calls.first().args[0];
                expect(ajaxRequest.headers.Authorization).toBeDefined();
                expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
                done();
            }
        });

        it('should pass request data in body', function(done) {
            var requestData = { name: 'foo' };
            foldersApi.create(requestData).then(_finally, _finally);

            function _finally() {
                ajaxRequest = ajaxSpy.calls.first().args[0];
                expect(ajaxRequest.data).toBe(requestData);
                done();
            }
        });

        it('should follow Location header', function(done) {
            foldersApi.create({ name: 'foo' }).then(_finally, _finally);

            function _finally() {
                var ajaxRedirect = ajaxSpy.calls.mostRecent().args[0];
                expect(ajaxRedirect.method).toBe('get');
                expect(ajaxRedirect.url).toBe(baseUrl + '/folders/123');
                done();
            }
        });

        it('should resolve with the data', function(done) {
            foldersApi.create({ name: 'foo' }).then(function(data) {
                expect(data).toEqual({ id: '123', name: 'foo' });
                done();
            }).catch(function() {});
        });
    });

    describe('create method failures', function() {

        it('should reject create errors with the response', function(done) {
            var ajaxFailureResponse = function() {
                return Promise.reject({ response: { status: 500 } });
            };
            spyOn(axios, 'request').and.callFake(ajaxFailureResponse);
            foldersApi.create({ name: 'foo' }).catch(function(error) {
                expect(error.response.status).toEqual(500);
                done();
            });
        });

        it('should reject redirect errors with the response', function(done) {
            var ajaxMixedCalls = 0;
            var ajaxMixedResponse = function() {
                // First call apparently works and returns location
                if (ajaxMixedCalls++ === 0) {
                    return Promise.resolve({
                        headers: {
                            location: baseUrl + '/folders/123'
                        },
                        status: 201
                    });
                }
                // But following the location fails
                else {
                    return Promise.reject({ response: { status: 404 } });
                }
            };
            spyOn(axios, 'request').and.callFake(ajaxMixedResponse);
            foldersApi.create({ name: 'foo' }).catch(function(error) {
                expect(error.response.status).toEqual(404);
                done();
            });
        });
    });

    describe('retrieve method', function() {

        var ajaxSpy;
        var ajaxRequest;

        it('should be defined', function() {
            expect(typeof foldersApi.retrieve).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve({headers: {}}));
            foldersApi.retrieve(123);
            expect(ajaxSpy).toHaveBeenCalled();
            ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
        });

        it('should use GET', function() {
            expect(ajaxRequest.method).toBe('get');
        });

        it('should use endpoint /folders/{id}', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/folders/123');
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

        // Set up fake XHR to return an updated document
        var ajaxSpy;
        var ajaxRequest;
        var ajaxResponse = function() {
            return Promise.resolve({
                data: { id: '123', name: 'bar' },
                headers: {}
            });
        };
        var requestData = { name: 'bar' };

        it('should be defined', function() {
            expect(typeof foldersApi.update).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.callFake(ajaxResponse);
            foldersApi.update(123, requestData);
            expect(ajaxSpy).toHaveBeenCalled();
            ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
        });

        it('should use PATCH', function() {
            expect(ajaxRequest.method).toBe('patch');
        });

        it('should use endpoint /folders/{id}/', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/folders/123');
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

    describe('list method', function() {

        var ajaxSpy;
        var ajaxRequest;
        var params = {
            limit: 500
        };

        it('be defined', function() {
            expect(typeof foldersApi.list).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve({headers: {}}));

            foldersApi.list(params);
            expect(ajaxSpy).toHaveBeenCalled();
            ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
        });

        it('should use GET', function() {
            expect(ajaxRequest.method).toBe('get');
        });

        it('should use endpoint /folders', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/folders');
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

    describe('pagination', function() {

        var sendMendeleyCountHeader = true,
        folderCount = 56,
        sendLinks = true,
        linkNext = baseUrl + '/folders/?limit=5&reverse=false&marker=03726a18-140d-3e79-9c2f-b63473668359',
        linkLast = baseUrl + '/folders/?limit=5&reverse=true';

        function ajaxSpy() {
            var headers = {};
            var spy = jasmine.createSpy('axios');

            if (sendMendeleyCountHeader) {
                headers['mendeley-count'] = folderCount.toString();
            }

            if (sendLinks) {
                headers.link = ['<' + linkNext + '>; rel="next"', '<' + linkLast + '>; rel="last"'].join(', ');
            }

            spy.and.returnValue(Promise.resolve({
                data: [],
                headers: headers
            }));
            axios.request = spy;

            return spy;
        }

        it('should parse link headers', function(done) {
            ajaxSpy();

            foldersApi.list()
            .then(function (page) {
                expect(page.next).toEqual(jasmine.any(Function));
                expect(page.last).toEqual(jasmine.any(Function));
                expect(page.previous).toEqual(undefined);
                done();
            });

        });

        it('should get correct link on next()', function(done) {
            var spy = ajaxSpy();

            foldersApi.list()
            .then(function (page) {
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

            foldersApi.list()
            .then(function (page) {
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
            foldersApi.list()
            .then(function (page) {
                expect(page.total).toEqual(56);

                sendMendeleyCountHeader = false;
                folderCount = 999;
                ajaxSpy();
                return foldersApi.list();
            })
            .then(function (page) {
                expect(page.total).toEqual(0);

                sendMendeleyCountHeader = true;
                folderCount = 0;
                ajaxSpy();
                return foldersApi.list();
            })
            .then(function (page) {
                expect(page.total).toEqual(0);
                done();
            });
        });
    });
});
