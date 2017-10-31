/* jshint sub: true */
'use strict';

var axios = require('axios');
var Promise = require('../../../lib/promise-proxy');
var sdk = require('../../../');
var baseUrl = 'https://api.mendeley.com';
var mockAuth = require('../../mocks/auth');


describe('files api', function() {
    var filesApi = sdk({
      baseUrl: baseUrl,
      authFlow: mockAuth.mockImplicitGrantFlow()
    }).files;

    function getFakeFile(name, type) {
        return {
            name: name,
            type: type
        };
    }

    describe('create method', function() {

        // Mock ajax to resolve successfully
        var ajaxSpy;
        var ajaxRequest;
        var ajaxResponse = function() {
            var fileResource = {
                url: 'http://mendeley.cdn.com/123'
            };
            return Promise.resolve({
                data: fileResource,
                status: 201,
                headers: {}
            });

        };
        var file = getFakeFile('中文file name(1).pdf', 'text/plain');

        it('should be defined', function(done) {
            expect(typeof filesApi.create).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.callFake(ajaxResponse);
            filesApi.create(file, 123).then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.first().args[0];
                done();
            }

        });

        it('should use POST', function() {
            expect(ajaxRequest.method).toBe('post');
        });

        it('should use endpoint /files', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/files');
        });

        it('should have a valid Accept header', function() {
            expect(ajaxRequest.headers['Accept']).toEqual('application/vnd.mendeley-file.1+json');
        });

        it('should have a Content-Type header based on file type', function() {
            expect(ajaxRequest.headers['Content-Type']).toEqual('text/plain');
        });

        it('should have a Content-Disposition header based on file name', function() {
            expect(ajaxRequest.headers['Content-Disposition']).toEqual('attachment; filename*=UTF-8\'\'%E4%B8%AD%E6%96%87file%20name%281%29.pdf');
        });

        it('should have an Authorization header', function() {
            expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
        });

        it('should have an Link header', function() {
            expect(ajaxRequest.headers.Link).toBe('<' + baseUrl + '/documents/123>; rel="document"');
        });

        it('should have a body of the file contents', function() {
            expect(ajaxRequest.data).toEqual(file);
        });

        it('should use Content-Type application/octet-stream if no type', function(done) {
            var typelessFile = getFakeFile('filename.pdf', '');
            ajaxSpy = spyOn(axios, 'request').and.callFake(ajaxResponse);

            filesApi.create(123, typelessFile).then(_finally, _finally);

            function _finally() {
                ajaxRequest = ajaxSpy.calls.first().args[0];
                expect(ajaxRequest.headers['Content-Type']).toEqual('application/octet-stream');
                done();
            }
        });
    });

    describe('retrieve method', function() {
        var ajaxSpy;
        var ajaxRequest;
        var responsePromise;

        var sampleResponse = {
            headers: {}
        };

        it('be defined', function(done) {
            expect(typeof filesApi.retrieve).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve(sampleResponse));

            responsePromise = filesApi.retrieve('someId').then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
                return arguments[0];
            }
        });

        it('should use GET', function() {
            expect(ajaxRequest.method).toBe('get');
        });

        it('should use endpoint /files?document_id=someId', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/files/someId');
        });

        it('should have an Accept header', function() {
            expect(ajaxRequest.headers['Accept']).toBeDefined();
        });

        it('should NOT have a Content-Type header', function() {
            expect(ajaxRequest.headers['Content-Type']).not.toBeDefined();
        });

        it('should have an Authorization header', function() {
            expect(ajaxRequest.headers.Authorization).toBeDefined();
            expect(ajaxRequest.headers.Authorization).toBe('Bearer auth');
        });

        it('should NOT unpack the response envelope', function(done) {
            responsePromise.then(function(response) {
                expect(JSON.stringify(response)).toEqual(JSON.stringify(sampleResponse));
                done();
            });
        });

        it('should not follow HTTP redirects', function() {
            expect(typeof filesApi.retrieve).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve({headers: {}}));
            filesApi.retrieve('someId');

            var requestArgs = ajaxSpy.calls.first().args[0];

            expect(requestArgs.maxRedirects).toEqual(0);
        });

        it('should handle HTTP redirects like successful response', function() {
            expect(typeof filesApi.retrieve).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve({headers: {}}));
            filesApi.retrieve('someId');

            var requestArgs = ajaxSpy.calls.first().args[0];
            var isStatusSuccessFunc = requestArgs.validateStatus;

            expect(isStatusSuccessFunc(303)).toEqual(true);
        });

    });

    describe('list method', function() {
        var ajaxSpy;
        var ajaxRequest;

        it('be defined', function(done) {
            expect(typeof filesApi.list).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve({headers: {}}));
            filesApi.list('someId').then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            }
        });

        it('should use GET', function() {
            expect(ajaxRequest.method).toBe('get');
        });

        it('should use endpoint /files?document_id=someId', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/files?document_id=someId');
        });

        it('should have an Accept header', function() {
            expect(ajaxRequest.headers['Accept']).toBeDefined();
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

    describe('listAll method', function() {
        var ajaxSpy;
        var ajaxRequest;

        it('be defined', function(done) {
            expect(typeof filesApi.listAll).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve({headers: {}}));
            filesApi.listAll().then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
            }
        });

        it('should use GET', function() {
            expect(ajaxRequest.method).toBe('get');
        });

        it('should use endpoint /files', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/files');
        });

        it('should have an Accept header', function() {
            expect(ajaxRequest.headers['Accept']).toBeDefined();
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

    describe('remove method', function() {

        var ajaxSpy;
        var ajaxRequest;

        it('be defined', function(done) {
            expect(typeof filesApi.remove).toBe('function');
            ajaxSpy = spyOn(axios, 'request').and.returnValue(Promise.resolve({headers: {}}));
            filesApi.remove('fileId').then(_finally, _finally);

            function _finally() {
                expect(ajaxSpy).toHaveBeenCalled();
                ajaxRequest = ajaxSpy.calls.mostRecent().args[0];
                done();
                return arguments[0];
            }
        });

        it('should use DELETE', function() {
            expect(ajaxRequest.method).toBe('delete');
        });

        it('should use endpoint /files/fileId', function() {
            expect(ajaxRequest.url).toBe(baseUrl + '/files/fileId');
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
});
/* jshint sub: false */
