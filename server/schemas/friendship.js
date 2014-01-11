var mongoose = require('mongoose');

module.exports = {

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
        type: Boolean,
        default: null
    },
    
    created: {
        type: Date,
        default: Date.now
    }

};