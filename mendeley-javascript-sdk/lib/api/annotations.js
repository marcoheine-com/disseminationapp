'use strict';

var utils = require('../utilities');
var MIME_TYPES = require('../mime-types');

/**
 * Annotations API
 *
 * @namespace
 * @name api.annotations
 */
module.exports = function annotations(options) {

    return {

        /**
         * Retrieve an annotation
         *
         * @method
         * @memberof api.annotations
         * @param {string} id - Annotation UUID
         * @returns {promise}
         */
        retrieve: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/annotations/{id}',
            args: ['id'],
            headers: {
              'Accept': MIME_TYPES.ANNOTATION
            }
        }),

        /**
         * Patch a single annotation
         *
         * @method
         * @memberof api.annotations
         * @param {string} id - Annotation UUID
         * @param {object} text - The updated note text
         * @returns {Promise}
         */
        patch: utils.requestWithDataFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'PATCH',
            resource: '/annotations/{id}',
            args: ['id'],
            headers: {
              'Content-Type': MIME_TYPES.ANNOTATION,
              'Accept': MIME_TYPES.ANNOTATION
            },
            followLocation: true
        }),

        /**
         * Create a single annotation
         *
         * @method
         * @memberof api.annotations
         * @param {object} text - Note text
         * @returns {Promise}
         */
        create: utils.requestWithDataFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'POST',
            resource: '/annotations',
            headers: {
              'Content-Type': MIME_TYPES.ANNOTATION,
              'Accept': MIME_TYPES.ANNOTATION
            },
            followLocation: true
        }),

         /**
         * Delete a single annotation
         *
         * @method
         * @memberof api.annotations
         * @param {string} id - Annotation UUID
         * @returns {Promise}
         */
        delete: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'DELETE',
            resource: '/annotations/{id}',
            args: ['id']
        }),

        /**
         * Get a list of annotations
         *
         * @method
         * @memberof api.annotations
         * @returns {promise}
         */
        list: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/annotations',
            headers: {
              'Accept': MIME_TYPES.ANNOTATION
            },
            responseFilter: utils.paginationFilter
        })
    };
};
