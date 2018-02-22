// oauth config required to use the implict grant flow aka the client-side flow.
// make sure to add your own client ID in line 5
try {
  window.oauthImplicitGrantConfig = {
    clientId: 'YOUR CLIENT ID',
    responseType: 'token'
  };
} catch (e) {
  console.info('Client side oauth config ignored');
  if (module.exports) {
      module.exports = { responseType: 'token' };
  }
}