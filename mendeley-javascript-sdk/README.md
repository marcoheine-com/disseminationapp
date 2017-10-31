# Mendeley JavaScript SDK

[![Build Status][travis-image]][travis-url] [![Dependencies][david-image]][david-url]

## About the SDK

The SDK provides a convenient library for accessing the Mendeley API with client-side and server-side JavaScript.

## Installation

Installation can be done with [npm][]:

    $ npm install @mendeley/api

Or with [bower][]:

    $ bower install mendeley-javascript-sdk

Or clone the git repository:

    $ git clone https://github.com/Mendeley/mendeley-javascript-sdk

The SDK is available as a CommonJS module or a standalone bundle. To use the standalone library add a link from your HTML page.

```html
<script src="/your/path/to/mendeley-javascript-sdk/dist/standalone.js"></script>
```

To use as a CommonJS module in the browser, you'll need a module loader like [browserify][] or [webpack][].

Depending on your target browsers, you may need to polyfill Promise because the SDK relies on a global Promise variable being defined. For example, in webpack configuration include the following:

```
{
    plugins: [new webpack.ProvidePlugin({
        Promise: 'es6-promise-promise'
    })];
}
```

Alternatively, you can pass your own Promise implementation at runtime:

```js
var sdk = require('@mendeley/api').withPromise(require('bluebird'));
```

Some ECMAScript5 features are used so for older browsers you may need to shim these methods, for example with [es5-shim][].


## Registering a Client

To use the API you first need to register your application to get a client ID which you can use with OAuth2.

Go to [the Mendeley developers site][], sign-in with your Mendeley account details and click on "My Apps" and follow the instructions to register a new application.

## OAuth2 Flows

To begin a session you must set an authentication flow. This SDK includes code for the implict grant and auth code flows.

### Implicit Grant Flow

For purely client-side applications you can use the implicit grant flow which only requires a client id. To initiate the flow call:

```javascript
var sdk = require('@mendeley/api');
var api = sdk({
  authFlow: sdk.Auth.implicitGrantFlow({
    clientId: /* YOUR CLIENT ID */
  })
});
```

The options are:

- `clientId` - Your registered client ID. **Required**.
- `redirectUrl` - must match the redirect URL you used when registering the client. Defaults to the current URL.
- `accessTokenCookieName` - the name of the cookie to store the access token in. You should only change this if it clashes with another cookie you use. Defaults to `accessToken`.
- `apiAuthenticateUrl` - Where to direct the user if authentication fails. Defaults to `https://api.mendeley.com/oauth/authorize`
- `onNotAuthenticated` - Invoked when getting a token fails. By default they will be directed to `apiAuthenticateUrl`.

The API internally will handle stale cookies by redirecting to the log-in page if any request fails with a status of 401 Unauthorized.

### Authorization Code Flow

For server applications you can use the authorization code flow. This requires server-to-server communication in order to acquire an access token. Implementing this depends on your language, framework etc. so isn't included in this SDK, but there is a nodejs example included (more info below).

The main difference is the server will do the token exchange and set the access token cookie. From the client-side point of view you start the flow like:

```javascript
var sdk = require('@mendeley/api');
var api = sdk({
  authFlow: sdk.Auth.authCodeFlow({
    apiAuthenticateUrl: '/login',
    refreshAccessTokenUrl: '/refresh-token'
  })
});
```

The options are:

- `apiAuthenticateUrl` - A URL on *your server* to redirect to when authentication fails. That URL should in turn redirect to the Mendeley OAuth endpoint passing the relevant credentials, as in this flow the client doesn't have any credentials. Required, defaults to `'/login'`.
- `refreshAccessTokenUrl` - A URL on *your server* that will attempt to refresh the current access token. Optional, defaults to false.
- `accessTokenCookieName` - the name of the cookie to store the access token in. You should only change this if it clashes with another cookie you use. Defaults to `accessToken`.
- `onNotAuthenticated` - Invoked when getting a token fails. By default they will be directed to `apiAuthenticateUrl`.

### Client Credentials Flow

Client Credentials allow you to use your client id & secret to obtain an access token to access the Mendeley API.  Use this to read publicly available data that is not specific to an individual user.

This flow should only be used by clients that will not leak your client secret into the public domain, e.g. never use this in the browser.

To obtain a client id and secret, register your app on [the Mendeley developers site][].

