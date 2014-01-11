var mongoose = require('mongoose');
var _ = require('underscore');

var _schema = {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    visibility: mongoose.Schema.Types.Mixed,
    created: { type: Date, default: Date.now },
    updated: Date,

    name: String,
    description: String,
};

module.exports = function(db){
    var Schema = new mongoose.Schema(_schema, {collection: 'goals'});
    return db.model('Goal', Schema);
}