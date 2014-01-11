module.exports = function(db) {
    var mongoose = require('mongoose');
    var _schema = {
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        created: { type: Date, default: Date.now, required: true }
    };
    Schema = new mongoose.Schema(_schema, { collection: 'sessions' });
    return db.model('Session', _schema);
};