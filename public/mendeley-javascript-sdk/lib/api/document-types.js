'use strict';

var MIME_TYPES = require('../mime-types');

/**
 * Document Types API
 *
 * @namespace
 * @name api.documentTypes
 */
module.exports = function documentTypes(options, utils) {
    return {

        /**
         * Retrieve the document types
         *
         * @method
         * @memberof api.documentTypes
         * @returns {promise}
         */
        retrieve: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/document_types',
            headers: {
              'Accept': MIME_TYPES.DOCUMENT_TYPE
            }
        })
    };
};
