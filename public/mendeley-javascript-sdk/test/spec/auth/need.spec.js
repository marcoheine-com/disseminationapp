/* jshint sub: true */
'use strict';

var need = require('../../../lib/auth/need');

describe('need', function() {
    it('should explode', function() {
        expect(function () {
          need();
        }).toThrow();
    });

    it('should not explode', function() {
        expect(function () {
          need(true);
        }).not.toThrow();
    });
});
/* jshint sub: false */