```javascript
var sdk = require('@mendeley/api');
var api = sdk({
  authFlow: sdk.Auth.clientCredentialsFlow({
    clientId: /* your client id */,
    clientSecret: /* your client secret */,
    redirectUri: /* your redirect uri */
  })
});
```

The options are:

- `tokenUrl` - Where we get the access token from, defaults to `https://api.mendeley.com/oauth/token`
- `clientId` - your client id obtained when you register your app
- `clientSecret` - Your client secret obtained when you register your app
- `redirectUri` - A URL on *your server* specified when you register your app
- `scope` - Defaults to 'all'
- `onNotAuthenticated` - Invoked when getting a token fails.

### Refresh token flow

This flow is for when a user has previously obtained a refresh token from the Mendeley OAuth endpoint and lets your app use it to obtain an access token on the users' behalf.

This flow should only be used by clients that will not leak your client secret into the public domain, e.g. never use this in the browser.

To obtain a client id and secret, register your app on [the Mendeley developers site][].

```javascript
var sdk = require('@mendeley/api');
var api = sdk({
  authFlow: sdk.Auth.refreshTokenFlow({
    refreshToken: /* refresh token */,
    clientId: /* your client id */,
    clientSecret: /* your client secret */
  })
});
```

The options are:

- `refreshToken` - The refresh token
- `tokenUrl` - Where we get the access token from, defaults to `https://api.mendeley.com/oauth/token`
- `clientId` - your client id obtained when you register your app
- `clientSecret` - Your client secret obtained when you register your app
- `onAccessToken` - An optional callback function invoked when the access token changes with the signature `(accessToken, expiresIn)`. Use this to set cookies, etc.
- `onRefreshToken` - An optional callback function invoked when a refresh token is received with the signature `(refreshToken)`. Use this to store the refresh token securely, etc.
- `onNotAuthenticated` - Invoked when refreshing the users' token fails. You should redirect the user somewhere where they can acquire a new refresh token.
- `accessToken` - If you have an access token from a previous request, specify it to save the initial token exchange request

A full example using [Express][] middleware might be:

```javascript
module.exports = function (request, response, next) {
  if (!request.cookies.refreshToken) {
    // no valid credentials
    return next();
  }

  response.locals.mendeley = sdk({
    authFlow: mendeley.Auth.refreshTokenFlow({
      accessToken: request.cookies.accessToken, // will be used if previously set
      refreshToken: request.cookies.refreshToken,
      clientId: process.env.MENDELEY_CLIENT_ID,
      clientSecret: process.env.MENDELEY_CLIENT_SECRET,
      onNotAuthenticated: function () {
        response.redirect('/sign/in');
      },
      onAccessToken: function (accessToken, expiresIn) {
          // set the accessToken cookie for use on the next request
          response.cookie('accessToken', accessToken, {
            maxAge: expiresIn,
            httpOnly: false
          });
        }
      })
    });

    return next();
  }
};
```


## Basic Usage

Once the OAuth flow is complete you can start grabbing data for the user. CORS is enabled by default for all clients so there's no need to do anything special to implement the cross-domain requests (unless you need to support browsers that don't have CORS).

Each API is exposed as a property of the SDK, for example `api.documents`, `api.folders`.

Methods that make API calls return [ES6 Promises][]. Each call will either resolve with some data or reject with a response object according to the response from [axios][]. Here's an example using the standalone version:

```javascript
api.documents.list().then(function(docs) {

    console.log('Success!');
    console.log(docs);

}).catch(function(response) {

    console.log('Failed!');
    console.log('Status:', response.status);

});
```

Here's an example using [requirejs][]:

```javascript
define(function(require) {
    var sdk = require('@mendeley/api')({
      authFlow:
    });
    var api = sdk({
      authFlow: sdk.Auth.authCodeFlow()
    })

    api.documents.list().then(function() {

        console.log('Success!');
        console.log(docs);

    }).catch(function(response) {

        console.log('Failed!');
        console.log('Status:', response.status);

    });
});
```

## Pagination

API resources that implement `list` functions return paginated responses.

These have a `total` property that represents the total number of resources and some of `firstPage`, `nextPage`, `previousPage` and `lastPage` methods that return promises which resolve to the first, next, previous and last page of resources respectively.

The actual resources loaded are accessible by the `page` property.

