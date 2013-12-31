var async = require('async');
var mongoose = require('mongoose');
var sqlite3 = require('sqlite3');
var path = require('path');
var _ = require('underscore');


'SELECT * FROM foodCats WHERE id < 25 ORDER BY id';
'SELECT * from nutrientDefs JOIN dris ON nutrientDefs.nutr_no=dris.nutr_no';
'SELECT * FROM foodDescs'

// "SELECT \
//     foodDescs.long_desc, foodDescs.comname, foodDescs.sciname, \
//     weights.gm_wgt, weights.amount, weights.msre_desc, \
//     nutrientDefs.nutrdesc, nutrientDefs.units, \
//     nutrientData.nutr_no, nutrientData.nutr_val, dris.dri \
// FROM foodDescs \
//     LEFT JOIN weights \
//     ON foodDescs.ndb_no = weights.ndb_no \
//     LEFT JOIN nutrientData \
//     ON foodDescs.ndb_no = nutrientData.ndb_no \
//     LEFT JOIN nutrientDefs \
//     ON nutrientData.nutr_no = nutrientDefs.nutr_no \
//     LEFT JOIN dris \
//     ON nutrientDefs.nutr_no = dris.nutr_no \
// WHERE nutrientData.ndb_no = '%s'    \
//     AND nutrientData.nutr_val > 0 \
//     AND weights.ndb_no = '%s' \
//     AND weights.seq = '%s' \
//     AND ((dris.age_begin <= '%s' AND dris.age_end >= '%s') OR dris.id IS NULL) \
//     AND ((dris.gender = '%s') OR dris.id IS NULL) \
// ORDER BY nutrientDefs.sr_order'";

module.export = function(grunt){

}