'use strict';

var utils = require('../utilities');
var MIME_TYPES = require('../mime-types');

/**
 * Groups API
 *
 * @namespace
 * @name api.groups
 */
module.exports = function groups(options) {
    return {

        /**
         * Retrieve a group
         *
         * @method
         * @memberof api.groups
         * @param {string} id - A group UUID
         * @returns {promise}
         */
        retrieve: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/groups/v2/{id}',
            args: ['id'],
            headers: {
              'Accept': MIME_TYPES.GROUP
            }
        }),

        /**
         * Get a list of groups
         *
         * @method
         * @memberof api.groups
         * @returns {promise}
         */
        list: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/groups/v2',
            headers: {
              'Accept': MIME_TYPES.GROUP_LIST
            },
            responseFilter: utils.paginationFilter
        })
    };
};
