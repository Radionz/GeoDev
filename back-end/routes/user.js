var express = require('express');
var router = express.Router();

var User = require('../models/User.js');

/* GET /user listing. */
router.get('/', function(req, res, next) {
    User.find(function (err, user) {
        if (err) return next(err);
        res.json(user);
    });
});

/* POST /user */
router.post('/', function(req, res, next) {
    User.create(req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* GET /user/id */
router.get('/:id', function(req, res, next) {
    User.findById(req.params.id, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* GET /user/email */
router.get('/email/:email', function(req, res, next) {
    User.findOne({ email: req.params.email }, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* PUT /user/:id */
router.put('/:id', function(req, res, next) {
    User.findByIdAndUpdate(req.params.id, req.body, {new: true}, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* DELETE /user/:id */
router.delete('/:id', function(req, res, next) {
    User.findByIdAndRemove(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

module.exports = router;
