/* jshint sub: true */
'use strict';

var ES6Promise = require('es6-promise-promise');
var PromiseProxy = require('../../../lib/promise-proxy');

describe('promise-proxy', function() {

    describe('before setPromise', function() {

        it('should return instances of the global Promise', function() {
            var promise = new PromiseProxy(function() {});
            var all = PromiseProxy.all([]);
            var race = PromiseProxy.race([]);
            var resolve = PromiseProxy.resolve();
            var reject = PromiseProxy.reject();

            expect(promise).toEqual(jasmine.any(Promise));
            expect(all).toEqual(jasmine.any(Promise));
            expect(race).toEqual(jasmine.any(Promise));
            expect(resolve).toEqual(jasmine.any(Promise));
            expect(reject).toEqual(jasmine.any(Promise));
        });
    });

    describe('after setPromise', function() {

        beforeAll(function() {
            PromiseProxy.setPromise(ES6Promise);
        });

        it('should return instances of the custom promise', function() {
            var promise = new PromiseProxy(function() {});
            var all = PromiseProxy.all([]);
            var race = PromiseProxy.race([]);
            var resolve = PromiseProxy.resolve();
            var reject = PromiseProxy.reject();
            
            expect(promise).toEqual(jasmine.any(ES6Promise));
            expect(all).toEqual(jasmine.any(ES6Promise));
            expect(race).toEqual(jasmine.any(ES6Promise));
            expect(resolve).toEqual(jasmine.any(ES6Promise));
            expect(reject).toEqual(jasmine.any(ES6Promise));
        });
    });
});
