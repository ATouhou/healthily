var mongoose = require('mongoose');

var _schema = {
	_id: String,
	country_name: String
};

module.exports = function(db){
    var Schema = new mongoose.Schema(_schema, {collection: 'countries'});
    return db.model('Country', Schema);
}