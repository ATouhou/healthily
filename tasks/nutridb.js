module.exports = function(grunt) {

    grunt.registerTask('download', 'Downloads SQL dump file of NutriDB', function(args) {
        
        var config = grunt.config('nutridb.download');
        
        var url = config.url || 'http://nutridb.org/nutridb-database-sr25.gz';

        grunt.log.writeln('File to download:', url);

        var path = require('path'),
            download = require('download'),
            statusBar = require('status-bar');

        var file = path.join(config.tmp, path.basename(url));

        grunt.log.verbose.writeln('Downloaded filename:', file);

        grunt.config('nutridb.extract.input', file);

        var job = download(url, config.tmp);

        var done = this.async();

        job.on('response', function(response) {
            var len = Number(response.headers['content-length']),
                bar = statusBar.create({
                    total: len,
                    render: function(stats) {
                        grunt.log.write('Downloading file:',
                            this.format.storage(stats.currentSize) + '/' + this.format.storage(stats.totalSize),
                      '[' + this.format.progressBar(stats.percentage) + ']',
                            this.format.percentage(stats.percentage));
                        if (stats.percentage < 1) process.stdout.cursorTo(0);
                        else grunt.log.writeln('');
                    }
                });

            response.pipe(bar);
        });

        job.on('close', function() {
            grunt.log.ok('Download complete.');
            done();
        });

        job.on('error', function(err) {
            grunt.fatal('Error downloading file: ' + err.message);
        });

    });

    grunt.registerTask('extract', 'Extracts NutriDB archive', function(args) {

        this.requiresConfig('nutridb.extract');

        var config = grunt.config('nutridb.extract');

        var done = this.async();

        var zlib   = require("zlib"),
            fs     = require("fs"),
            output = fs.createWriteStream(config.output);

        grunt.config('nutridb.mysql.dump', config.output);

        fs.createReadStream(config.input)
          .pipe(zlib.createGunzip())
          .pipe(output)
          .on('close', function(err) {
            if (!err) grunt.log.ok('Extraction complete.');
            done(err);
          });

    });

    grunt.registerTask('mysql', 'Imports NutriDB\'s MySQL dump file to local MySQL database', function(args) {
        
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
        
        var config = grunt.config('nutridb'),
            date   = new Date();

        var async = require('async'),
            _     = require('underscore'),
            en    = require('lingo').en;

        var MongoClient = require('mongodb').MongoClient;

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
            model: 'Category',
            indexes: [{
                fdgrp_desc: 1,
                usda_active: 1
            }],
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
            model: 'Nutrient',
            indexes: [{
                nutrdesc: 1,
                is_default: 1
            }, {
                is_default: 1
            }],
            display: 'nutrdesc',
            query: 'SELECT * from nutrientDefs ORDER BY sr_order',
            format: function(result, callback) {
                async.map(result, function(row, callback) {
                    
                    row._id = row.nutr_no;

                    row.is_default = row.is_default == '1' ? true : false;
                    row.usda_active = row.usda_status == 'active' ? true : false;

                    grunt.log.verbose.writeln('Querying DRIs for nutrient', row.nutrdesc + '.');
                    
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

                        grunt.log.verbose.writeln('DRIs pushed to nutrient', row.nutrdesc + '.');

                        callback(null, _(row).omit('id'));

                    });         

                }, callback);
            }
        }, {
            model: 'Food',
            indexes: [{
                usda_active: 1,
                fdgrp_cd: 1
            }, {
                usda_active: 1,
                owner: 1,
                long_desc: 1
            }, {
                usda_active: 1,
                owner: 1,
                visibility: 1,
                long_desc: 1
            }, {
                usda_active: 1,
                visibility: 1,
                long_desc: 1
            }],
            display: false,
            query: 'SELECT * FROM foodDescs',
            format: function(foods, callback) {
                async.mapLimit(foods, 50, function(food, callback) {

                    food._id = food.ndb_no;
                    food.usda_active = food.usda_status == 'active' ? true : false;
                    food.survey = food.survey == 'Y' ? true : false;

                    grunt.log.verbose.writeln('Querying details for', food.long_desc + '.');

                    mysql.query('SELECT nutr_val, tagname, nutrientData.nutr_no, num_data_pts, std_error, src_cd, \
                    deriv_cd, ref_ndb_no, add_nutr_mark, num_studies, min, max, df, low_eb, up_eb, stat_cmt, \
                    cc, nutrientData.usda_status  \
                    FROM nutrientData JOIN nutrientDefs ON nutrientDefs.nutr_no=nutrientData.nutr_no \
                    WHERE ndb_no = ? ORDER BY sr_order; \
                    SELECT footnt_no, footnt_txt FROM footnotes WHERE footnt_typ = "D" AND ndb_no = ? ORDER BY footnt_no; \
                    SELECT footnt_no, footnt_txt FROM footnotes WHERE footnt_typ = "N" AND ndb_no = ? ORDER BY footnt_no; \
                    SELECT * FROM weights WHERE ndb_no = ? ORDER BY seq;', [food.ndb_no, food.ndb_no, food.ndb_no, food.ndb_no], function(err, result) {
                        
                        grunt.log.verbose.writeln('Found details for', food.long_desc + '.');

                        if (err) return callback(err);

                        var nutrients = result[0],
                            footnotes = result[1],
                            nutrients_footnotes = result[2],
                            weights = result[3];

                        food.nutrients = nutrients.map(function(item) {
                            item._id = item.nutr_no;
                            item.usda_active = item.usda_status == 'active' ? true : false;
                            item.footnotes = _.chain(nutrients_footnotes).findWhere({ nutr_no: item.nutr_no }).map(function(footnote) {
                                footnote._id = Number(footnote.footnt_nWo);
                                return _(footnote).pick('_id', 'footnt_txt');
                            }).reject(function(footnote) {
                                return !footnote._id || !footnote.footnt_txt;
                            }).value();
                            return _(item).omit('id', 'nutr_no', 'ndb_no', 'usda_status');
                        });

                        food.weights   = weights.map(function(item) {
                            item._id = Number(item.seq);
                            item.usda_active = item.usda_status == 'active' ? true : false;
                            return _(item).omit('id', 'seq', 'ndb_no', 'usda_status');
                        });

                        food.footnotes = _.chain(footnotes).map(function(footnote) {
                            footnote._id = Number(footnote.footnt_no);
                            return _(footnote).pick('_id', 'footnt_txt');
                        }).reject(function(footnote) {
                            return !footnote._id || !footnote.footnt_txt;
                        }).value();

                        grunt.log.verbose.writeln('Details pushed to food', food.long_desc + '.');

                        callback(null, _.chain(food).omit('id', 'ndb_no').defaults({
                            owner: null,
                            popularity: 0,
                            visibility: 'public',
                            created: date,
                            updated: null
                        }).value());

                    });

                }, callback);
            }
        }];

        var query = function(item, callback) {
            var plural = en.pluralize(item.model).toLowerCase();
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

            var singular = item.model,
                plural =   en.pluralize(singular).toLowerCase();

            var chunk = config.mongo.chunk || 700,
                limit = config.mongo.limit || 100;

            grunt.log.writeln('Importing', plural + '...');

            MongoClient.connect(config.mongo.connection, function(err, db) {
                
                var collection = db.collection(plural);

                var chunks = _.chain(item.rows).groupBy(function(item, index) {
                    return Math.floor(index/chunk);
                }).toArray().value();

                async.eachLimit(chunks, limit, function(chunk, callback) {
                    
                    collection.insert(chunk, callback);

                }, function(err) {
                    
                    if (!err) grunt.log.ok(item.rows.length, plural, 'imported.');
                    
                    grunt.log.writeln('Creating indexes for', plural);
                    
                    async.each(item.indexes, function(index, callback) {
                        collection.ensureIndex(index, {
                            background: true
                        }, callback);
                    }, callback);

                });

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

    grunt.registerTask('nutridb', ['download', 'extract', 'mysql', 'mongo']);

}