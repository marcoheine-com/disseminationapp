'use strict';

var noop = require('./noop');

module.exports = function authenticatedFlow(token) {
    return {
        authenticate: function() {
            throw new Error('Cannot authenticate');
        },
        getToken: function() {
            return token;
        },
        refreshToken: noop
    };
};
