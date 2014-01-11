var mongoose = require('mongoose');
var validate = require('mongoose-validator').validate;

exports.name = {

    first: {
        type: String,
        required: true
    },

    last: {
        type: String,
        required: false,
        validate: validate({ passIfEmpty: true }, 'isAlpha')
    }

};

exports.username = {
    type: String,
    required: true,
    index: {
        unique: true
    }
};

exports.email = {
    type: String,
    required: true,
    select: false,
    validate: validate('isEmail'),
    index: {
        unique: true
    }
};

exports.password = {
    type: String,
    required: true,
    select: false
};

exports.active = {
    type: Boolean,
    default: true
};

exports.joined = {
    type: Date,
    default: Date.now,
    select: false
};

exports.timezone = {
    type: String,
    default: 'UTC',
    ref: 'Timezone'
};

exports.picture = Buffer;

exports.born = {
    type: Date,
    required: true,
    select: false
};

exports.height = {
    type: Number,
    max: 270,
    min: 100,
    required: true,
    select: false
};

exports.weight_log = [{
    day: {
        type: Date,
        default: Date.now
    },
    value_kg: Number
}];

exports.favorite_foods = [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food'
}];

exports.favorite_exercises = [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise'
}];

exports.favorite_goals = [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal'
}];

exports.favorite_plans = [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan'
}];

exports.visibility = [{
    section: String,
    value: mongoose.Schema.Types.Mixed
}];

exports.streak = [{
    section: { 
        type: String,
        enum: ['weight', 'exercise', 'food'],
        required: true
    },
    value: {
        type: Number,
        default: 1
    },
    updated: {
        type: Date,
        required:
        true,
        default: null
    }
}];

exports.lists = [{
    name: String,
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    created: {
        type: Date,
        default: Date.now
    }
}];

exports.friendships = [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Friendship'
}];

exports.following = [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Follow'
}];

exports.blocking = [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
}];