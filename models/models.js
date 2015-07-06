/* Create models from schemas. */

var _admin_user = require('./user');

module.exports = function(mongoose) {
    _admin_user(mongoose);
};
