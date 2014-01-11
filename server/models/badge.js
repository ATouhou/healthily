module.exports = function(db){

    var mongoose = require('mongoose');
    var _ = require('underscore');
    var async = require('async');

    var _badges = require('./badges');

    var _schema = {
        _id: { type: String, enum: _(_badges).pluck('_id') },
        name: String,
        description: String
    };

    var Schema = new mongoose.Schema(_schema, {collection: 'badges'});
    
    Schema.statics.checkFor = function(User, callback){
        return async.filter(_badges, function(badge, callback) {
            badge.match(User, function(err, valid){
                if (err) return callback(false);
                return callback(valid);
            });
        }, callback);
    };

    return db.model('Badge', Schema);
}