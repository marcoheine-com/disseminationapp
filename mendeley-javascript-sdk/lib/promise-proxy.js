'use strict';

var CustomPromise = Promise;

/**
 * An ES2015-compliant Promise proxy.
 * Allows the underlying reference to `Promise` to change after this library has been initialised and all modules hold a reference to it.
 * Instance methods, `then` and `catch`, need not be proxied as an instance of PromiseProxy is never created.
 *
 * @class
 * @name PromiseProxy
 */
module.exports = PromiseProxy;

// constructor (proxy)
function PromiseProxy(executor) {
    return new CustomPromise(executor);
}

// static methods
PromiseProxy.setPromise = function(customPromise) {
    CustomPromise = customPromise;
}

// static methods (proxy)
PromiseProxy.all = function() {
    return CustomPromise.all.apply(CustomPromise, arguments);
}
PromiseProxy.race = function() {
    return CustomPromise.race.apply(CustomPromise, arguments);
}
PromiseProxy.reject = function() {
    return CustomPromise.reject.apply(CustomPromise, arguments);
}
PromiseProxy.resolve = function() {
    return CustomPromise.resolve.apply(CustomPromise, arguments);
}
