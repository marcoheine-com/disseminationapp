'use strict';

module.exports = function (val, message) {
  if (!val) {
    throw new Error(message);
  }
};
