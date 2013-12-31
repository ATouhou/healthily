var mongoose = require('mongoose');

var _schema = {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    visibility: Mongoose.Schema.Types.Mixed,
    created: { type: Date, default: Date.now },
    updated: Date,

    name: String,
    description: String,
    burned: Number /* TODO: add reps/count/time/target... */
};

module.exports = function(db){
    var Schema = new mongoose.Schema(_schema, {collection: 'exercises'});
    return db.model('Exercise', Schema);
}