'use strict';

var MIME_TYPES = require('../mime-types');

/**
 * Search API
 *
 * @namespace
 * @name api.search
 */
module.exports = function search(options, utils) {
    return {

        /**
         * Search the catalog
         *
         * @method
         * @memberof api.search
         * @param {object} params - A search catalog
         * @returns {promise}
         */
        catalog: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/search/catalog',
            headers: {
              'Accept': MIME_TYPES.DOCUMENT
            },
            responseFilter: utils.paginationFilter
        }),

        /**
         * Search for profiles
         *
         * @method
         * @memberof api.search
         * @param {object} params
         * @returns {promise}
         */
        profiles: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/search/profiles',
            headers: {
              'Accept': MIME_TYPES.PROFILE
            },
            responseFilter: utils.paginationFilter
        }),

        /**
         * Search for groups
         *
         * @method
         * @memberof api.search
         * @param {object} params
         * @returns {promise}
         */
        groups: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/search/v2/groups',
            headers: {
              'Accept': MIME_TYPES.GROUP_SEARCH_RESULTS
            }
        })
    };
};
