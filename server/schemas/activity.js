var mongoose = require('mongoose');
var validate = require('mongoose-validator').validate;

module.exports = {

    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    visibility: { type: mongoose.Schema.Types.Mixed, select: true, required: true },
    visibleTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],

    type: {
        type: String,
        enum: ['share', 'comment', 'like',
                'post',
                'exercise',
                'food',
                'meal',
                'recipe',
                'weight', 
                'plan', 'goal', 'badge'],
        required: true},

    revisions: [{
        text: { type: String, required: false,  validate: validate('len', 1, 2000) },
        created: { type: Date, default: Date.now, required: true, index: true },
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