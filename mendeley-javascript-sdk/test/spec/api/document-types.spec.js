'use strict';

var utilitiesMock = require('../../mocks/utilities');
var apiOptions = require('../../mocks/apiOptions');
var MIME_TYPES = require('../../../lib/mime-types');
var documentTypes = require('../../../lib/api/document-types');

describe('documentTypes api', function() {
    beforeAll(function() { spyOn(utilitiesMock, 'requestFun').and.callThrough(); });
    afterEach(function() { utilitiesMock.requestFun.calls.reset(); });

    describe('when initialised', function() {
        it('calls utilities.requestFun with constructor options', function() {
            documentTypes(apiOptions, utilitiesMock);
            expect(utilitiesMock.requestFun).toHaveBeenCalledWith(
              jasmine.objectContaining(apiOptions)
            );
        });

        it('calls utilities.requestFun with correct request setup', function() {
            documentTypes(apiOptions, utilitiesMock);
            expect(utilitiesMock.requestFun).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    method: 'GET',
                    resource: '/document_types',
                    headers: { 'Accept': MIME_TYPES.DOCUMENT_TYPE }
                })
            );
        });

        it('returns api object with "retrieve" property containing the request function', function() {
            var documentTypesApi = documentTypes(apiOptions, utilitiesMock);
            expect(documentTypesApi.retrieve).toEqual(utilitiesMock.requestFun());
        });
    });

});
