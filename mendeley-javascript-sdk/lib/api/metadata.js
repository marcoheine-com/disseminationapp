'use strict';

var utils = require('../utilities');
var MIME_TYPES = require('../mime-types');

/**
 * Metadata API
 *
 * @namespace
 * @name api.metadata
 */
module.exports = function metadata(options) {

    return {

        /**
         * Retrieve a document metadata
         *
         * @method
         * @memberof api.metadata
         * @param {object} params - A metadata search filter
         * @returns {promise}
         */
        retrieve: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/metadata',
            headers: {
              'Accept': MIME_TYPES.DOCUMENT_LOOKUP
            }
        })

    };
};
