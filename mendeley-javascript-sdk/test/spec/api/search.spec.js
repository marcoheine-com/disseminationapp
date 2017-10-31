'use strict';

var utilitiesMock = require('../../mocks/utilities');
var apiOptions = require('../../mocks/apiOptions');
var MIME_TYPES = require('../../../lib/mime-types');
var search = require('../../../lib/api/search');

describe('search api', function() {
    beforeAll(function() { spyOn(utilitiesMock, 'requestFun').and.callThrough(); });
    afterEach(function() { utilitiesMock.requestFun.calls.reset(); });

    describe('when initialised', function() {
        it('calls utilities.requestFun with constructor options', function() {
            search(apiOptions, utilitiesMock);
            expect(utilitiesMock.requestFun).toHaveBeenCalledWith(
                jasmine.objectContaining(apiOptions)
            );
        });

        describe('catalog search', function() {
            it('calls utilities.requestFun with correct request setup', function() {
                search(apiOptions, utilitiesMock);
                expect(utilitiesMock.requestFun).toHaveBeenCalledWith(
                    jasmine.objectContaining({
                        method: 'GET',
                        resource: '/search/catalog',
                        headers: { 'Accept': MIME_TYPES.DOCUMENT },
                        responseFilter: utilitiesMock.paginationFilter
                    })
                );
            });

            it('returns api object with "catalog" property containing the request function', function() {
                var searchApi = search(apiOptions, utilitiesMock);
                expect(searchApi.catalog).toEqual(utilitiesMock.requestFun());
            });
        });

        describe('profiles search', function() {
            it('calls utilities.requestFun with correct request setup', function() {
                search(apiOptions, utilitiesMock);
                expect(utilitiesMock.requestFun).toHaveBeenCalledWith(
                    jasmine.objectContaining({
                        method: 'GET',
                        resource: '/search/profiles',
                        headers: { 'Accept': MIME_TYPES.PROFILE },
                        responseFilter: utilitiesMock.paginationFilter
                    })
                );
            });

            it('returns api object with "profiles" property containing the request function', function() {
                var searchApi = search(apiOptions, utilitiesMock);
                expect(searchApi.profiles).toEqual(utilitiesMock.requestFun());
            });
        });

        describe('groups search', function() {
            it('calls utilities.requestFun with correct request setup', function() {
                search(apiOptions, utilitiesMock);
                expect(utilitiesMock.requestFun).toHaveBeenCalledWith(
                    jasmine.objectContaining({
                        method: 'GET',
                        resource: '/search/v2/groups',
                        headers: {
                          'Accept': MIME_TYPES.GROUP_SEARCH_RESULTS
                        }
                    })
                );
            });

            it('returns api object with "groups" property containing the request function', function() {
                var searchApi = search(apiOptions, utilitiesMock);
                expect(searchApi.groups).toEqual(utilitiesMock.requestFun());
            });
        });
    });

});
