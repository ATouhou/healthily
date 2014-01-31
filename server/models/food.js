var mongoose = require('mongoose');
               require('mongo-relation');

var _schema = require('./../schemas/food');

module.exports = function(db){

    require('./category')(db);
    require('./nutrient')(db);

    var Schema = new mongoose.Schema(_schema, {collection: 'foods'});

    Schema.belongsTo('Category', { through: 'fdgrp_cd' });

    return db.model('Food', Schema);

}