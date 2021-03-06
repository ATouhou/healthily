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
    
    Schema.pre('save', function(next) {

        var that = this;

        this.model('User').findById(this.owner, function(err, owner) {
            if (err) return next(err);
            owner.getAudianceOf(that.visibility, function(err, audiance) {
                if (err) return next(err);
                that.visibleTo = audiance;
                that.markModified('visibleTo');
                return next();
            });
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