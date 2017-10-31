'use strict';

var utils = require('../utilities');
var MIME_TYPES = require('../mime-types');

/**
 * Community API
 *
 * @namespace
 * @name api.subjectAreas
 */
module.exports = function subjectAreas(options) {

    return {
        /**
         * Get all subject areas
         *
         * @method
         * @memberof api.subjectAreas
         * @returns {promise}
         */
        list: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/subject_areas',
            headers: {
              'Accept': MIME_TYPES.SUBJECT_AREA
            }
        })
    };
};
