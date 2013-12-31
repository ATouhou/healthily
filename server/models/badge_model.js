var mongoose = require('mongoose');
var _ = require('underscore');

var _badges = require('badges');

var _schema = {
    _id: { type: String, enum: _(_badges).pluck('_id') },
    name: String,
    description: String
},

module.exports = function(db){
    var Schema = new mongoose.Schema(_schema, {collection: 'badges'});
    
    Schema.static.methods.checkFor = function(User, callback){
        return async.filter(_badges, function(badge, callback) {
            badge.match(User, function(err, valid){
                return callback(valid && !User.hasOf('badges', badge));
            });
        }, callback);
    };

    return db.model('Badge', Schema);
}