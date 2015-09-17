/* Create models from schemas. */

var _user = require('./user');
var _pixel = require('./pixel');
var _taks = require('./tasks');
var _image = require('./image');

module.exports = function(mongoose) {
    _user(mongoose);
    _pixel(mongoose);
    _taks(mongoose);
	_image(mongoose);
};
