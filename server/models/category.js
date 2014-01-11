var mongoose = require('mongoose');
var _schema = {
    _id: String,
    fdgrp_desc: String,
    usda_active: Boolean
};

module.exports = function(db){
    var Schema = new mongoose.Schema(_schema, {collection: 'categories'});
    return db.model('Category', Schema);
}