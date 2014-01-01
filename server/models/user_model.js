var _ = require('underscore');
var async = require('async');
var time = require('time');
var cron = require('cron');
var mongoose = require('mongoose');
var validate = require('mongoose-validator').validate;

var _streaks = ['weight', 'food', 'exercise'];

var _schema = {
    username: {
        type: String,
        required: true,
        index: {unique: true}
    },
    password: String,
    joined: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
    name: {
        first: {type: String, required: true, validate: validate('isAlpha')},
        last: {type: String, validate: validate({passIfEmpty: true}, 'isAlpha')}
    },
    email: {
        type: String, required: true,
        validate: validate('isEmail'),
        index: {unique: true}
    },
    timezone: {
        type: String,
        required: true,
        default: 'UTC',
        ref: 'Timezone'
    }, //TODO: add enum
    picture: Buffer,
    height: { type: Number, max: 270, min: 100, required: true },
    born: { type: Date, required: true },
    following: [
        {
            created: {type: Date, default: Date.now, required: true},
            target: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
        }
    ],
    foods: [{
        _id: { type: String, ref: 'Food', required: true },
        created: { type: Date, default: Date.now }
    }],
    exercises: [{
        _id: { type: String, ref: 'Exercise', required: true },
        created: {type: Date, default: Date.now}
    }],
    weights: [
        {
            logged: { type: Date, default: Date.now },
            created: { type: Date, default: Date.now },
            value_kg: Number
        }
    ],
    goals: [
        {
            _id: { type: String, ref: 'Goal' },
            started: { type: Date, default: Date.now },
            due: Date,
            progress: [{logged: Date, value: Number}],
            achieved: {type: Boolean, default: false}
        }
    ],
    badges: [
        {
            _id: { type: String, ref: 'Badge' },
            created: { type: Date, default: Date.now }
        }
    ],
    streaks: [{
        _id: { type: String, enum: _streaks, required: true }, 
        value: { type: Number, required: true, default: 0 }, 
        updated: { type: Date, required: true, default: null }
    }],
    preferences: [
        {
            _id: {
                type: String,
                enum: ['lang', 'units'] // TODO: add more preferences
            },
            value: mongoose.Schema.Types.Mixed
        }
    ],
    visibility: [{
        _id: {
            type: String, 
            enum: [
            "followers", "following",
            "badges", "goals", "plans",
            "foods", "exercises",
            "name.last", "email",
            "born", "height"
            ]
        },
        value: mongoose.Schema.Types.Mixed
    }],
    following: [{
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        created: { type: Date, default: Date.now, required: true }
    }],
    blocked: [{
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        created: { type: Date, default: Date.now, required: true }
    }],
    friendships: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Friendship'
    }];
    plans: [{
        _id: {type: mongoose.Schema.Types.ObjectId, ref: 'Plan'},
        added: Date,
        active: Boolean
    }],
    lists: [{
        _id: String,
        members: [mongoose.Schema.Types.ObjectId]
    }]
};

