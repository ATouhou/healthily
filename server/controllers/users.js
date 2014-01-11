/**

@module UsersController
@requires express, baucis, async, passport, passport-local, underscore

*/
var express = require('express');
var baucis = require('baucis');
var async = require('async');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var _ = require('underscore');

module.exports = function(db) {

    var model = require('./../models/user')(db);

    var user = baucis.rest({
        singular: 'User',
        findBy: 'username',
        select: '-password -joined'
    });

    passport.use(new LocalStrategy(
        function(username, password, done) {
            model.findOne({ username: username }, '+password', function (err, user) {
                user.validatePassword(password, function(err, valid) {
                    if (err || !valid) return done(err, null);
                    done(err, user);
                });
            });
        }
    ));

    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(_id, done) {
        model.findById(_id, function(err, user) {
            done(err, user);
        });
    });

    user.use(passport.initialize());
    user.use(passport.session());

    // user.request('instance', 'del post put');
    // user.request('collection', 'del put');

    user.post('/:username/sessions', [
        function(req, res, next){
            req.body.username = req.param('username');
            next();
        },
        passport.authenticate('local'),
        function(req, res, next) {
            if (!req.user) return next(err);
            res.redirect('/users/' + req.user.username);
        }
    ]);

    user.del('/:username/sessions', function(req, res, next) {
        req.logout();
        res.send(204);
    });

    var activity = (require('./sub_controller'))('Activity', { db: db });

    activity.queryOwnership = function(req, res, next) {
        req.baucis.query
        .where({
            $or: [
                { owner: req.urlUser._id, visibleTo: req.user._id },
                { owner: req.user._id }
            ]
            
        })
        .populate('owner', 'name');
        next();
    };

    var friendship = (require('./sub_controller'))('Friendship', { db: db });

    // friendship.param('username', function(req, res, next, value) {
    //     // console.log(req);
    //     // TODO: Respect user's privacy settings for friendships
    //     model.findOne({ username: value }, function(err, user) {
    //         if (err) return next(err);
    //         if (!user) return next(Error('Source Not Found'));
    //         req.url_user = user;
    //         next();
    //     });
    // });

    // friendship.request('get', requireVisibility('friendship'));

    // friendship.request('post del put', requireRole('owner'));

    friendship.request('post', function(req, res, next) {
        
        delete req.body.accepted;

        req.body.from = req.user._id;

        model.findOne( { username: req.body.to }, function(err, user) {
            if (err) return next(err);
            if (!user) {
                res.statusCode = 404;
                return next(Error('Target Not Found'));
            }
            req.body.to = user._id;
            next();
        });

    });

    friendship.queryOwnership = function(req, res, next) {
        req.baucis.query
        .where({
            $or: [{ from: req.urlUser._id }, { to: req.urlUser._id }]
        }).populate('from to', 'name username');

        /* Hide pending requests */
        if (req.user.id !== req.urlUser.id) {
            req.baucis.query.where('accepted', true);
        }

        next();
    };

    // friendship.documents(function(req, res, next) {
    //     /* We have to do this because population of _id.from and _id.to
    //      returns null (a mongoose bug?) */
    //     var tmp = {  };

    //     async.map(req.baucis.documents, function(document, callback) {
            
    //         var from = document._id.from;
    //         var to = document._id.to;

    //         if (tmp.hasOwnProperty(from)) {
    //             document._id.from = tmp[from];
    //         } else {
    //             model.findById(from, 'username name', function(err, user) {
    //                 document._id.from = user;
    //                 tmp[from] = user;
    //                 callback(err, document);
    //             });
    //         }

    //         // if (tmp.hasOwnProperty(to)) {
    //         //     document._id.to = tmp[to];
    //         // } else {
    //         //     model.findById(to, function(err, user) {
    //         //         document._id.to = user;
    //         //         tmp[to] = user;
    //         //     });
    //         // }
            
    //     }, function(err, documents) {
    //         req.baucis.documents = documents;
    //         res.json(documents);
    //     });        
    // });

    user.use(activity);
    user.use(friendship);

    return baucis;
}