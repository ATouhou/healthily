var mongoose = require('mongoose');

var _schema = {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    visibility: mongoose.Schema.Types.Mixed,
    created: { type: Date, default: Date.now },
    updated: Date,
    name: String,
    description: String,
    budget: Number,
    foods: {
        nutrients: [{
            _id: {type: String, ref: 'Nutrient'},
            recommended: Number,
            min: Number,
            max: Number
        }],
        categories: [{type: String, ref: 'Category'}],
        banned: [{type: String, ref: 'Food'}]
    },
    exercises: [{
        _id: {type: String, ref: 'Exercise'},
        schedule: {},
        quantity: Number
    }],
    target: {
        age: {
            min: Number,
            max: Number
        },
        gender: {type: String, enum: ['any', 'male', 'female']},
        height: {
            min: Number,
            max: Number
        },
        weight: {
            min: Number,
            max: Number
        },
    },
};

module.exports = function(db){
    var Schema = new mongoose.Schema(_schema, {collection: 'plans'});
    
    Schema.methods.suitableFor = function(User){
        // TODO: check gender, age, weight, height
    };

    return db.model('Plan', Schema);
}