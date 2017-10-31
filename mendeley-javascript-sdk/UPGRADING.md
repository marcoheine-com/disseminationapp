# UPGRADING

## Upgrading to v3.x

This version introduces some breaking changes that will effect client applications. These six breaking changes are approximately in order of impact.

1.  All SDK methods now return Bluebird promises instead of jQuery promises. It is therefore no longer possible to assign handlers with .done(), .fail(),
or .always() - you must use .then(), .catch(), and .finally()

  Because promises do not support progress handlers, these are now passed as a callback to the SDK method call as follows:

    ```javascript
    api.documents.createFromFile(file, function progressHandler() { ... });
    ```

  Some synchronous tests might be effected by this because unlike jQuery promises, Bluebird promises are completely asynchronous. When stubbing SDK methods, ensure you now return Bluebird promises instead of jQuery Deferreds.

  e.g. in Jasmine:

    ```javascript
    spyOn(api.documents, 'create').and.returnValue($.Deferred().resolve());
    // becomes
    spyOn(api.documents, 'create').and.returnValue(Promise.resolve());
    ```

1. The .then() success handler now only gets one parameter - the data returned by
the API call. Unless specified, headers and other xhr properties will not be accessible.

1. The SDK relies on a Promise implementation being present in the environment.
Depending on your target browsers, you may need to polyfill the Promise global.
For projects using Webpack, include the following plugin in your config:

    ```javascript
    {
        plugins: [new webpack.ProvidePlugin({
            Promise: 'es6-promise-promise'
        })];
    }
    ```

    You can use a different promise implementation here if desired.

1. Because we're running everything in Node now, we're no longer using bower to manage dependencies. Unless you're using the precompiled bundle, you will need to move your sdk dependency from bower.json to package.json and install using npm now.

1. Because the SDK no longer uses jQuery at all, it will not be possible to assign
global AJAX config using `jQuery.ajaxSetup()`
Use axios defaults instead:
https://github.com/mzabriskie/axios#global-axios-defaults

1. The notifier feature has been completely removed. All calls to `api.setNotifier()` will have to be removed from client codebases and anything relying on the events provided by this feature will have to be reworked.

1. The `.API` property is now deprecated.  Instead you should call the result of `require` as a function and use that instance to make your API requests:

    ```javascript
    // old
    var Mendeley = require('@mendeley/api');
    Mendeley.setAuthFlow(Mendeley.Auth.implicitGrantFlow(/* ... */))
    Mendeley.API.documents.list().then(/* ... */)

    // new
    var mendeley = require('@mendeley/api');
    var api = mendeley({
       authFlow: mendeley.Auth.implicitGrantFlow(/* ... */)
    })
    api.documents.list().then(/* ... */)
    ```

  Any attempt to access the `.API` object after creating an instance will result in an error being thrown.

## Upgrading to v4.x

1. Pagination has been overhauled in v4.

  Old code:

    ```javascript
    // global based
    api.documents.list()
    .then(function (documents) {
      console.info('I have ' + api.documents.count + 'documents')

      return api.documents.nextPage() // or .previousPage() or lastPage()
    })
    .then(function (documents) {
      console.info('Now I am on the next page')

      // tidy up
      api.documents.resetPagination();
    })

    // instance based
    var instance = api.documents.for('my-request')
    instance.list()
    .then(function (documents) {
      console.info('I have ' + instance.count + 'documents')
      console.info('The documents are ' + documents)

      return instance.nextPage() // or .previousPage() or lastPage()
    })
    .then(function (documents) {
      console.info('Now I am on the next page')

      // tidy up
      instance.resetPagination();
    })
    ```

  New code:

    ```javascript
    api.documents.list()
    .then(function (documents) {
      console.info('I have ' + documents.total + 'documents')
      console.info('The documents are ' + documents)

      return documents.nextPage() // or .previousPage() or .lastPage()
    })
    .then(function (documents) {
      console.info('Now I am on the next page')

      // no tidy up necessary
    })
    ```

1. The global API object has been removed as multiple requests overwrite global data.

  All code should now get an instance of the api by calling the function returned from this module:

  ```javascript
  // old
  var Mendeley = require('@mendeley/api');
  Mendeley.setAuthFlow(Mendeley.Auth.implicitGrantFlow(/* ... */))
  Mendeley.API.documents.list().then(/* ... */)

  // new
  var mendeley = require('@mendeley/api');
  var api = mendeley({
     authFlow: mendeley.Auth.implicitGrantFlow(/* ... */)
  })
  api.documents.list().then(/* ... */)
  ```

## Upgrading to v5.x

1. Pagination has been tweaked again. Now the result of calls to `list` methods is a wrapper object that holds the actual list of resources under a property named `items`.

  Also `nextPage`, `previousPage`, `firstPage` and `lastPage` become `next`, `previous`, `first` and `last` resepectively:

  ```javascript
  api.documents.list()
  .then(function (page) {
    console.info('I have ' + page.total + 'documents')
    console.info('The documents are ' + page.items)

    return page.next()
  })
  ```


## Upgrading to v6.x

1. Pagination has been added to the `document.search` method. Now, the result looks like what calls to `list` methods would return.

  ```javascript
  api.documents.search(searchParams)
  .then(function (firstResultPage) {
    console.info('I have ' + firstResultPage.total + 'search result items in total');
    console.info('The items on the first page are ' + firstResultPage.items);

    return firstResultPage.next();
  })
  .then(function (secondResultPage) {
    console.info('Now I am on the next page')
  });
  ```

## Upgrading to v7.x

1. Removes legacy `JSON.stringify` of request data as Axios handles this natively. This should be backwards compatible, but making a major release as could break user's unit tests if they attempt to extend the built-in Request object.

## Upgrading to v8.x

1. Removes the implicit Bluebird dependency. Bluebird, or any Promises/A+ implementation, can be provided to this SDK and all methods that previously returned a Bluebird promise will now return an instance of the implemention explicitly provided. For example:

  ```javascript
  // old
  var api = require('@mendeley/api');
  
  // new
  var api = require('@mendeley/api').withPromise(require('bluebird'));
  ```
