module.exports = function(mongoose) {
    var Schema = new mongoose.Schema({
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            default: function f() {
                return new mongoose.Types.ObjectId();
            }
        },
        pixel: {
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Pixel'
            },
            x: {
                type: Number
            },
            y: {
                type: Number
            },
            wholeWindow: {
                type: Boolean
            }
        },
        hasPixel: {
            type: Boolean
        },
        timer: {
            type: Date,
            default: Date.now
        }
    });

    Schema.statics.createOrUpdate = function(object, callback) {
        statics.upsert(this, object, callback);
    };

    var Model = mongoose.model('User', Schema);

    return Model;
};
