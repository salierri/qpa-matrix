/* Create models from schemas. */

var _user = require('./user');
var _pixel = require('./pixel');

module.exports = function(mongoose) {
    _user(mongoose);
    _pixel(mongoose);
};
