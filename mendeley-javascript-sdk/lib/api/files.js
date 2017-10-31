'use strict';

var utils = require('../utilities');
var MIME_TYPES = require('../mime-types');

/**
 * Files API
 *
 * @namespace
 * @name api.files
 */
module.exports = function files(options) {

    return {

        /**
         * Create a new file
         *
         * @method
         * @memberof api.files
         * @param {object} file - A file object
         * @param {string} documentId - A document UUID
         * @param {function} progressHandler - Function called every time a progress event occurs
         * @returns {promise}
         */
        create: utils.requestWithFileFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'POST',
            resource: '/files',
            headers: {
              'Accept': MIME_TYPES.FILE
            },
            linkType: 'document'
        }),

        /**
         * Get a list of files for a document
         *
         * @method
         * @memberof api.files
         * @param {string} id - A document UUID
         * @returns {promise}
         */
        list: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/files?document_id={id}',
            args: ['id'],
            headers: {
              'Accept': MIME_TYPES.FILE
            }
        }),

        /**
         * Get a list of files for a user
         *
         * @method
         * @memberof api.files
         * @returns {promise}
         */
        listAll: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/files',
            args: [],
            headers: {
              'Accept': MIME_TYPES.FILE
            },
            responseFilter: utils.paginationFilter
        }),

        /**
         * Get a file
         *
         * @method
         * @memberof api.files
         * @param {string} id - A file UUID
         * @returns {promise}
         */
        retrieve: utils.requestFun({
            responseFilter: utils.passFilter,
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/files/{id}',
            args: ['id'],
            noFollow: true
        }),

        /**
         * Delete a file
         *
         * @method
         * @memberof api.files
         * @param {string} id - A file UUID
         * @returns {promise}
         */
        remove: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'DELETE',
            resource: '/files/{id}',
            args: ['id']
        })

    };
};
