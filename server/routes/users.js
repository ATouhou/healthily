var express = require('express');
var router = new express.Router();

module.exports = function(app, db) {
    
    var User = require('../models/user_model.js')(db);

    app.use(function(req, res, next) {
        if (req.session && req.session.user_id) {
            User.findById(req.session.user_id, function(err, user) {
                if (!err && user) {
                    req.user = user;
                    return next();
                } else {
                    return next(err);
                }
            });
        } else {
            return next();
        }
    });

    router.param('this', function(req, res, next, value) {
        if (!req.user || value !== req.user.username) {
            res.statusCode = 401;
            return next(Error('Not Authenticated'));
        } else {
            return next();
        }
    });

    router.param('activityId', function(req, res, next, value) {
        // User.getActivity();
    });

    var requireAuth = function(req, res, next) {
        if (!req.session.user_id) {
            return res.send(401);
        } else {
            return next();
        }
    };

    var requireCreds = function(req, res, next) {
        var username = req.param('username');
        var password = req.param('password');
        if (username && password) {
            return User.findOne({ username: username }, '+password', function(err, user) {
                if (!err && user) {
                    user.validatePassword(password, function(err, valid) {
                        if (!err && valid === true) {
                            req.user = user;
                            res.statusCode = 201;
                            return next();
                        } else {
                            res.statusCode = 401;
                            return next(err);
                        }
                    });
                } else {
                    res.statusCode = 404;
                    return next(err);
                }
            });
        } else {
            res.statusCode = 404;
            return next(Error('missing_credentials'));
        }
    };    

    router.post('/', function(req, res, next) {
        var user = req.body.user;
        user = new User(user);
        user.save(function(err) {
            if (!err) {
                return res.send(201);
            } else if (err.code == 11000) {
                res.statusCode = 409;
            } else {
                res.statusCode = 500;
            }
            return next(err);
        });
    });

    router.delete('/:this', function(req, res, next) {
        User.findByIdAndRemove(req.session.user_id, function(err, num) {
            if (err) return res.send(403);
            if (!num) return res.send(404);
            delete req.session.user_id;
            return res.send(204);
        });
    });

    router.post('/:username/sessions', requireCreds, function(req, res, next) {
        if (req.user) {
            req.session.user_id = req.user._id;
            return res.send(201);
        } else {
            return next();
        }
    });

    router.delete('/:this/sessions', function(req, res, next) {
        delete req.session.user_id;
        delete req.user;
        return res.send(204);
    });

    router.get('/:this/newsfeed', function(req, res, next) {
        req.user.getNewsFeed({  }, function(err, newsfeed) {
            if (!err && newsfeed) {
                return res.json(200, newsfeed);
            } else if (err) {
                res.statusCode = 400;
                return next(err);
            } else if (!newsfeed) {
                res.statusCode = 404;
                return res.send();
            }
        });
    });

    router.post('/:this/activities', function(req, res, next) {
        var activity = {
            type: req.param('type', 'post'),
            revisions: [{
                text: req.param('text', '')
            }]
        };
        req.user.createActivity(activity, function(err) {
            if (!err) {
                return res.json(201, activity);
            } else {
                return next(err);
            }
        });
    });

    router.get('/:this/activities', function(req, res, next) {
        req.user.activities.find({  }, function(err, activities) {
            if (!err) {
                return res.json(200, activities);
            } else {
                return next(err);
            }
        });
    });

    router.get('/:this/activities/:activityId', function(req, res, next) {
        var activity = {
            owner: req.user._id,
            _id: req.param('activityId')
        };

    });

    router.get('/:this/foods/:foodId', function(req, res, next) {
        //
    });

    router.get('/:this/notifications', function(req, res, next) {
        //
    });

    router.get('/:this/friends', function(req, res, next) {
        //
    });

    router.get('/:this/followers', function(req, res, next) {
        //
        req.user.getFollowers(function(err, followers) {
            res.json(200, followers);
        });
    });

    router.get('/:this/following', function(req, res, next) {
        // 
    });

    router.post('/:this/following', function(req, res, next) {
        var user = {
            username: req.param('username')
        };
        req.user.addFollowing(user, function(err) {
            if (!err) {
                res.send(201);
            } else {
                return next(err);
            }
        });
    });

    return router;

}