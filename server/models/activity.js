var _ = require('underscore');
var mongoose = require('mongoose');

/* TODO: add validation rules */

var _types = [
    'share', 'comment', 'like',
    'post',
    'exercise',
    'food',
    'meal',
    'recipe',
    'weight', 
    'plan', 'goal', 'badge'
];

var _schema = require('./../schemas/activity');

module.exports = function(db){
    var Schema = new mongoose.Schema(_schema, {collection: 'activities'});

    Schema.set('toJSON', {
        getters: true,
        virtuals: true,
        transform: function(doc, ret, options){
            /* TODO: Get the latest revisions of the activity and all of its comments */
            // ret.revisions = ret.revisions[0] || ret.revisions;
            if (ret.comments){
                ret.comments.forEach(function(comment, index){
                    ret.comments[index] = _.extend(comment, _.last(comment.revisions));
                    delete ret.comments[index].revisions;
                });
            }
            return ret;
        }
    });
    
    // Schema.methods.visibleTo = function(user, callback){
    //     this.model('User').findById.call(this, this.owner, function(err, owner){
    //         owner.getFriends.call(this, function(err, friends){
    //             this.getAudiance.call(this, friends, owner.lists, function(err, audiance){
    //                 // TODO: consider when the user is blocked
    //                 return callback(err, audiance === 'public' || user._id === owner._id || audiance.indexOf(user._id) > -1);
    //             });
    //         });
    //     });
    // };

    Schema.methods.getAudiance = function(visibility, callback) {

        /* The visibility property can be in one of these formats:
            - String: 'private', 'public', 'friends', _id ref to a User, name of a User list of friends
            - Object: that has an _id property referring to a User,
            - Array: of a mix of the above
         */

        /* This method should always return an array of _ids referring to users. */

        var activity = this;

        this.model('User').findById(this.owner).exec(function(err, user) {
            
            if (err) return callback(err, null);

            user.getFriends(function(err, friends) {

                if (err) return callback(err, null);

                var lists = user.lists,
                    friends = friends,
                    audiance = [],
                    err = null;

                if (visibility instanceof Array) {
                    visibility.forEach(function(item) {
                        activity.getAudiance(item, function(subErr, subAudiance) {
                            if (subErr) err = subErr;
                            else audiance.concat(subAudiance);
                        });
                    });
                } else if ('string' === typeof visibility) {
                    switch (visibility) {
                        case 'public':
                            audiance = ['public'];
                            break;
                        case 'private':
                            audiace = [];
                            break;
                        case 'friends':
                            audiance = friends;
                            break;
                        default:
                            var list = _(lists).findWhere( { _id: visiblity } );
                            if ('undefined' !== typeof list) {
                                audiance = list.members;
                            } else {
                                audiance = [visibility];
                            }
                            break;
                    }
                } else if (visibility.hasOwnProperty('_id')) {
                    audiance = [visibility._id];
                } else {
                    err = Error('Bad Audiance');
                }

                callback(err, audiance.length ? audiance : null);

            });

        });
    };

    Schema.pre('save', function(next) {
        var that = this;
        this.getAudiance.call(this, this.visibility, function(err, audiance) {
            that.visibleTo = audiance;
            return next();
        });

        //TODO: update streak from here?
    });

    Schema.virtual('popularity').get(function() {
        /* TODO: create a serious popularity algorithm that considers
         the number of unique owners of comments, the time between each comment,
         the number of likes and the time of time between each like,
         and the number of followers of the activity owner  */
        return 0; this.comments.length * this.likes.length;
    });

    return db.model('Activity', Schema);
}