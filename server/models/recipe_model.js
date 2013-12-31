var mongoose = require('mongoose');

var _schema = {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    visibility: mongoose.Schema.Types.Mixed,
    created: { type: Date, default: Date.now },
    updated: Date,
    
    name: String,
    description: String,
    ingredients: [{
        _id: {type: String, ref: 'Food'},
        quantity: {
            unit: String,
            value: Number
        }
    }]
};

module.exports = function(db){
    var Schema = new mongoose.Schema(_schema, {collection: 'plans'});
    return db.model('Plan', Schema);
}