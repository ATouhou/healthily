module.exports = function(grunt) {
    grunt.registerTask('download', 'Downloads SQL dump file of NutriDB', function(args) {
        
        var config = grunt.config('nutridb.download');
        
        var url = config.url || 'http://nutridb.org/nutridb-database-sr25.sql.gz';

        grunt.log.writeln('File to download:', url);

        var download = require('download');
        var job = download(url, config.tmp, { extract: true });

        var done = this.async();

        job.on('response', function(response) {
            var len = Number(response.headers['content-length']),
                cur = 0,
                body = "",
                percent = 0,
                total = (len / 1048576).toFixed(2);

            response.on('data', function(chunk) {
                body += chunk;
                cur += chunk.length;
                percent = (100.0 * cur / len).toFixed(2);
                grunt.log.writeln(percent + '%', 'complete', '(c/t MB)'.replace('c', (cur/1048576).toFixed(2)).replace('t', total));
            });
        });

        job.on('close', function() {
            grunt.log.ok('Download and extraction complete');
            done();
        });

        job.on('error', function(err) {
            grunt.fatal('Error downloading file: ' + err.message);
        });

    });

    grunt.registerTask('mysql', 'Imports SQL dump file to local MYSQL database', function(args) {
        
        // this.requires('download');
        this.requiresConfig('nutridb.mysql');

        var config = grunt.config('nutridb.mysql');

        var dump = grunt.config('nutridb.mysql.dump');

        grunt.log.writeln('Reading dump file...');

        dump = grunt.file.read(dump);

        var db = dump.match(/CREATE\s+DATABASE.+`(nutridb_.+)`.+;/i)[1] || 'nutridb_sr25_sanitized';
        
        grunt.log.writeln('Found database name:', db);
        grunt.config('nutridb.mysql.database', db);

        var done = this.async();

        var mysql = require('mysql'),
            connection = mysql.createConnection({
                host: config.host || 'localhost',
                user: config.username || 'root',
                password: config.password || '',
                supportBigNumbers: true,
                multipleStatements: true,
            });

        grunt.log.writeln('Importing database, this may take a few minutes...');
        
        connection.query(dump, function(err) {
            if (err) grunt.log.warn('Dump not imported.');
            else grunt.log.ok('Dump imported to local MySQL.');
            connection.end();
            done(err);
        });

    });

    grunt.registerTask('mongo', 'Reads NutriDB MySQL database and imports it to MongoDB', function(args) {

        this.requiresConfig('nutridb.mysql');
        this.requiresConfig('nutridb.mongo');
        
        var config = grunt.config('nutridb');

        var async = require('async'),
            _     = require('underscore'),
            en    = require('lingo').en;

        var mongoose = require('mongoose'),
            db = mongoose.createConnection(config.mongo.connection);
            Category = db.model('Category', config.mongo.schemas.category),
            Nutrient = db.model('Nutrient', config.mongo.schemas.nutrient),
            Food = db.model('Food', config.mongo.schemas.food);

        var mysql = require('mysql'),
            mysql = mysql.createConnection({
                host: config.mysql.host || 'localhost',
                database: config.mysql.database || 'nutridb_sr25_sanitized',
                user: config.mysql.username || 'root',
                password: config.mysql.password || '',
                multipleStatements: true,
                supportBigNumbers: true
            });

        var done = this.async();

        grunt.log.writeln('Importing from MySQL database...');

        var queries = [{
            model: Category,
            display: 'fdgrp_desc',
            query: 'SELECT * FROM foodCats WHERE id < 25 ORDER BY id',
            format: function(result, callback) {
                async.map(result, function(row, callback) {

                    row._id = row.fdgrp_cd;

                    row.usda_active = row.usda_status == 'active' ? true : false;

                    callback(null, _(row).omit('id', 'fdgrp_cd', 'usda_status'));
                
                }, callback);
            }
        }, {
            model: Nutrient,
            display: 'nutrdesc',
            query: 'SELECT * from nutrientDefs ORDER BY sr_order',
            format: function(result, callback) {
                async.map(result, function(row, callback) {
                    
                    row._id = row.nutr_no;

                    row.is_default = row.is_default == '1' ? true : false;
                    row.usda_active = row.usda_status == 'active' ? true : false;
                    
                    mysql.query('SELECT * FROM dris WHERE nutr_no = ?', [row._id], function(err, dris) {
                        
                        if (err) return callback(err);

                        row.dris = dris.map(function(dri) {
                            dri.value = dri.dri;
                            if (dri.gender != 'avg') {
                                dri.age = {
                                    begin: dri.age_begin,
                                    end: dri.age_end
                                };
                            } else dri.age = null;
                            return _(dri).pick('age', 'gender', 'value', 'ul');
                        });

                        callback(null, _(row).omit('id'))

                    });         

                }, callback);
            }
        }, {
            model: Food,
            display: 'long_desc',
            query: 'SELECT * FROM foodDescs',
            format: function(foods, callback) {
                async.mapLimit(foods, 50, function(food, callback) {

                    food._id = food.ndb_no;
                    food.usda_active = food.usda_status == 'active' ? true : false;
                    food.survey = food.survey == 'Y' ? true : false;

                    mysql.query('SELECT nutr_val, tagname, nutrientData.nutr_no, num_data_pts, std_error, src_cd, \
                    deriv_cd, ref_ndb_no, add_nutr_mark, num_studies, min, max, df, low_eb, up_eb, stat_cmt, \
                    cc, nutrientData.usda_status  \
                    FROM nutrientData JOIN nutrientDefs ON nutrientDefs.nutr_no=nutrientData.nutr_no \
                    WHERE ndb_no = ? ORDER BY sr_order; \
                    SELECT footnt_no, footnt_txt  FROM footnotes WHERE footnt_typ = "D" AND ndb_no = ? ORDER BY footnt_no; \
                    SELECT footnt_no, footnt_txt FROM footnotes WHERE footnt_typ = "N" AND ndb_no = ? ORDER BY footnt_no; \
                    SELECT * FROM weights WHERE ndb_no = ? ORDER BY seq;', [food.ndb_no, food.ndb_no, food.ndb_no, food.ndb_no], function(err, result) {
                        

                        if (err) return callback(err);

                        var nutrients = result[0],
                            footnotes = result[1],
                            nutrients_footnotes = result[2],
                            weights = result[3];

                        food.nutrients = nutrients.map(function(item) {
                            item._id = item.nutr_no;
                            item.usda_active = item.usda_status == 'active' ? true : false;
                            item.footnotes = nutrients_footnotes.map(function(footnote) {
                                footnote._id = footnote.footnt_no;
                                return _(item).pick('_id', 'footnt_txt');
                            });
                            return _(item).omit('id', 'nutr_no', 'ndb_no', 'usda_status');
                        });

                        food.weights   = weights.map(function(item) {
                            item._id = item.seq;
                            item.usda_active = item.usda_status == 'active' ? true : false;
                            return _(item).omit('id', 'seq', 'ndb_no', 'usda_status');
                        });

                        food.footnotes = footnotes.map(function(item) {
                            item._id = item.footnt_no;
                            return _(item).pick('_id', 'footnt_txt');
                        });

                        callback(null, _(food).omit('id', 'ndb_no'));

                    });

                }, callback);
            }
        }];

        var query = function(item, callback) {
            var plural = en.pluralize(item.model.modelName).toLowerCase();
            grunt.log.writeln('Querying', plural + '...');
            mysql.query(item.query, function(err, rows) {
                if (err) return callback(err);
                grunt.log.ok('Found', rows.length, plural + '.');
                grunt.log.writeln('Formatting', plural, 'for insertion...');
                item.format(rows, function(err, rows) {
                    item.rows = rows;
                    callback(err, item);
                });
            });
        };

        var save = function(item, callback) {
            var singular = item.model.modelName,
                plural =   en.pluralize(singular).toLowerCase();
            grunt.log.writeln('Importing', plural);
            async.eachLimit(item.rows, 50, function(row, callback) {
                model = new item.model(row);
                model.save(function(err) {
                    if (item.display) {
                        if (!err) grunt.log.writeln(singular, row[item.display], 'saved.');
                        else grunt.log.fail(singular, row[item.display], 'not saved.');
                    }
                    callback(err);
                });
            }, function(err) {
                if (err) return callback(err);
                grunt.log.ok(item.rows.length, plural, 'imported.');
                callback(null);
            });
        };

        async.mapSeries(queries, query, function(err, results) {
            grunt.log.ok('Finished querying.');
            async.eachSeries(results, save, function(err) {
                if (err) return grunt.fatal('Error importing: ' + err + '.');
                grunt.log.ok('Database imported.');
                mysql.end();
                done();
            })
        });

    });

    grunt.registerTask('nutridb', ['download', 'mysql', 'mongo']);

}