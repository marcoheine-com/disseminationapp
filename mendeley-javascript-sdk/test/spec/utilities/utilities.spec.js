'use strict';

describe('utilities', function() {
    var utils = require('../../../lib/utilities');
    var Request = require('../../../lib/request');
    var mockAuth = require('../../mocks/auth');
    var assign = require('object-assign');
    var Promise = require('../../../lib/promise-proxy');
    var authFlow = mockAuth.mockImplicitGrantFlow();
    var requestCreateSpy;

    var defaultOptions = {
        authFlow: function() {
            return authFlow;
        },
        baseUrl: function() {
            return 'https://api.mendeley.com';
        }
    };

    var responsePromise = Promise.resolve({
        headers: {
            Header: '123'
        },
        data: {
            id: '456'
        }
    });

    beforeEach(function() {
        requestCreateSpy = spyOn(Request, 'create').and.returnValue({
            send: function() {
                return responsePromise;
            }
        });
    });

    describe('requestFun', function() {

        it('should create a request with given properties', function() {
            var requestParameters = {
                param: 'This is a request parameter'
            };
            var requestFunction = utils.requestFun(assign({
                method: 'GET',
                resource: '/test',
                headers: {
                    Accept: 'mime/type1',
                    'Content-Type': 'mime/type2'
                }
            }, defaultOptions));

            requestFunction(requestParameters);

            expect(requestCreateSpy).toHaveBeenCalledWith({
                method: 'GET',
                responseType: 'json',
                url: 'https://api.mendeley.com/test',
                headers: {
                    Accept: 'mime/type1',
                    'Content-Type': 'mime/type2'
                },
                params: requestParameters
            }, {
                authFlow: authFlow,
                maxRetries: 1
            });
        });

        it('should allow setting the paramsSerializer for different end points', function() {

            var requestFunction = utils.requestFun(assign({
                method: 'GET',
                resource: '/test/',
                paramsSerializer: 'injected_paramsSerializer'
            }, defaultOptions));

            requestFunction();

            expect(requestCreateSpy).toHaveBeenCalledWith({
                method: 'GET',
                responseType: 'json',
                url: 'https://api.mendeley.com/test/',
                headers: {},
                params: undefined,
                paramsSerializer: 'injected_paramsSerializer'
            }, {
                authFlow: authFlow,
                maxRetries: 1
            });
        });

        it('should construct the url from supplied pattern and arguments', function() {
            var requestFunction = utils.requestFun(assign({
                method: 'GET',
                resource: '/test/{first}/{second}',
                args: ['first', 'second']
            }, defaultOptions));

            requestFunction(1, 2);

            expect(requestCreateSpy).toHaveBeenCalledWith({
                method: 'GET',
                responseType: 'json',
                url: 'https://api.mendeley.com/test/1/2',
                headers: {},
                params: undefined
            }, {
                authFlow: authFlow,
                maxRetries: 1
            });
        });

        it('should filter data from the response by default', function(done) {
            var requestFunction = utils.requestFun(assign({
                method: 'GET',
                resource: '/test'
            }, defaultOptions));

            requestFunction().then(function(data) {
                expect(data.id).toBe('456');
                done();
            });
        });

        it('should allow properties to be filtered from the response using a responseFilter', function(done) {
            var requestFunction = utils.requestFun(assign({
                responseFilter: function(options, response) {
                    return response.headers;
                },
                method: 'GET',
                resource: '/test'
            }, defaultOptions));

            requestFunction().then(function(data) {
                expect(data.Header).toBe('123');
                done();
            });
        });

        it('should allow headers to be supplied as functions', function() {
            var requestFunction = utils.requestFun(assign({
                method: 'GET',
                resource: '/test',
                headers: {
                    Header: function() {
                        return 'footer';
                    }
                }
            }, defaultOptions));

            requestFunction();

            expect(requestCreateSpy).toHaveBeenCalledWith({
                method: 'GET',
                responseType: 'json',
                url: 'https://api.mendeley.com/test',
                headers: {
                    Header: 'footer'
                },
                params: undefined
            }, {
                authFlow: authFlow,
                maxRetries: 1
            });
        });

        it('should allow the request to be modified using a requestFilter', function() {
            var requestFunction = utils.requestFun(assign({
                requestFilter: function(options, request) {
                    request.headers.foo = 'bar';

                    return request;
                },
                method: 'GET',
                resource: '/test'
            }, defaultOptions));

            requestFunction();

            expect(requestCreateSpy).toHaveBeenCalledWith({
                method: 'GET',
                responseType: 'json',
                url: 'https://api.mendeley.com/test',
                headers: {
                    foo: 'bar'
                },
                params: undefined
            }, {
                authFlow: authFlow,
                maxRetries: 1
            });
        });
    });

    describe('requestWithDataFun', function() {

        it('should create a request with given properties', function() {
            var requestData = {
                id: '123'
            };
            var requestFunction = utils.requestWithDataFun(assign({
                method: 'POST',
                resource: '/test',
                headers: {
                    Accept: 'mime/type1',
                    'Content-Type': 'mime/type2'
                },
                followLocation: true
            }, defaultOptions));

            requestFunction(requestData);

            expect(requestCreateSpy).toHaveBeenCalledWith({
                method: 'POST',
                url: 'https://api.mendeley.com/test',
                headers: {
                    Accept: 'mime/type1',
                    'Content-Type': 'mime/type2'
                },
                data: requestData
            }, {
                authFlow: authFlow,
                followLocation: true
            });
        });

        it('should construct the url from supplied pattern and arguments', function() {
            var requestFunction = utils.requestWithDataFun(assign({
                method: 'POST',
                resource: '/test/{first}/{second}',
                args: ['first', 'second']
            }, defaultOptions));

            requestFunction(1, 2);

            expect(requestCreateSpy).toHaveBeenCalledWith({
                method: 'POST',
                url: 'https://api.mendeley.com/test/1/2',
                headers: {},
                data: undefined
            }, {
                authFlow: authFlow,
                followLocation: undefined
            });
        });

        it('should allow properties to be filtered from the response using a responseFilter', function(done) {
            var requestFunction = utils.requestWithDataFun(assign({
                responseFilter: function(options, response) {
                    return response.headers;
                },
                method: 'POST',
                resource: '/test'
            }, defaultOptions));

            requestFunction().then(function(data) {
                expect(data.Header).toBe('123');
                done();
            });
        });

        it('should allow the request to be modified using a requestFilter', function() {
            var requestFunction = utils.requestWithDataFun(assign({
                requestFilter: function(options, request) {
                    request.headers.foo = 'bar';

                    return request;
                },
                method: 'POST',
                resource: '/test'
            }, defaultOptions));

            requestFunction();

            expect(requestCreateSpy).toHaveBeenCalledWith({
                method: 'POST',
                url: 'https://api.mendeley.com/test',
                headers: {
                    foo: 'bar'
                },
                data: undefined
            }, {
                authFlow: authFlow,
                followLocation: undefined
            });
        });
    });

    describe('requestWithFileFun', function() {

        var file = {
            type: 'mime/type',
            name: 'file.type'
        };

        var headers = {
            'Content-Type': 'mime/type',
            'Content-Disposition': 'attachment; filename*=UTF-8\'\'file.type'
        };

        it('should create a request with given properties', function() {
            var requestFunction = utils.requestWithFileFun(assign({
                method: 'POST',
                resource: '/test'
            }, defaultOptions));

            requestFunction(file);

            expect(requestCreateSpy).toHaveBeenCalledWith({
                method: 'POST',
                url: 'https://api.mendeley.com/test',
                headers: headers,
                data: file,
                onUploadProgress: undefined,
                onDownloadProgress: undefined
            }, {
                authFlow: authFlow
            });
        });

        it('should allow properties to be filtered from the response using a responseFilter', function(done) {
            var requestFunction = utils.requestWithFileFun(assign({
                responseFilter: function(options, response) {
                    return response.headers;
                },
                method: 'POST',
                resource: '/test'
            }, defaultOptions));

            requestFunction(file).then(function(data) {
                expect(data.Header).toBe('123');
                done();
            });
        });

        it('should allow a progress handler to be passed as the last argment', function() {
            var progressHandler = function() {};
            var requestFunction = utils.requestWithFileFun(assign({
                method: 'POST',
                resource: '/test'
            }, defaultOptions));

            requestFunction(file, progressHandler);

            expect(requestCreateSpy).toHaveBeenCalledWith({
                method: 'POST',
                url: 'https://api.mendeley.com/test',
                headers: headers,
                data: file,
                onUploadProgress: progressHandler,
                onDownloadProgress: progressHandler
            }, {
                authFlow: authFlow
            });
        });

        it('should set Link header when necessary', function() {
            var requestFunction = utils.requestWithFileFun(assign({
                method: 'POST',
                resource: '/test',
                linkType: 'document'
            }, defaultOptions));

            requestFunction(file, 'zelda');

            expect(requestCreateSpy).toHaveBeenCalledWith({
                method: 'POST',
                url: 'https://api.mendeley.com/test',
                headers: assign({
                    Link: '<https://api.mendeley.com/documents/zelda>; rel="document"'
                }, headers),
                data: file,
                onUploadProgress: undefined,
                onDownloadProgress: undefined
            }, {
                authFlow: authFlow
            });
        });

        it('should allow the request to be modified using a requestFilter', function() {
            var requestFunction = utils.requestWithFileFun(assign({
                requestFilter: function(options, request) {
                    request.headers.foo = 'bar';

                    return request;
                },
                method: 'POST',
                resource: '/test'
            }, defaultOptions));

            requestFunction(file, 'zelda');

            expect(requestCreateSpy).toHaveBeenCalledWith({
                method: 'POST',
                url: 'https://api.mendeley.com/test',
                headers: assign({
                  foo: 'bar'
                }, headers),
                data: file,
                onUploadProgress: undefined,
                onDownloadProgress: undefined
            }, {
                authFlow: authFlow
            });
        });
    });

    describe('paginationFilter', function () {

        function getMockedUtils(spy) {

            // Eak: Different proxy module for client (webpack) and server (node) tests.
            if(typeof window !=='undefined') {
                var proxy = require('proxy!../../../lib/utilities');
                var mockedUtils = proxy({
                    './pagination': {
                        filter: spy
                    }
                });
                return mockedUtils;
            }

            var proxyquire = require('proxyquire');
            return proxyquire('../../../lib/utilities', {
                './pagination': {
                    filter: spy
                }
            });

        }

        it('should be delegate to pagination library', function () {
            var spy = jasmine.createSpy();
            getMockedUtils(spy).paginationFilter();
            expect(spy).toHaveBeenCalled();
        });

    });

});
