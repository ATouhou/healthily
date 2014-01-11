var mongoose = require('mongoose');
var async = require('async');

var _schema = require('./../schemas/friendship');

module.exports = function(db){

    var Schema = new mongoose.Schema(_schema, {collection: 'friendships'});

    Schema.pre('save', function(next){

        if (this.from.toString() === this.to.toString()) {
            next(Error('Conflict'));
        }

        // /* If there's already a friendship, deny this one */
        // this.findById({ from: this.to, to: this.from }).count(function(err, count) {
        //     if (count >= 1) {
        //         next(Error('Conflict'));
        //     } else {
        //         /* If one user is blocking the other, deny the request */
        //         this.model('User').find({ _id: { $or: [this._id.from, this._id.to] } }, function(err, users) {
        //             if (err || users.length != 2) next(Error('bad_user_models'));
        //             if (users[0].isBlocking(users[1]) || users[1].isBlocking(users[0])) {
        //                 return next(Error('request_blocked'));
        //             } else {
        //                 next();
        //             }
        //         });
        //     }
        // });

        next();

    });

    return db.model('Friendship', Schema);
}