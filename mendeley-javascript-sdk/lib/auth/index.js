'use strict';

module.exports = {
    implicitGrantFlow: require('./implicit-grant-flow'),
    authCodeFlow: require('./auth-code-flow'),
    authenticatedFlow: require('./authenticated-flow'),
    clientCredentialsFlow: require('./client-credentials-flow'),
    refreshTokenFlow: require('./refresh-token-flow')
};
