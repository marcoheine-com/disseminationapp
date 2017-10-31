'use strict';

var utils = require('../utilities');
var MIME_TYPES = require('../mime-types');

/**
 * Institution trees API
 *
 * @namespace
 * @name api.institutionTrees
 */
module.exports = function institutionTrees(options) {
    return {

        /**
         * Return all institution trees that the given institution is a member of
         *
         * @method
         * @memberof api.institution_trees
         * @param {object} params - An institution ID
         * @returns {promise}
         */
        list: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/institution_trees',
            headers: {
              'Accept': MIME_TYPES.INSTITUTION_TREE
            }
        }),

        /**
         * Return only the child nodes of a given institution
         *
         * @method
         * @memberof api.institution_trees
         * @param {string} id - An institution ID
         * @returns {promise}
         */
        retrieve: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/institution_trees/{id}',
            args: ['id'],
            headers: {
              'Accept': MIME_TYPES.INSTITUTION_TREE
            }
        })

    };
};
