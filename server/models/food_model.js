var mongoose = require('mongoose');

var _schema = {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    visibility: Mongoose.Schema.Types.Mixed,
    created: { type: Date, default: Date.now },
    updated: Date,    

    _id: String,
    fdgrp_cd: { type: String, ref: 'Category', index: true },
    long_desc: {type: String, index: true},
    shrt_desc: String,
    comname: {type: String, index: true},
    manufacname: String,
    survey: Boolean,
    ref_desc: String,
    sciname: String,
    refuse: Number,
    n_factor: Number,
    pro_factor: Number,
    fat_factor: Number,
    cho_factor: Number,
    popularity: Number,
    usda_active: Boolean,
    footnotes: [{footnt_txt: String}],
    nutrients: [{
        _id: { type: String, ref: 'Nutrient' },
        nutr_val: Number,
        num_data_pts: Number,
        std_error: Number,
        src_cd: Number,
        deriv_cd: String,
        ref_ndb_no: { type: String, ref: 'Food' },
        add_nutr_mark: String,
        num_studies: Number,
        min: Number,
        max: Number,
        df: Number,
        low_eb: Number,
        up_eb: Number,
        stat_cmt: String,
        cc: String,
        usda_active: Boolean,
        footnotes: [{footnt_txt: String}]
    }],
    weights: [{
        _id: Number,
        amount: Number,
        gm_wgt: Number,
        num_data_pts: Number,
        std_dev: Number,
        usda_active: Boolean,
        msre_desc: String
    }],
};

module.exports = function(db){
    (require('category_model'))(db);
    (require('nutrient_model'))(db);
    var Schema = new mongoose.Schema(_schema, {collection: 'foods'});
    return db.model('Food', Schema);
}