var express = require('express');
var router = express.Router();

var ChatRoom = require('../models/ChatRoom.js');
var Message = require('../models/Message.js');

/* GET /chat listing. */
router.get('/', function(req, res, next) {
    ChatRoom.find()
      .populate('messages')
      .populate('users', ['name', 'email', 'image', 'role'])
      .exec(function (err, chat) {
          if (err) return next(err);
          res.json(chat);
    });
});

/* POST /chat */
router.post('/', function(req, res, next) {
    ChatRoom.create(req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* POST /chat */
router.post('/:id/messages', function(req, res, next) {
    Message.create(req.body, function (err, created) {
        if (err) return next(err);

        ChatRoom.findById(req.params.id, function (err, chatroom) {
          if (err) return next(err);
          chatObj = chatroom.toObject();
          chatObj.messages.push(created._id);
          delete chatObj._id
          delete chatObj.__v

          ChatRoom.findByIdAndUpdate(req.params.id, chatObj, {new: true}, function (err, post) {
              if (err) return next(err);
              res.json(post);
          });
        });
    });
});

/* GET /chat/id */
router.get('/:id', function(req, res, next) {
    ChatRoom.findById(req.params.id)
      .populate('messages')
      .populate('users', ['name', 'email', 'image', 'role'])
      .exec(function (err, post) {
          if (err) return next(err);
          res.json(post);
    });
});


/* GET /chat/id */
router.get('/:id/messages', function(req, res, next) {
    ChatRoom.findById(req.params.id)
      .populate('messages')
      .exec(function (err, post) {
          if (err) return next(err);
          if(post === null) return [];
          res.json(post.messages);
    });
});

/* GET /chat/name/name */
router.get('/name/:name', function(req, res, next) {
    ChatRoom.find({ name: req.params.name })
      .populate('messages')
      .populate('users', ['name', 'email', 'image', 'role'])
      .exec(function (err, chat) {
          if (err) return next(err);
          res.json(chat);
    });
});

/* PUT /chat/:id */
router.put('/:id', function(req, res, next) {
    ChatRoom.findByIdAndUpdate(req.params.id, req.body, {new: true})
      .populate('messages')
      .populate('users', ['name', 'email', 'image', 'role'])
      .exec(function (err, post) {
          if (err) return next(err);
          res.json(post);
    });
});

/* DELETE /chat/:id */
router.delete('/:id', function(req, res, next) {
    ChatRoom.findByIdAndRemove(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

module.exports = router;
