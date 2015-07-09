/* Create models from schemas. */

var _user = require('./user');
var _pixel = require('./pixel');
var _taks = require('./tasks');

module.exports = function(mongoose) {
    _user(mongoose);
    _pixel(mongoose);
    _taks(mongoose);
};
