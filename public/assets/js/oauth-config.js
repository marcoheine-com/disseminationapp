// oauth config required to use the implict grant flow aka the client-side flow.

try {
  window.oauthImplicitGrantConfig = {
    clientId: 4836,
    responseType: 'token'
  };
} catch (e) {
  console.info('Client side oauth config ignored');
  if (module.exports) {
      module.exports = { responseType: 'token' };
  }
}