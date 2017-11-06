'use strict';

var utils = require('../utilities');
var MIME_TYPES = require('../mime-types');
/**
 * Folders API
 *
 * @namespace
 * @name api.folders
 */
module.exports = function folders(options) {

    return {

        /**
         * Create a new folder
         *
         * @method
         * @memberof api.folders
         * @param {object} data - The folder data
         * @returns {promise}
         */
        create: utils.requestWithDataFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'POST',
            resource: '/folders',
            headers: {
              'Content-Type': MIME_TYPES.FOLDER,
              'Accept': MIME_TYPES.FOLDER
            },
            followLocation: true
        }),

        /**
         * Retrieve a folder
         *
         * @method
         * @memberof api.folders
         * @param {string} id - A folder UUID
         * @returns {promise}
         */
        retrieve: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/folders/{id}',
            args: ['id'],
            headers: {
              'Accept': MIME_TYPES.FOLDER
            }
        }),

        /**
         * Update a folder
         *
         * @method
         * @memberof api.folders
         * @param {string} id - A folder UUID
         * @param {object} data - The folder data
         * @returns {promise}
         */
        update: utils.requestWithDataFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'PATCH',
            resource: '/folders/{id}',
            args: ['id'],
            headers: {
              'Content-Type': MIME_TYPES.FOLDER,
              'Accept': MIME_TYPES.FOLDER
            },
            followLocation: true
        }),

        /**
         * Delete a folder
         *
         * @method
         * @memberof api.folders
         * @param {string} id - A folder UUID
         * @returns {promise}
         */
        delete: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'DELETE',
            resource: '/folders/{id}',
            args: ['id']
        }),

        /**
         * Remove a document from a folder
         *
         * @method
         * @memberof api.folders
         * @param {string} id - A folder UUID
         * @param {string} documentId - A document UUID
         * @returns {promise}
         */
        removeDocument: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'DELETE',
            resource: '/folders/{id}/documents/{docId}',
            args: ['id', 'docId']
        }),

        /**
         * Add a document to a folder
         *
         * @method
         * @memberof api.folders
         * @param {string} id - A folder UUID
         * @returns {promise}
         */
        addDocument: utils.requestWithDataFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'POST',
            resource: '/folders/{id}/documents',
            args: ['id'],
            headers: {
              'Content-Type': MIME_TYPES.DOCUMENT
            }
        }),

        /**
         * Get a list of folders
         *
         * @method
         * @memberof api.folders
         * @returns {promise}
         */
        list: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/folders',
            headers: {
              'Accept': MIME_TYPES.FOLDER
            },
            responseFilter: utils.paginationFilter
        })
    };
};
