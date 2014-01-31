module.exports = {
    _id: String,
    tagname: { type: String, index: true },
    units: String,
    nutrdesc: String,
    is_default: { type: Boolean, index: true },
    usda_active: Boolean,
    num_dec: Number,
    dris: [{
        age: {begin: Number, end: Number},
        gender: {type: String, enum: ['male', 'female', 'avg']},
        value: Number,
        ul: Number,
    }]
}
