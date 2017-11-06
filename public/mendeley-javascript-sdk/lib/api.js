'use strict';

var assign = require('object-assign');
var utils = require('./utilities');

try {
    // prevent crashing in node-like environments
    if (!global.window) {
        global.window = {};
    }
} catch (e) {}

var endpointFactories = {
    annotations: require('./api/annotations'),
    catalog: require('./api/catalog'),
    search: require('./api/search'),
    documents: require('./api/documents'),
    documentTypes: require('./api/document-types'),
    files: require('./api/files'),
    folders: require('./api/folders'),
    followers: require('./api/followers'),
    groups: require('./api/groups'),
    institutions: require('./api/institutions'),
    institutionTrees: require('./api/institution-trees'),
    locations: require('./api/locations'),
    metadata: require('./api/metadata'),
    profiles: require('./api/profiles'),
    subjectAreas: require('./api/subject-areas'),
    trash: require('./api/trash'),
    userRoles: require('./api/user-roles')
};

function createEndpoints (options) {
    var endpoints = {};

    Object.keys(endpointFactories).forEach(function(endpointName) {
        endpoints[endpointName] = endpointFactories[endpointName](options, utils);
    });

    return endpoints;
}

module.exports = function (options) {
    var api = {};

    assign(api, createEndpoints(options));

    return api;
};
