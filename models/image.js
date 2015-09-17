module.exports = function(mongoose) {
    var Schema = new mongoose.Schema({
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            default: function f() {
                return new mongoose.Types.ObjectId();
            }
        },
        imageId: {
            type: Number
        },
        x: {
            type: Number
        },
        y: {
            type: Number
        },
        color: {
            r: {
                type: Number
            },
            g: {
                type: Number
            },
            b: {
                type: Number
            }
        }
    });

    Schema.statics.createOrUpdate = function(object, callback) {
        statics.upsert(this, object, callback);
    };

    var Model = mongoose.model('Image', Schema);

    return Model;
};
