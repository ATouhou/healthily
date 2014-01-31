var mongoose = require('mongoose');
var _schema = require('./../schemas/category');

module.exports = function(db){
    var Schema = new mongoose.Schema(_schema, {collection: 'categories'});
    return db.model('Category', Schema);
}