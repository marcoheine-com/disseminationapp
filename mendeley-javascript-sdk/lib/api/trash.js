'use strict';

var utils = require('../utilities');
var MIME_TYPES = require('../mime-types');

/**
 * Trash API
 *
 * @namespace
 * @name api.trash
 */
module.exports = function trash(options) {
    return {

        /**
         * Retrieve a document from the trash
         *
         * @method
         * @memberof api.trash
         * @param {string} id - A document UUID
         * @returns {promise}
         */
        retrieve: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/trash/{id}',
            args: ['id'],
            headers: {
              'Accept': MIME_TYPES.DOCUMENT
            }
        }),

        /**
         * List all documents in the trash
         *
         * @method
         * @memberof api.trash
         * @returns {promise}
         */
        list: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/trash',
            headers: {
              'Accept': MIME_TYPES.DOCUMENT
            },
            responseFilter: utils.paginationFilter
        }),

        /**
         * Restore a trashed document
         *
         * @method
         * @memberof api.trash
         * @param {string} id - A document UUID
         * @returns {promise}
         */
        restore: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'POST',
            resource: '/trash/{id}/restore',
            args: ['id']
        }),

        /**
         * Permanently delete a trashed document
         *
         * @method
         * @memberof api.trash
         * @param {string} id - A document UUID
         * @returns {promise}
         */
        destroy: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'DELETE',
            resource: '/trash/{id}',
            args: ['id']
        })
    };
};
