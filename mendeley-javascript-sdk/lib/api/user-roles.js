'use strict';

var utils = require('../utilities');
var MIME_TYPES = require('../mime-types');

/**
 * Community API
 *
 * @namespace
 * @name api.userRoles
 */
module.exports = function userRoles(options) {

    return {
        /**
         * Get all user roles
         *
         * @method
         * @memberof api.userRoles
         * @returns {promise}
         */
        list: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/user_roles',
            headers: {
              'Accept': MIME_TYPES.USER_ROLE
            }
        })
    };
};
