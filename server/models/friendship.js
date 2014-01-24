var mongoose = require('mongoose');
var async = require('async');

var _schema = require('./../schemas/friendship');

module.exports = function(db){

    var Schema = new mongoose.Schema(_schema, {collection: 'friendships'});

    Schema.pre('save', function(next){

        var that = this;

        if (this.from.toString() === this.to.toString()) {
            return next(Error('Bad Friendship'));
        }

        this.model('Friendship').find({ $or: [{ from: this.from, to: this.to }, { from: this.to, from: this.from }] }).count(function(err, count) {
            if (err) return next(err);
            if (count > 0) return next(Error('Conflict'));
            that.model('User').findById(that.from, function(err, user) {
                if (err) return next(err);
                user.isBlocking({ _id: that.to }, function(err, result) {
                    if (err) return next(err);
                    if (result) return next(Error('Bad Friendship'));
                    user.isBlockedBy({ _id: that.from }, function(err, result) {
                        if (err) return next(err);
                        if (result) return next(Error('Bad Friendship'));
                        next();
                    });
                });
            })
        });

        next();

    });

    return db.model('Friendship', Schema);
}