var _ = require('underscore');
var mongoose = require('mongoose');
var validate = require('mongoose-validator').validate;

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

var _schema = {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    visibility: mongoose.Schema.Types.Mixed,

    type: {type: String, enum: _types, required: true},
    revisions: [{
        text: { type: String, required: false,  validate: validate('len', 1, 2000) },
        created: { type: Date, default: Date.now, required: true },
        happened: Date
    }],
    feeling: String,
    data: mongoose.Schema.Types.Mixed,
    media: [Buffer],
    likes: [{
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        created: {type: Date, default: Date.now}
    }],
    comments: [{
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        revisions: [{
            text: {type: String, required: true,  validate: validate('len', 1, 200)},
            created: {type: Date, default: Date.now}
        }]
    }]
};

module.exports = function(db){
    var Schema = new mongoose.Schema(_schema, {collection: 'activities'});

    Schema.set('toJSON', {
        getters: true,
        virtuals: true,
        transform: function(doc, ret, options){
            /* Get the latest revisions of the activity and all of its comments */
            ret.revisions = ret.revisions[0];
            if (ret.comments){
                ret.comments.forEach(function(comment, index){
                    ret.comments[index] = _.extend(comment, _.last(comment.revisions));
                    delete ret.comments[index].revisions;
                });
            }
            return ret;
        }
    });
    
    Schema.methods.visibleTo = function(user, callback){
        this.model('User').findById.call(this, this.owner, function(err, owner){
            owner.getFriends.call(this, function(err, friends){
                this.getAudiance.call(this, friends, owner.lists, function(err, audiance){
                    // TODO: consider when the user is blocked
                    return callback(err, audiance === 'public' || user._id === owner._id || audiance.indexOf(user._id) > -1);
                });
            });
        });
    };

    Schema.methods.getAudiance = function(friends, lists, callback){

        /* The visibility property can be in one of these formats:
            - String: 'private', 'public', 'friends', _id ref to a User, name of a User list of friends
            - Object: that has an _id property referring to a User,
            - Array: of a mix of the above
         */

        /* This method should always return either 'public' or an array of _ids referring to users. */

        var audiance = [], err = null;
        if (this.visibility instanceof Array) {
            this.visibility.forEach.call(this, function(item) {
                getAudiance(item, function(err, subAudiance) {
                    if (!err) {
                        audiance.push(subAudiance);
                    } else err = err;
                });
            });
        } else if (typeof this.visibility === 'string') {
            switch (this.visibility) {
                case 'public':
                    audiance = 'public';
                    break;
                case 'private':
                    audiance = [];
                    break;
                case 'friends':
                    audiance = friends;
                    break;
                default:
                    var list = _(lists).findWhere({ _id: this.visibility });
                    if (typeof list != 'undefined') {
                        audiance = list.members;
                    } else {
                        /* an _id as String? */
                        audiance = this.visibility;
                    };
                    break;
            }
        } else if (this.visibility.hasOwnProperty('_id') === true) {
            audiance.push(this.visibility._id);
        } else {
            return err = Error('bad_audiance');
        }
        if (audiance.length > 0) audiance = _(audiance).flatten();
        return callback(err, audiance);
    };

    // Schema.post('save', function() {
    //     // TODO: Create matching news feed item
    // });

    Schema.virtual('popularity').get(function() {
        /* TODO: create a serious popularity algorithm that considers
         the number of unique owners of comments, the time between each comment,
         the number of likes and the time of time between each like,
         and the number of followers of the activity owner  */
        return 0; this.comments.length * this.likes.length;
    });

    return db.model('Activity', Schema);
}