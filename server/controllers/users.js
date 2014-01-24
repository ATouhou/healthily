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

    var requireOwnership = function(req, res, next) {
        if (!req.isAuthenticated()) return res.send(401);
        if (req.user.id !== req.urlUser.id) return res.send(403);
        if (req.user.id === req.urlUser.id) return next();
        return next(Error());
    };

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

    user.request('instance', 'del post put', requireOwnership);
    user.request('collection', 'del put', function(req, res, next) {
        res.send(405);
    });

    user.post('/:username/sessions', [
        function(req, res, next){
            req.body.username = req.param('username');
            next();
        },
        passport.authenticate('local'),
        function(req, res, next) {
            if (!req.isAuthenticated()) return next(err);
            res.redirect('/users/' + req.user.username);
        }
    ]);

    user.del('/:username/sessions', function(req, res, next) {
        req.logout();
        delete req.user;
        res.send(204);
    });

    var activity = (require('./sub_controller'))('Activity', { db: db });

    activity.queryUrlUserOwnership = function(req, res, next) {
        req.baucis.query.populate('owner', 'name');
        var query = {
            owner: req.urlUser._id
        };
        if (!req.isAuthenticated()) {
            query.visibility = 'public';
            req.baucis.query.where(query);
            next();
        } else if (req.urlUser.id !== req.user.id) {
            query.$or = [{ visibility: 'public' }];
            req.urlUser.hasFriend(req.user, false, function(err, friends) {
                if (err) return next(err);
                if (friends) {
                    query.$or.push({ visibility: { $in: ['friends', 'fof'] } });
                    req.baucis.query.where(query);
                    next();
                } else {
                    req.urlUser.hasFoF(req.user, false, false, function(err, fof) {
                        if (err) return next(err);
                        if (fof) query.$or.push({visibility: 'fof'});
                        req.baucis.query.where(query);
                        next();
                    });
                }
            });
        } else {
            next();
        }
    };

    var rv = activity.requireVisibility;

    activity.requireVisibility = function(req, res, next) {
        /**
        This will enable users who are not signed in to view public activity
        Visibility settings for individual activities within the result are still respected
        */
        req.urlUser.visibility = [{
            section: 'activity',
            value: 'public'
        }];

        rv(req, res, next);
    };

    activity.request('post', function(req, res, next) {
        req.body.revisions = [{text: req.body.text}];
        next();
    });

    var friendship = (require('./sub_controller'))('Friendship', { db: db });

    friendship.queryUrlUserOwnership = function(req, res, next) {
        req.baucis.query
        .where({
            $or: [{ from: req.urlUser._id }, { to: req.urlUser._id }]
        }).populate('from to', 'name username');

        /* Hide pending/rejected requests for anyone other than the owner */
        if (!req.isAuthenticated() || req.user.id !== req.urlUser.id) {
            req.baucis.query.where('accepted', true);
        }
        next();
    };

    friendship.ensureOwnership = function(req, res, next) {
        if (req.route.method === 'put') {
            /* Only the user who **received** the request can update it,
               and only accepted field to update is 'accepted' */
            delete req.body.to;
            req.body.to = req.user._id;
        } else {
            /* If POST, we need to ensure the request doesn't send 'accepted'
               If DELETE, only the person who sent the request can remove it */
            delete req.body.accepted;
            req.body.from = req.user._id;
        }
        next();
    };

    friendship.requireOwnership = function(req, res, next) {
        /* Overriding the default method for requireOwnership, the only change made here
           is the use of 'to/from' instead of 'owner' */
        console.log('Request', req);
        if (!req.isAuthenticated()) return next(Error('Not Authenticated'));
        if (!req.resource && req.urlUser.id === req.user.id) return next();
        if (!!req.resource 
            && (req.resource.to.toString() === req.urlUser.id || req.resource.from.toString() === req.urlUser.id)
            && req.urlUser.id === req.user.id) return next();
        return next(Error('Forbidden'));
        // TODO
    };

    friendship.request('post', function(req, res, next) {
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

    user.use(activity);
    user.use(friendship);

    return baucis;
}