'use strict';

var utils = require('../utilities');
var MIME_TYPES = require('../mime-types');

/**
 * Catalog API
 *
 * @namespace
 * @name api.catalog
 */
module.exports = function catalog(options) {
    return {

        /**
         * Search the catalog
         *
         * @method
         * @memberof api.catalog
         * @param {object} params - A catalog search filter
         * @returns {promise}
         */
        search: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/catalog',
            headers: {
              'Accept': MIME_TYPES.DOCUMENT
            }
        }),

        /**
         * Retrieve a document data from catalog
         *
         * @method
         * @memberof api.catalog
         * @param {string} id - A catalog UUID
         * @param {object} params - A catalog search filter
         * @returns {promise}
         */
        retrieve: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/catalog/{id}',
            args: ['id'],
            headers: {
              'Accept': MIME_TYPES.DOCUMENT
            }
        })

    };
};
