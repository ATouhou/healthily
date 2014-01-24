var baucis = require('baucis');
var en = require('lingo').en;
var _ = require('underscore');

module.exports = function(singular, config) {
    
    var db = config.db;

    var requireVisibility = function(req, res, next) {
        var globalSetting = _(req.urlUser.visibility).findWhere({ section: singular.toLowerCase() });
            globalSetting = 'undefined' === typeof globalSetting ? 'friends' : globalSetting.value;

        var visibility = !!req.resource && req.resource.hasOwnProperty('visibility') ? req.resource.visibility : globalSetting;

        if (visibility !== "public")
            if (!req.isAuthenticated()) return next(Error('Not Authenticated'));

        switch (visibility) {
            case 'public':
                return next();
                break;
            case 'fof':
                req.urlUser.hasFoF(req.user, true, true, function(err, result) {
                    if (err) return next(err);
                    if (result) return next();
                    else return next(Error('Forbidden'));
                });
                break;
            case 'friends':
                req.urlUser.hasFriend(req.user, true, function(err, result) {
                    if (err) return next(err);
                    if (result) return next();
                    else return next(Error('Forbidden'));
                });
                break;
            case 'private':
                return requireOwnership(req, res, next);
                break;
            default: /* Custom Audiance */
                req.urlUser.getAudianceOf(visibility, function(err, result) {
                    if (err) return next(err);
                    if (_.chain(result)
                        .map(function(i) { return i.toString() })
                        .contains(req.user.id).value()) {
                        return next();
                    }
                    return next(Error('Forbidden'));
                });
                break;
        }        
    };

    var requireOwnership = function(req, res, next) {
        if (!req.isAuthenticated()) return next(Error('Not Authenticated'));
        if (!req.resource && req.urlUser.id === req.user.id) return next();
        if (!!req.resource && req.resource.owner.toString() === req.urlUser.id &&
            req.urlUser.id === req.user.id) return next();
        return next(Error('Forbidden'));
    };

    var controller = _(baucis.rest({
        singular: singular,
        basePath: '/:username/' + en.pluralize(singular),
        relations: true
    })).extend({
        requireVisibility: requireVisibility,
        requireOwnership: requireOwnership,
        queryUrlUserOwnership: function(req, res, next) {
            req.baucis.query.where('owner', req.urlUser._id);
            next();
        },
        ensureOwnership: function(req, res, next) {
            req.body.owner = req.user._id;
            next();
        }
    });

    controller.param('username', function(req, res, next, value) {
        req.urlUser = false;
        db.model('User').findOne({ username: value }, function(err, user) {
            if (err) return next(err);
            if (!user) return next(Error('No Such User'));
            req.urlUser = user;
            next();
        });
    });

    controller.param('id', function(req, res, next, value) {
        req.resource = false;
        db.model(singular).findById(value).populate('owner').exec(function(err, obj) {
            if (err) return next(err);
            req.resource = obj;
            next();
        });
    });

    controller.query(function(req, res, next) {
        controller.queryUrlUserOwnership(req, res, next);
    });

    controller.request('post del put', [function(req, res, next) {
        controller.requireOwnership(req, res, next);
    }, function(req, res, next) {
        controller.ensureOwnership(req, res, next);
    }]);

    controller.request('get head', function(req, res, next) {
        controller.requireVisibility(req, res, next);
    });

    return controller;
}