The presence of the pagination methods depend on where in the collection you are at the time.  If you are on the first page of results for example, the `firstPage` method will not be present.  Similarly if there is only one page of results there will be no pagination methods available.

### Example

```javascript
var api = require('@mendeley/api')(options);

api.documents.list()
.then(function (result) {
  console.info('There are ' + result.total + ' documents in total');

  console.info('The first page of documents is ' + result.page);

  return result.next();
})
.then(function (result) {
  console.info('The next page of documents is ' + result.page);

  return result.previous();
})
.then(function (result) {
  console.info('The previous page of documents is ' + result.page);

  return result.last();
})
.then(function (result) {
  console.info('The last page of documents is ' + result.page);
});
```

### "Handshake" between server and client.

Sometimes its useful to be able to render from the server and paginate the rest from the client-side javascript. `pagination.decorate` method is ueful for adding the standard pagination methods from a stringified page result. Heres an example with expressjs.

```javascript
// server.js
var express = require('express');
var app = express();
var api = require('@mendeley/api')(options);

app.get('/', function (req, res) {

  api.documents.list()
  .then(function(result) {
      res.send('<script>');
      res.send('window.__data=' + JSON.stringify(result) + ';');
      res.send('</script>')
      res.end();
  });
});
```
```javascript
// client.js
var api = require('@mendeley/api');
var pagination = require('@mendeley/api/pagination')

// build pagination object with paging methods from the stringified object
var page = pagination.decorate(window.__data, authFlow);

// call the next page of pagination
page.next()
.then(function(result) {
  // add the new page
});

```


## Examples

There are more examples in the `examples/` directory. To try the examples you will need [nodejs][] installed. *Note:* nodejs is not required to use this library, it is only used to serve the examples from a local URL you can use with OAuth2.

To run the examples you will need to [register your application][] to get a client ID (as described above). Use `http://localhost:8111/examples/` as the redirect URL.

The default example setup uses the implicit grant flow. To use this copy `examples/oauth-config.implicit-grant.js.dist` to `examples/oauth-config.js`, fill in your client ID, then run:

    $ npm install
    $ npm start

Go to http://localhost:8111/examples/ in your browser and you should be redirected to log-in to Mendeley. Once logged in you'll be redirected back to the examples.


### Example Using Authorization Code Flow

There is also some example nodejs code for using the authorization code flow.

To try out the authorization code flow copy `examples/oauth-config.auth-code.js.dist` to `examples/oauth-config.js`, filling in your client ID and secret.

To use this flow you will need to change your clients redirect URI to `http://localhost:8111/oauth/token-exchange` (or register a new one).


## Documentation

SDK documentation can be generated with:

    $ npm run build-jsdoc

This will be output to the `docs/` directory.

Further documentation on the API is available at http://dev.mendeley.com.

For an interactive console to the API visit https://api.mendeley.com/apidocs.


## Contributing

We would love to have your contributions, bug fixes and feature requests! You can raise an issue here, or ideally send us a pull request.

All contributions should be made by pull request (even if you have commit rights!).

In lieu of a formal styleguide, take care to maintain the existing coding style.

Please add unit tests for any new or changed functionality. Tests run twice: in PhantomJS using Karma and Jasmine, and in Node using only Jasmine, run them with:

    $ npm test

If you make changes please check coverage reports under `/coverage` to make sure you haven't left any new code untested.

Please note the aim of this SDK is to connect to the existing Mendeley API, not to add to that API. For more information about the API and to give any feedback please visit [the Mendeley developers site].


[ES6 Promises]:https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise
[axios]:https://github.com/mzabriskie/axios#response-schema
[es5-shim]:https://github.com/es-shims/es5-shim
[browserify]:http://browserify.org/
[webpack]:http://webpack.github.io
[the Mendeley developers site]:http://dev.mendeley.com
[register your application]:http://dev.mendeley.com
[nodejs]:http://nodejs.org
[npm]:http://npmjs.com
[bower]:http://bower.io
[Express]:http://expressjs.com

[travis-image]: http://img.shields.io/travis/Mendeley/mendeley-javascript-sdk/master.svg?style=flat
[travis-url]: https://travis-ci.org/Mendeley/mendeley-javascript-sdk
[david-image]: https://david-dm.org/Mendeley/mendeley-javascript-sdk.svg
[david-url]: https://david-dm.org/Mendeley/mendeley-javascript-sdk
