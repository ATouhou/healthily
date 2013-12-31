var mongoose = require('mongoose');

var _schema = {
    _id: String,
    tagname: { type: String, index: true },
    units: String,
    nutrdesc: String,
    is_default: { type: Boolean, index: true },
    usda_active: Boolean,
    num_dec: Number,
    dris: [{
        age: {begin: Number, end: Number},
        gender: {type: String, enum: ['male', 'female', 'avg']},
        value: Number,
        ul: Number,
    }]
};

module.exports = function(db){
    var Schema = new mongoose.Schema(_schema, {collection: 'nutrients'});
    return db.model('Nutrient', Schema);
}