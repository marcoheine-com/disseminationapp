'use strict';

module.exports = {
  get: function (window, name) {
      name = name + '=';
      var ca = window.document.cookie.split(';');

      for(var i = 0; i < ca.length; i++) {
          var c = ca[i].toString().trim();

          if (c.indexOf(name) !== -1) {
              return c.substring(name.length, c.length);
          }
      }

      return '';
  },
  set: function (window, name, value, expireHours) {
      var d = new Date();
      d.setTime(d.getTime() + ((expireHours || 1)*60*60*1000));
      var expires = 'expires=' + d.toUTCString();

      window.document.cookie = name + '=' + value + '; ' + expires;
  },
  clear: function (window, name) {
      module.exports.set(window, name, '', -1);
  }
};
