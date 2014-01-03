var mongoose = require('mongoose');
var async = require('async');

var _schema = {
    _id: {
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        accepted: { 
            /* null = pending, false = rejected */
            type: Boolean, required: true, default: null
        } 
    },
    created: { type: Date, required: true, default: Date.now },
};

module.exports = function(db){
    var Schema = new mongoose.Schema(_schema, {collection: 'friendships'});

    Schema.set('toJSON', {
        getters: true,
        virtuals: true,
        transform: function(doc, ret, options){
            delete ret._id;
            return ret;
        }
    });

    Schema.virtual('from').set(function(value){
        this._id.from = value;
    }).get(function(){
        return this._id.from;
    });

    Schema.virtual('to').set(function(value){
        this._id.to = value;
    }).get(function(){
        return this._id.to;
    });

    Schema.virtual('accepted').set(function(value){
        this._id.accepted = value;
    }).get(function(){
        return this._id.accepted;
    });

    Schema.pre('save', function(next){
        if (this._id.from === this._id.to) {
            next(Error('from_equals_to'), null);
        }

        /* If there's already a friendship, deny this one */
        this.findById({ from: this.to, to: this.from }).count(function(err, count) {
            if (count >= 1) {
                next(Error('friendship_already_exists'));
            } else {
                /* If one user is blocking the other, deny the request */
                this.model('User').find({ _id: { $or: [this._id.from, this._id.to] } }, function(err, users) {
                    if (err || users.length != 2) next(Error('bad_user_models'));
                    if (users[0].isBlocking(users[1]) || users[1].isBlocking(users[0])) {
                        return next(Error('request_blocked'));
                    } else {
                        next();
                    }
                });
            }
        });

    });

    return db.model('Friendship', Schema);
}