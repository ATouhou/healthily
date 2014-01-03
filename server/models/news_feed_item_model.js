var mongoose = require('mongoose');

var _schema = {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: String,
    date: { type: Date, required: true, default: Date.now },
    activity: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', required: true, index: { unique: true } }
};

module.exports = function(db){
    var Schema = new mongoose.Schema(_schema, {collection: 'news_feed_items'});
    return db.model('NewsFeedItem', Schema);
}