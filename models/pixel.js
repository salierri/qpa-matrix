module.exports = function(mongoose) {
    var Schema = new mongoose.Schema({
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            default: function f() {
                return new mongoose.Types.ObjectId();
            }
        },
        x: {
            type: Number
        },
        y: {
            type: Number
        },
        leftCorner: {
            type: Boolean
        },
        reserved: {
            type: Boolean
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

    var Model = mongoose.model('Pixel', Schema);

    return Model;
};
