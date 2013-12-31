var mongoose = require('mongoose');

var _schema = {
    _id: String,
    country_code: { type: String, ref: 'Country' },
    coordinates: String,
    utc_offset: String,
    utc_dst_offset: String,
};

module.exports = function(db){
	
	(require('country_model'))(db);

    var Schema = new mongoose.Schema(_schema, {collection: 'timezones'});
    return db.model('Timezone', Schema);
}