module.exports = function(db){

    var Activity = (require('activity_model'))(db),
        Timezone = (require('timezone_model'))(db),
        NewsFeedItem = (require('news_feed_item_model'))(db),
        Notification = (require('notification_model'))(db),
        Friendship = (require('friendship_model'))(db),
        Badge = (require('badge_model'))(db),
        Food = (require('food_model'))(db),
        Exercise = (require('exercise_model'))(db),
        Recipe = (require('recipe_model'))(db),
        Goal = (require('goal_model'))(db),
        Plan = (require('plan_model'))(db);

    var Schema = new mongoose.Schema(_schema, {collection: 'users'});

    Schema.virtual('name.full').get(function(){
        // TODO: format this according to user preference/language
        var preference = _(this.preferences).findWhere({ _id: 'name' });
        if (typeof preference === 'undefined') {
            preference = 'first last';
        }
        return preference.replace('first', this.name.first).replace('last', this.name.last);
    });

    // Add virtuals to JSON data, delete sensitive data... etc.
    Schema.set('toJSON', { 
        getters: true, 
        virtuals: true, 
        transform: function(doc, ret, options) {
            delete ret._id;
            delete ret.password;
            delete ret.name.first;
            delete ret.name.last;
            return ret;
        }
    });

    // Custom validators
    Schema.path('born').validate(function(value){
        return (!!value && ((new Date() - new Date(value)) / 31557600000) >= 18);
    }, 'age_unsatisfied');

    Schema.path('streaks.updated').validate(function(value){
        return (new Date(value) <= Date.now);
    }, 'streak_extends_in_future');

    Schema.methods.owns = function(object){
        if (typeof object == "undefined" || typeof object._id == "undefined") {
            throw Error("object_not_found");
        } else {
            return (object.hasOwnProperty('owner') && object.owner === this._id);
        }
    }

    Schema.methods.hasOf = function(items, item){
        return (_(this[items]).pluck('_id').indexOf(item._id) > -1);
    };

    Schema.methods.createActivity = function(activity, callback){
        activity.owner = this._id;
        delete activity._id;
        delete activity.created;
        delete activity.updated;
        activity = new (this.model('Activity'))(activity);
        return activity.save.call(this, function(err) {
            if (!err && _(_streaks).contains(activity.type)) {
                this.updateStreak(activity.type);
            }
            return callback(err);
        });
    };

    Schema.methods.removeActivity = function(activity, callback){
        try {
            if (this.owns(activity)) {
                return this.model('Activity').remove(activity, callback);
            } else {
                return callback(Error('permission_denied'), 0);
            }
        } catch (e) {
            return callback(Error('unknown_activity'), 0);
        }
    };

    Schema.methods.modifyActivity = function(activity){
        try {
            if (this.owns(activity)) {
                activity.updated = Date.now();
                return this.model('Activity').findByIdAndUpdate(activity._id, activity, callback);
            } else {
                return callback(Error('permission_denied'), 0);
            }
        } catch (e) {
            return callback(Error('unknown_activity'), 0);
        }
    };

    Schema.methods.addFavoriteFood = function(food, callback){
        if (typeof food === "string") {
            food = { _id: food };
            this.foods.push(food);
            this.markModified('foods');
            return this.save(callback);
        } else {
            return callback(Error('unrecognized_object_type'));
        }
    };

    Schema.methods.removeFavoriteFood = function(food, callback){
        if (this.hasOf('foods', food)) {
            var index = _(this.foods).pluck('_id').indexOf(food._id);
            this.foods.splice(index, 1);
            this.markModified('foods');
            return this.save(callback);
        } else {
            return callback(Error('no_such_record'));
        }
    };

    Schema.methods.createFood = function(food, callback) {
        var food = new (this.model('Food'))(food);
        food.owner = this._id;
        delete food.created;
        delete food.updated;
    };

    Schema.methods.modifyFood = function(food, callback){
        try {
            if (this.owns(food)) {
                food.updated = Date.now();
                return this.model('Food').findByIdAndUpdate(food._id, food, callback);
            } else {
                return callback(Error('permission_denied'), 0);
            }
        } catch (e) {
            return callback(Error('unknown_record'), 0);
        }
    };

    Schema.methods.createPlan = function(plan, callback) {
        var plan = new (this.model('Plan'))(plan);
        plan.owner = this._id;
        delete plan.created;
        delete plan.updated;
        delete plan._id;
        return plan.save.call(this, function(err) {
            if (!err) {
                this.addPlan(plan, callback);
            } else callback(err);
        });
    };

    Schema.methods.addPlan = function(plan, callback) {
        return this.update({ $addToSet: { plans: { _id: plan._id } } }, callback);
    };

    Schema.methods.modifyPlan = function(plan, callback) {
        try {
            if (this.owns(plan)) {
                plan.updated = Date.now();
                return this.model('Plan').findByIdAndUpdate(plan._id, plan, callback);
            } else {
                return callback(Error('permission_denied'), 0);
            }
        } catch (e) {
            return callback(Error('unknown_record'), 0);
        }
    };

    Schema.methods.removePlan = function(plan, callback) {
        return this.model('Plan').findByIdAndRemove(plan._id, callback);
    };

    Schema.methods.addGoal = function(goal, callback) {
        return this.update({ $addToSet: { goals: { _id: goal._id } } }, callback);
    };

    Schema.methods.removeGoal = function(goal) {
        if (this.hasOf('goals', goal)) {
            var index = _(this.goals).pluck('_id').indexOf(goal._id);
            this.goals.splice(index, 1);
            this.markModified('goals');
            return this.save(callback);
        } else {
            return callback(Error('no_such_record'));
        }
    };

    Schema.methods.modifyGoal = function(goal) {
        try {
            if (this.owns(goal)) {
                goal.updated = Date.now();
                return this.model('Goal').findByIdAndUpdate(goal._id, goal, callback);
            } else {
                return callback(Error('permission_denied'), 0);
            }
        } catch (e) {
            return callback(Error('unknown_record'), 0);
        }
    };

    Schema.methods.addFollowing = function(user, callback){
        return this.update({ $addToSet: { following: { _id: user._id } } }, callback);
    };

    Schema.methods.removeFollowing = function(user, callback){
        if (this.hasOf('following', user)) {
            var index = _(this.following).pluck('_id').indexOf(user._id);
            this.following.splice(index, 1);
            this.markModified('following');
            return this.save(callback);
        } else {
            return callback(Error('no_such_record'));
        }
    };

    Schema.methods.addWeight = function(weight, callback) {
        return this.update({ $addToSet: { weights: { _id: weight._id } } }, callback);
    };

    Schema.methods.modifyWeight = function(weight, callback) {
        if (this.hasOf('weights', weight)) {
            var index = _(this.weights).pluck('_id').indexOf(weight._id);
            this.weights[index] = weight;
            this.markModified('weights');
            return this.save(callback);           
        } else {
            return callback(Error('no_such_record'));
        }
    };

    Schema.methods.removeWeight = function(weight) {
        if (this.hasOf('weights', weight)) {
            var index = _(this.weights).pluck('_id').indexOf(weight._id);
            this.goals.splice(index, 1);
            this.markModified('weights');
            return this.save(callback);
        } else {
            return callback(Error('no_such_record'));
        }
    };

    Schema.methods.addFriend = function(friend, callback){
        var user = this;
        if (!this.hasOf('friends', friend)){
            var friendship = new (this.model('Friendship'))();
            friendship.from = this._id;
            friendship.to = friend._id;
            return friendship.save(callback);
        } else {
            return callback(Error('already_added'));
        }
    };

    Schema.methods.removeFriend = function(friend, callback){
        return this.model('Friendship').findOneAndRemove({
            _id: {
                $or: [{
                    from: this._id,
                    to: friend._id
                }, {
                    from: friend._id,
                    to: this._id
                }]
            }
        }, callback);
    };

    Schema.methods.isBlocking = function(friend){
        return _.pluck(this.blocked, '_id').indexOf(friend._id) > -1;
    }

    Schema.methods.blockFriend = function(friend){
        if (!this.isBlocking(friend)) {
            this.blocked.push({ _id: friend._id });
            this.markModified('blocked');
            return this.save(callback);
        } else {
            return callback(Error('already_blocked'));
        }
    };

    Schema.methods.unblockFriend = function(friend){
        if (this.isBlocking(friend)){
            var index = _(this.blocked).pluck('_id').indexOf(friend._id);
            this.blocked.splice(index, 1);
            this.markModified('blocked');
            return this.save(callback);
        } else {
            return callback(Error('not_blocked'));
        }
    };

    Schema.methods.createNotification = function(notification, callback){
        notification = new (this.model('Notification'))(notification);
        return notification.save(callback);
    }

    Schema.methods.getFriends = function(callback){
        /* Get an array of ObjectId */
        this.model('Friendship').find({
            _id: {
                $or: [{
                    from: this._id,
                    accepted: true,
                }, {
                    to: this._id,
                    accepted: true
                }]
            }
        }, '_id.to', function(err, friendships){
            if (err) {
                return callback(null, _.chain(friendships).pluck('_id').pluck('to'));
            } else return callback(err, null);
        });
    };

    Schema.methods.getFollowers = function(callback) {
        /* Should return an array of _ids */
        // TODO: is $ valid?
        this.find({
            'following._id': this._id
        }).select('_id').sort('-following.$.created').exec(function(err, users) {
            callback(err, _(users).pluck('_id'));
        });
    };

    Schema.methods.canSeeActivity = function(activity, callback) {
        return this.model('Activity').findOne.call(this, activity, function(err, activity) {
            return activity.visibleTo(this, callback);
        });
    };

    Schema.methods.getNewBadges = function(callback) {
        return this.model('Badges').checkFor(this, function(err, newBadges) {
            if (!err && newBadges) {
                // TODO: add to user model and save
                async.each(newBadges, function(badge, callback) {
                    this.update({ $addToSet: { badges: { _id: badge._id } } }, callback);
                }, function(err) {
                    callback(err, newBadges);
                });
            } else return callback(err, null);
        });
    };

    Schema.methods.getNewsFeed = function(options){
        options.owner = this._id;
        return this.model('NewsFeedItem')
        .find(options)
        .populate('activity')
        .populate('activity.owner', 'name') /* TODO: is this valid? */
        .sort('-happened').exec(function(err, newsfeed){
            if (!err) {
                /* We do not need the owner as we already know it,
                   TODO: but we need to fill the activity with the name of creator */
                return callback(null, _(newsfeed).pluck('activity'));
            } else return callback(err, null);
        });
    };

    Schema.methods.getActivities = function(options, callback) {
        options.owner = this._id;
        this.model('Activity').find(options).populate('owner', 'name').exec(callback);
    };

    Schema.methods.getStreak = function(type, callback) {

    };

    Schema.methods.updateStreak = function(type, callback) {
        var today = new time.Date();
        var yesterday = new time.Date(today);
        yesterday.setDate(today.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        var streak = _(this.streaks).findWhere({ _id: type });
        if (typeof streak !== 'undefined') {
            if (streak.updated < today){
                if (streak.updated >= yesterday) {
                    streak.value += 1;
                } else {
                    streak.value = 1;
                }
            }
        } else {
            streak = {
                _id: type,
                value: 1
            }
        };

        streak.updated = Date.now();

        var streaks = this.streaks;
        var index = _(streaks).pluck('_id').indexOf(type);
        streaks[index] = streak;

        return this.update({ $set: { streaks: streaks } }, callback);
    };

    Schema.pre('save', function(next) {
        if (this.isModified('password')) {
            // TODO: Encrypt the password
            bcrypt.genSalt.call(this, 10, function(err, salt) {
                if (err) return next(err);
                bcrypt.hash.call(this, this.password, salt, function(err, hash) {
                    if (err) return next(err);
                    this.password = hash;
                    return next();
                });
            });

        } else return next();
    });

    Schema.post('save', function() {
        this.model.getNewBadges(function(err, newBadges) {
            if (!err && newBadges) {
                this.createNotification({
                    type: 'badge',
                    data: {
                        people: [this._id],
                        object: newBadges,
                        action: 'win'
                    }
                });
            }
        });
        this.model.updateSreak();
    });

    Schema.post('remove', function(user){
        /* Remove all activities by this user after account deletion */
        this.model('Activity').remove({owner: user._id}, function(err){
            // if (err) throw err;
            // console.log('Removed activities of user', user._id);
        });
    });

    var Model = db.model('User', Schema);

    (function monitorStreaks() {
        this.model('Timezone').find().exec(function(err, timezones) {
            async.each(timezones, function(timezone, callback) {
                new (cron.CronJob)({
                    cronTime: '0 0 * * *',
                    start: true,
                    timeZone: timezone._id,
                    context: Model,
                    onTick: function() {
                        var today = new time.Date();
                        today.setTimezone(timezone._id);
                        var yesterday = new time.Date(today);
                        yesterday.setTimezone(timezone._id);
                        yesterday.setDate(today.getDate() - 1);
                        yesterday.setHours(0, 0, 0, 0);

                        this.update({
                            timezone: timezone._id,
                            'streak.updated': { $lt: yesterday },
                            'streak.value': { $gt: 0 }
                        }, {
                            $set: { 'streak.$.value': 0 }
                        }, function(err, numUpdated) {
                            // TODO: log errors... etc.
                            
                        });
                    }
                });

                callback(null);
            }, function(err) {
                // Finished creating and starting cron jobs
            });
        });
    }).call(Model);

    return Model;
};