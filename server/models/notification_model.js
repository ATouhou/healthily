var mongoose = require('mongoose');

var _schema = {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: String,
    created: { type: Date, required: true, default: Date.now },
    updated: { type: Date, required: false, default: null },
    seen: { type: Date, required: false, default: null },
    visited: { type: Date, required: false, default: null },
    data: {
        people: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        action: String,
        object: mongoose.Schema.Types.Mixed
    }
};

module.exports = function(db){
    var Schema = new mongoose.Schema(_schema, {collection: 'notifications'});
    return db.model('Notification', Schema);
}