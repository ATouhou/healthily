var mongoose = require('mongoose');

var _schema = require('./../schemas/nutrient');

module.exports = function(db){
    var Schema = new mongoose.Schema(_schema, {collection: 'nutrients'});
    return db.model('Nutrient', Schema);
}