var baucis = require('baucis');

module.exports = function(db) {
    var Food = require('./../models/food')(db);
    baucis.rest('Food');
    baucis.rest('Category');
    return baucis;
}