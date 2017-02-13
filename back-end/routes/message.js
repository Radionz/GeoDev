var express = require('express');
var router = express.Router();

var Message = require('../models/Message.js');

/* GET /messages listing. */
router.get('/', function(req, res, next) {
    Message.find({ userTo: "" }, function (err, message) {
        if (err) return next(err);
        res.json(message);
    });
});

/* POST /message */
router.post('/', function(req, res, next) {
    Message.create(req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* GET /message/id */
router.get('/:id', function(req, res, next) {
    Message.findById(req.params.id, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* GET /message/id */
router.get('/user/:id', function(req, res, next) {
    Message.find({ userTo: req.params.id }, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* PUT /user/:id */
router.put('/:id', function(req, res, next) {
    Message.findByIdAndUpdate(req.params.id, req.body, {new: true}, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* DELETE /message/:id */
router.delete('/:id', function(req, res, next) {
    Message.findByIdAndRemove(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

module.exports = router;
