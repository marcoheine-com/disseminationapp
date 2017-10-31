'use strict';

var utils = require('../utilities');
var MIME_TYPES = require('../mime-types');

/**
 * Profiles API
 *
 * @namespace
 * @name api.profiles
 */
module.exports = function profiles(options) {

    return {

        /**
         * Retrieve the profile of the currently logged user
         *
         * @method
         * @memberof api.profiles
         * @returns {promise}
         */
        me: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/profiles/me',
            headers: {
              Accept: MIME_TYPES.PROFILES
            }
        }),

        /**
         * Retrieve a profile by id
         *
         * @method
         * @memberof api.profiles
         * @param {string} id - User id
         * @returns {promise}
         */
        retrieve: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/profiles/{id}',
            args: ['id'],
            headers: {
              Accept: MIME_TYPES.PROFILES
            }
        }),

        /**
         * Update profiles
         *
         * @method
         * @memberof api.profiles
         * @param {object} data - The new profiles data
         * @returns {promise}
         */
        update: utils.requestWithDataFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'PATCH',
            resource: '/profiles/me',
            headers: {
              'Content-Type': MIME_TYPES.PROFILE_UPDATE,
              Accept: MIME_TYPES.PROFILES
            },
            followLocation: true
        }),

        /**
         * Retrieve a profile by email address
         *
         * @method
         * @memberof api.profiles
         * @param {string} email - Email address
         * @returns {promise}
         */
        retrieveByEmail: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/profiles?email={email}',
            args: ['email'],
            headers: {
                Accept: MIME_TYPES.PROFILES
            }
        }),

        /**
         * Retrieve a profile by link
         *
         * @method
         * @memberof api.profiles
         * @param {string} link - Short name
         * @returns {promise}
         */
        retrieveByLink: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/profiles?link={link}',
            args: ['link'],
            headers: {
                Accept: MIME_TYPES.PROFILES
            }
        }),

        /**
         * Retrieve profiles by identifiers
         *
         * @method
         * @memberof api.profiles
         * @param {object} params - Parameters to pass to GET /profiles
         * @returns {promise}
         */
        retrieveByIdentifier: utils.requestFun({
            authFlow: options.authFlow,
            baseUrl: options.baseUrl,
            method: 'GET',
            resource: '/profiles',
            headers: {
                Accept: MIME_TYPES.PROFILES
            }
        })

    };
};
