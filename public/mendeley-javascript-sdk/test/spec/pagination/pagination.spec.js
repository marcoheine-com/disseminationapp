'use strict';

var assign = require('object-assign');
var Promise = require('../../../lib/promise-proxy');
var pagination = require('../../../lib/pagination');
var Request = require('../../../lib/request');
var mockAuth = require('../../mocks/auth');

var authFlow = mockAuth.mockImplicitGrantFlow();


describe('pagination', function() {

    var requestCreateSpy;
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

    describe('paginationFilter', function () {

        var apiReponse = {
            headers: {
                link: {
                    next: 'http://i.am.the.next.link',
                    previous: 'http://i.am.the.previous.link',
                    dontdo: 'something'
                },
                'mendeley-count': 199
            },
            data: [
                { id: 1 }
            ]
        };

        var options = {
            authFlow: function () { return authFlow; },
            baseUrl: 'baseUrl',
            method: 'GET',
            resource: '/communities/v1',
            headers: {
                'Accept': 'application/my/custom/mimetype',
                'Development-Token': 'devToken'
            },
            responseFilter: function () { }
        };

        it('should return the correct pagination object with next/prev methods', function () {

            var paginationResponse = pagination.filter(options, apiReponse);

            expect(paginationResponse.total).toBe(199);
            expect(paginationResponse.items).toEqual([
                { id: 1 }
            ]);
            expect(paginationResponse.next).toBeDefined();
            expect(paginationResponse.previous).toBeDefined();
            expect(paginationResponse.first).not.toBeDefined();
            expect(paginationResponse.last).not.toBeDefined();
            expect(paginationResponse.dontdo).not.toBeDefined();

            expect(paginationResponse.pageData.headers).toEqual({
                Accept: 'application/my/custom/mimetype',
                'Development-Token': 'devToken'
            });
            expect(paginationResponse.pageData.link).toEqual({
                next: 'http://i.am.the.next.link',
                previous: 'http://i.am.the.previous.link'
            });

        });

        it('next link should call the correct endpoint', function () {

            var paginationResponse = pagination.filter(options, apiReponse);
            paginationResponse.next();

            expect(requestCreateSpy).toHaveBeenCalledWith({
                method: 'GET',
                url: 'http://i.am.the.next.link',
                headers: {
                    Accept: 'application/my/custom/mimetype',
                    'Development-Token': 'devToken'
                },
                responseType: 'json'
            }, {
                    authFlow: authFlow,
                    maxRetries: 1
                });
        });

    });

    describe('decorate', function() {

        var data = {
            items: [],
            total: 23,
            pageData: {
                headers: {
                    accept: 'our-custom/json',
                    custom: 'our-custom-header'
                },
                link: {
                    next: 'http://a.next.url',
                    previous: 'http://a.prev.url',
                    last: 'http://a.last.url',
                    first: 'http://a.first.url',
                    dontuseme: 'http://dontuseme'
                }
            },
            otherCustomProp: 'otherprop'
        };

        it('should add next previous last first methods and pass through the custom request headers', function() {

            var result = pagination.decorate(data);

            expect(result.pageData.headers.accept).toBe('our-custom/json');
            expect(result.pageData.headers.custom).toBe('our-custom-header');
        
            expect(typeof result.next).toBe('function');
            expect(typeof result.previous).toBe('function');
            expect(typeof result.last).toBe('function');
            expect(typeof result.first).toBe('function');
            expect(result.dontuseme).not.toBeDefined();
            expect(result.otherCustomProp).toBe('otherprop');
        });

        function expectRequestCall(expectedUrl) {
            return {
                method: 'GET',
                url: expectedUrl,
                headers: {
                    accept: 'our-custom/json',
                    custom: 'our-custom-header'
                },
                responseType: 'json'
            };
        }

        var expectedOptions = {
            maxRetries: 1,
            authFlow: authFlow
        };

        it('should fire the correct request when the "next" handler is called', function() {
            var result = pagination.decorate(data, authFlow);
            result.next();
            expect(requestCreateSpy).toHaveBeenCalledWith(expectRequestCall('http://a.next.url'), expectedOptions);
        });

        it('should fire the correct request when the "previous" handler is called', function() {
            var result = pagination.decorate(data, authFlow);
            result.previous();
            expect(requestCreateSpy).toHaveBeenCalledWith(expectRequestCall('http://a.prev.url'), expectedOptions);
        });

        it('should fire the correct request when the "first" handler is called', function() {
            var result = pagination.decorate(data, authFlow);
            result.first();
            expect(requestCreateSpy).toHaveBeenCalledWith(expectRequestCall('http://a.first.url'), expectedOptions);
        });

        it('should fire the correct request when the "last" handler is called', function() {
            var result = pagination.decorate(data, authFlow);
            result.last();
            expect(requestCreateSpy).toHaveBeenCalledWith(expectRequestCall('http://a.last.url'), expectedOptions);
        });

        it('should handle partials links from the server', function() {
            var partialData = assign({}, data);

            delete partialData.pageData.link.previous;
            delete partialData.pageData.link.last;
            delete partialData.pageData.link.first;

            var result = pagination.decorate(data, authFlow);

            expect(typeof result.next).toBe('function');
            expect(result.previous).not.toBeDefined();
            expect(result.last).not.toBeDefined();
            expect(result.first).not.toBeDefined();

        });

    });
});
