'use strict';

var axios = require('axios');
var sdk = require('../../../');
var baseUrl = 'https://api.mendeley.com';
var mockAuth = require('../../mocks/auth');

function getFakeFile(name, type) {
    return {
        name: name,
        type: type
    };
}

describe('documents api', function() {
    var documentsApi = sdk({
      baseUrl: baseUrl,
      authFlow: mockAuth.mockImplicitGrantFlow()
    }).documents;

    // Mock ajax response promises
    var mockPromiseCreate = Promise.resolve({
        data: '',
        status: 201,
        headers: {
            'location': baseUrl + '/documents/123'
        }
    });

    var mockPromiseRetrieve = Promise.resolve({
        data: { id: '15', title: 'foo' },
        status: 200,
        headers: {}
    });

    var mockPromiseCreateFromFile = Promise.resolve({
        data: { id: '15', title: 'foo' },
        status: 201,
        headers: {
            'location': baseUrl + '/documents/123'
        }
    });

    var mockPromiseUpdate = Promise.resolve({
        data: { id: '15', title: 'foo' },
        status: 200,
        headers: {
            'location': baseUrl + '/documents/123'
        }
    });

    var mockPromiseClone = Promise.resolve({
        data: {  id: '16', title: 'foo', 'group_id': 'bar' },
        status: 200,
        headers: {
            'location': baseUrl + '/documents/123'
        }
    });

    var mockPromiseList = Promise.resolve({
        data: [{ id: '15', title: 'foo' }],
        status: 200,
        headers: {
            'location': baseUrl + '/documents/123'
        }
    });

    var mockPromiseTrash = Promise.resolve({
        data: null,
        status: 204,
        headers: {
            'location': baseUrl + '/documents/123'
        }
    });

    var mockPromiseNotFound = Promise.reject({ response: { status: 404 } });

    var mockPromiseInternalError = Promise.reject({ response: { status: 500 } });

    // Get a function to return promises in order
    function getMockPromises() {
        var responses = Array.prototype.slice.call(arguments);
        var calls = 0;
        return function() {
            return responses[calls++];
        };
    }

    describe('create method', function() {

        var ajaxSpy;
        var ajaxRequest;

        beforeEach(function() {
            ajaxSpy = spyOn(axios, 'request').and.callFake(getMockPromises(mockPromiseCreate, mockPromiseRetrieve));
        });

        it('should be defined', function(done) {
            expect(typeof documentsApi.create).toBe('function');
            documentsApi.create({ title: 'foo' }).then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                done();
            }
        });

        it('should use POST', function(done) {
            documentsApi.create({ title: 'foo' }).then(_finally, _finally);

            function _finally() {
                ajaxRequest = ajaxSpy.calls.first().args[0];
                expect(ajaxRequest.method).toBe('post');
                done();
            }
        });

        it('should use endpoint /documents', function(done) {
            documentsApi.create({ title: 'foo' }).then(_finally, _finally);

            function _finally() {
                ajaxRequest = ajaxSpy.calls.first().args[0];
                expect(ajaxRequest.url).toBe(baseUrl + '/documents');
                done();
            }
        });

        it('should have a Content-Type header', function(done) {
            documentsApi.create({ title: 'foo' }).then(_finally, _finally);

            function _finally() {
                ajaxRequest = ajaxSpy.calls.first().args[0];
                expect(ajaxRequest.headers['Content-Type']).toBeDefined();
                done();
            }
        });

        it('should have an Authorization header', function(done) {
            documentsApi.create({ title: 'foo' }).then(_finally, _finally);

            function _finally() {
                ajaxRequest = ajaxSpy.calls.first().args[0];
                expect(ajaxRequest.headers.Authorization).toBeDefined();
                expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
                done();
            }
        });

        it('should pass request data in body', function(done) {
            var requestData = { title: 'foo' };
            documentsApi.create(requestData).then(_finally, _finally);

            function _finally() {
                ajaxRequest = ajaxSpy.calls.first().args[0];
                expect(ajaxRequest.data).toBe(requestData);
                done();
            }
        });

        it('should follow Location header', function(done) {
            documentsApi.create({ title: 'foo' }).then(_finally, _finally);

            function _finally() {
                ajaxRequest = ajaxSpy.calls.first().args[0];
                var ajaxRedirect = ajaxSpy.calls.mostRecent().args[0];
                expect(ajaxRedirect.method).toBe('get');
                expect(ajaxRedirect.url).toBe(baseUrl + '/documents/123');
                done();
            }
        });

        it('should resolve with the response', function(done) {
            documentsApi.create({ title: 'foo' }).then(function(data) {
                expect(data).toEqual({ id: '15', title: 'foo' });
                done();
            }).catch(function() {});
        });
    });

    describe('create method failures', function() {

        it('should reject create errors with the request and response', function(done) {
            spyOn(axios, 'request').and.callFake(getMockPromises(mockPromiseInternalError));
            documentsApi.create({ title: 'foo' }).catch(function(error) {
                expect(error.response.status).toEqual(500);
                done();
            });
        });

        it('should fail redirect errors with the request and the response', function(done) {
            spyOn(axios, 'request').and.callFake(getMockPromises(mockPromiseCreate, mockPromiseNotFound));
            documentsApi.create({ title: 'foo' }).catch(function(error) {
                expect(error.response.status).toEqual(404);
                done();
            });
        });
    });

    describe('createFromFile method', function() {

        var ajaxSpy;
        var ajaxRequest;
        var file = getFakeFile('中文file name(1).pdf', 'text/plain');

        beforeEach(function() {
            ajaxSpy = spyOn(axios, 'request').and.callFake(getMockPromises(mockPromiseCreateFromFile));
        });

        it('should be defined', function(done) {
            expect(typeof documentsApi.createFromFile).toBe('function');
            documentsApi.createFromFile(file).then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                done();
            }
        });

        it('should use POST', function(done) {
            documentsApi.createFromFile(file).then(_finally, _finally);

            function _finally() {
                ajaxRequest = ajaxSpy.calls.first().args[0];
                expect(ajaxRequest.method).toBe('post');
                done();
            }
        });

        it('should use endpoint /documents', function(done) {
            documentsApi.createFromFile(file).then(_finally, _finally);

            function _finally() {
                ajaxRequest = ajaxSpy.calls.first().args[0];
                expect(ajaxRequest.url).toBe(baseUrl + '/documents');
                done();
            }
        });

        it('should have a Content-Type header the same as the file', function(done) {
            documentsApi.createFromFile(file).then(_finally, _finally);

            function _finally() {
                ajaxRequest = ajaxSpy.calls.first().args[0];
                expect(ajaxRequest.headers['Content-Type']).toBeDefined();
                expect(ajaxRequest.headers['Content-Type']).toEqual('text/plain');
                done();
            }
        });

        it('should have a Content-Disposition header based on file name', function(done) {
            documentsApi.createFromFile(file).then(_finally, _finally);

            function _finally() {
                ajaxRequest = ajaxSpy.calls.first().args[0];
                expect(ajaxRequest.headers['Content-Disposition']).toEqual('attachment; filename*=UTF-8\'\'%E4%B8%AD%E6%96%87file%20name%281%29.pdf');
                done();
            }
        });

        it('should have an Authorization header', function(done) {
            documentsApi.createFromFile(file).then(_finally, _finally);

            function _finally() {
                ajaxRequest = ajaxSpy.calls.first().args[0];
                expect(ajaxRequest.headers.Authorization).toBeDefined();
                expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
                done();
            }
        });

        it('should have a body of the file contents', function(done) {
            documentsApi.createFromFile(file).then(_finally, _finally);

            function _finally() {
                ajaxRequest = ajaxSpy.calls.first().args[0];
                expect(ajaxRequest.data).toEqual(file);
                done();
            }
        });

        it('should resolve with the response', function(done) {
            documentsApi.createFromFile(file).then(function(data) {
                expect(data).toEqual({ id: '15', title: 'foo' });
                done();
            });
        });
    });

    describe('createFromFileInGroup method', function() {

        var ajaxSpy;
        var apiRequest;
        var ajaxRequest;
        var file = getFakeFile('中文file name(1).pdf', 'text/plain');

        it('should be defined', function(done) {
            expect(typeof documentsApi.createFromFile).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.callFake(getMockPromises(mockPromiseCreateFromFile));
            apiRequest = documentsApi.createFromFileInGroup(file, 123).then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.first().args[0];
                done();
            }
        });

        it('should have a Link header', function() {
            expect(ajaxRequest.headers.Link).toBe('<' + baseUrl + '/groups/123>; rel="group"');
        });
    });

    describe('retrieve method', function() {

        var ajaxRequest;

        it('should be defined', function(done) {
            expect(typeof documentsApi.retrieve).toBe('function');
            var ajaxSpy = spyOn(axios, 'request').and.callFake(getMockPromises(mockPromiseRetrieve));
            documentsApi.retrieve(15).then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            }
        });

        it('should use GET', function() {
            expect(ajaxRequest.method).toBe('get');
        });

        it('should use endpoint /documents/{id}/', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/documents/15');
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

    describe('retrieve method failures', function() {

        it('should reject retrieve errors with the request and response', function(done) {
            spyOn(axios, 'request').and.callFake(getMockPromises(mockPromiseNotFound));
            documentsApi.list().catch(function(error) {
                expect(error.response.status).toEqual(404);
                done();
            });
        });

    });

    describe('update method', function() {

        var ajaxRequest;
        var requestData = { title: 'bar' };

        it('should be defined', function(done) {
            expect(typeof documentsApi.update).toBe('function');
            var ajaxSpy = spyOn(axios, 'request').and.callFake(getMockPromises(mockPromiseUpdate));
            documentsApi.update(15, requestData).then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            }
        });

        it('should use PATCH', function() {
            expect(ajaxRequest.method).toBe('patch');
        });

        it('should use endpoint /documents/{id}/', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/documents/15');
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

    describe('clone method', function() {
        var ajaxRequest,
            apiRequest;

        var requestData = { 'group_id': 'bar' };

        it('should be defined', function(done) {
            expect(typeof documentsApi.clone).toBe('function');
            var ajaxSpy = spyOn(axios, 'request').and.callFake(getMockPromises(mockPromiseClone));
            apiRequest = documentsApi.clone(15, requestData).then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
                return arguments[0];
            }
        });

        it('should use POST', function() {
            expect(ajaxRequest.method).toBe('post');
        });

        it('should use endpoint /documents/{id}/actions/cloneTo', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/documents/15/actions/cloneTo');
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

        it('should resolve with the response', function(done) {
            apiRequest.then(function(data) {
                expect(data).toEqual({ id : '16', title : 'foo', 'group_id' : 'bar' });
                done();
            }).catch(function() {});
        });
    });

    describe('list method', function() {

        var ajaxRequest;
        var params = {
            sort: 'created',
            order: 'desc',
            limit: 50
        };

        it('should be defined', function(done) {
            expect(typeof documentsApi.list).toBe('function');
            var ajaxSpy = spyOn(axios, 'request').and.callFake(getMockPromises(mockPromiseList));

            documentsApi.list(params).then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            }
        });

        it('should use GET', function() {
            expect(ajaxRequest.method).toBe('get');
        });

        it('should use endpoint /documents', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/documents');
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

    describe('list with folderId param', function() {

        var ajaxRequest;
        var params = {
            sort: 'created',
            order: 'desc',
            limit: 50,
            folderId: 'xyz'
        };

        it('should use the folders API', function(done) {
            var ajaxSpy = spyOn(axios, 'request').and.callFake(getMockPromises(mockPromiseList));
            documentsApi.list(params).then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            }
        });

        it('should use GET', function() {
            expect(ajaxRequest.method).toBe('get');
        });

        it('should use endpoint /folders/{id}/documents', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/folders/xyz/documents');
        });

        it('should remove the all paramaters except limit', function() {
            expect(ajaxRequest.params).toEqual({limit: 50});
        });

    });

    describe('trash method', function() {

        var ajaxRequest;

        it('should be defined', function(done) {
            expect(typeof documentsApi.trash).toBe('function');
            var ajaxSpy = spyOn(axios, 'request').and.callFake(getMockPromises(mockPromiseTrash));
            documentsApi.trash(15).then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            }
        });

        it('should use POST', function() {
            expect(ajaxRequest.method).toBe('post');
        });

        it('should use endpoint /documents/{id}/trash', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/documents/15/trash');
        });

        it('should have an Authorization header', function() {
            expect(ajaxRequest.headers.Authorization).toBeDefined();
            expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
        });

        it('should NOT have a body', function() {
            expect(ajaxRequest.data).toBeUndefined();
        });

    });

    describe('retry', function() {

        var ajaxSpy;

        it('should retry on 504', function(done) {
            ajaxSpy = spyOn(axios, 'request').and.callFake(getMockPromises(Promise.reject({ response: { status: 504 } }), mockPromiseList));
            documentsApi.list().then(function() {
                expect(ajaxSpy).toHaveBeenCalled();
                expect(ajaxSpy.calls.count()).toBe(2);
                done();
            });
        });

        it('should only retry once', function(done) {
            ajaxSpy = spyOn(axios, 'request').and.callFake(getMockPromises(Promise.reject({ response: { status: 504 } }), Promise.reject({ response: { status: 504 } }), mockPromiseList));
            documentsApi.list().catch(function() {
                expect(ajaxSpy).toHaveBeenCalled();
                expect(ajaxSpy.calls.count()).toBe(2);
                done();
            });
        });

        it('should NOT retry on response != 504', function(done) {
            ajaxSpy = spyOn(axios, 'request').and.callFake(getMockPromises(mockPromiseNotFound, mockPromiseList));
            documentsApi.list().catch(function() {
                expect(ajaxSpy).toHaveBeenCalled();
                expect(ajaxSpy.calls.count()).toBe(1);
                done();
            });
        });

        it('should NOT retry on failed create', function(done) {
            ajaxSpy = spyOn(axios, 'request').and.callFake(getMockPromises(mockPromiseInternalError, mockPromiseList));
            documentsApi.create({ title: 'foo' }).catch(function() {
                expect(ajaxSpy).toHaveBeenCalled();
                expect(ajaxSpy.calls.count()).toBe(1);
                done();
            });
        });
    });

    describe('pagination', function() {

        var sendMendeleyCountHeader = true,
        documentCount = 155,
        sendLinks = true,
        linkNext = baseUrl + '/documents/?limit=5&reverse=false&sort=created&order=desc&marker=03726a18-140d-3e79-9c2f-b63473668359',
        linkPrev = baseUrl + '/documents/?limit=5&reverse=false&sort=created&order=desc&marker=13726a18-140d-3e79-9c2f-b63473668359',
        linkLast = baseUrl + '/documents/?limit=5&reverse=true&sort=created&order=desc';

        function ajaxSpy() {
            var headers = {};
            var spy = jasmine.createSpy('axios');

            if (sendMendeleyCountHeader) {
                headers['mendeley-count'] = documentCount.toString();
            }

            if (sendLinks) {
                headers.link = ['<' + linkNext + '>; rel="next"', '<' + linkPrev + '>; rel="previous"', '<' + linkLast + '>; rel="last"'].join(', ');
            }

            spy.and.returnValue(Promise.resolve({
                headers: headers
            }));
            axios.request = spy;

            return spy;
        }

        it('should parse link headers', function(done) {
            ajaxSpy();

            documentsApi.list()
            .then(function(page) {
                expect(page.next).toEqual(jasmine.any(Function));
                expect(page.last).toEqual(jasmine.any(Function));
                expect(page.previous).toEqual(jasmine.any(Function));
                done();
            });
        });

        it('should get correct link on next()', function(done) {
            var spy = ajaxSpy();

            documentsApi.list()
            .then(function(page) {
                return page.next();
            })
            .then(_finally, _finally);

            function _finally() {
                expect(spy.calls.mostRecent().args[0].url).toEqual(linkNext);
                done();
            }
        });

        it('should get correct link on previous()', function(done) {
            var spy = ajaxSpy();

            documentsApi.list()
            .then(function(page) {
                return page.previous();
            })
            .then(_finally, _finally);

            function _finally() {
                expect(spy.calls.mostRecent().args[0].url).toEqual(linkPrev);
                done();
            }
        });

        it('should get correct link on lastPage()', function(done) {
            var spy = ajaxSpy();

            documentsApi.list()
            .then(function(page) {
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
            documentsApi.list()
            .then(function (page) {
                expect(page.total).toEqual(155);

                sendMendeleyCountHeader = false;
                documentCount = 999;
                ajaxSpy();
                return documentsApi.list();
            })
            .then(function (page) {
                expect(page.total).toEqual(0);

                sendMendeleyCountHeader = true;
                documentCount = 0;
                ajaxSpy();
                return documentsApi.list();
            })
            .then(function (page) {
                expect(page.total).toEqual(0);
                done();
            });
        });

        it('should not set pagination links if there is a count but no links', function(done) {
            sendMendeleyCountHeader = true;
            documentCount = 10;
            sendLinks = false;

            ajaxSpy();

            documentsApi.list()
            .then(function(page) {
                expect(page.total).toEqual(10);
                expect(page.next).toEqual(undefined);
                expect(page.last).toEqual(undefined);
                expect(page.previous).toEqual(undefined);
                done();
            });
        });
    });
});
