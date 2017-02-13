var express = require('express'),
bodyParser = require('body-parser')
http = require('http'),
mongoose = require('mongoose');

var question = require('./routes/question'),
game = require('./routes/game'),
user = require('./routes/user'),
message = require('./routes/message');
chatroom = require('./routes/chatroom');

var PORT = 8080;
var MONGODB_URL = "mongodb://localhost";

// Use native Node promises
mongoose.Promise = global.Promise;

// connect to MongoDB
mongoose.connect(MONGODB_URL + '/geogame-api')
.then(() =>  console.log('Connection successful to mongodb.'))
.catch((err) => console.error(err));

var app = express();

app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/**
* ROUTES
*/
app.use('/question', question);
app.use('/game', game);
app.use('/user', user);
app.use('/message', message);
app.use('/chatroom', chatroom);

app.set('port', PORT);

// Create HTTP server.
var server = http.createServer(app);

// Listen on provided port, on all network interfaces.
server.listen(PORT);
server.on('error', onError);
server.on('listening', onListening);

// Chargement de socket.io
var io = require('socket.io').listen(server);
var Messages = require('./models/Message.js');
var ChatRoom = require('./models/ChatRoom.js');

// Connected sockets
var allClients = {};

// Quand un client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {

  var messagesService = Messages;
  var chatroomService = ChatRoom;

  // init socket
  allClients[socket.id] = {};

  socket.on('newclient', function(req) {

      console.log(req)

      allClients[socket.id] = req;

      ChatRoom.findById(req.chatId, function (err, chatroom) {

        if (err) return next(err);

        // transofrm and delete id from object
        chatObj = chatroom.toObject();
        delete chatObj._id
        delete chatObj.__v

        // add user chat
        chatObj.users.push(req.userId);

        // update
        ChatRoom.findByIdAndUpdate(req.chatId, chatObj, {new: true})
                .populate({
                  path: 'messages',
                  populate: { path: 'userFrom' }
                })
                .populate('users', ['name', 'email', 'image', 'role'])
                .exec(function (err, post) {
                    if (err) return next(err);
                    if (post == null) return null;

                    socket.emit('messages', post.messages);
                    for (var socketId in allClients) {
                      if (allClients[socketId].chatId == req.chatId) {
                        io.sockets.connected[socketId].emit('users', post.users);
                      }
                    }
                });
      });
  });


  socket.on('leaveChatroom', function(req) {
    if (allClients[socket.id] == null || req.userId == null || req.chatId == null) {
      console.log("User or chat undefined: " + allClients[socket.id].userId + " , " + allClients[socket.id].chatId);
    }

    console.log("User "+ req.userId+ " disconnect from chat " + req.chatId);
    removeUserFromRoom(req.userId, req.chatId, socket);
  });

  socket.on('disconnect', function() {
    if (allClients[socket.id].userId == null || allClients[socket.id].chatId == null) {
      console.log("User or chat undefined: " + allClients[socket.id].userId + " , " + allClients[socket.id].chatId);
    }

    console.log("User "+ allClients[socket.id].userId+ " disconnect from chat " + allClients[socket.id].chatId);
    removeUserFromRoom(allClients[socket.id].userId, allClients[socket.id].chatId, socket);

    delete allClients[socket.id];
  });


  socket.on('message', function (message) {

    Messages.create(message, function (err, created) {
        if (err) return next(err);

        console.log("crerated message with id " + created._id)
        ChatRoom.findById(allClients[socket.id].chatId, function (err, chatroom) {
          if (err) return next(err);

          chatObj = chatroom.toObject();
          console.log("Try to add " + created._id)
          chatObj.messages.push(created._id);

          delete chatObj._id
          delete chatObj.__v

          ChatRoom.findByIdAndUpdate(allClients[socket.id].chatId, chatObj, {new: true})
              .populate({
                path: 'messages',
                populate: { path: 'userFrom' }
              })
              .exec( function (err, post) {
                if (err) return next(err);

                created.populate("userFrom", function(err) {

                  delete created.userFrom.password

                  socket.emit('message', created);

                  for (var socketId in allClients) {
                    if (allClients[socketId].chatId == allClients[socket.id].chatId && allClients[socketId].userId != message.userFrom) {
                      io.sockets.connected[socketId].emit('message', created);
                    }
                  }
                });
          });
        });
    });


  });
});

function removeUserFromRoom(userId, chatId, socket) {

  ChatRoom.findById(chatId, function (err, chatroom) {
    if (err) return next(err);
    if (chatroom == null) return;

    // remove user chat
    var index;
    if ((index = chatroom.users.indexOf(userId)) >= 0) {
      chatroom.users.splice(index, 1);
    }

    // transofrm and delete id from object
    chatObj = chatroom.toObject();
    delete chatObj._id
    delete chatObj.__v

    // update
    ChatRoom.findByIdAndUpdate(chatId, chatObj, {new: true})
            .populate('users', ['name', 'email', 'image', 'role'])
            .exec(function (err, post) {
                if (err) return next(err);

                for (var socketId in allClients) {
                  if (allClients[socketId].chatId == chatId) {
                    io.sockets.connected[socketId].emit('users', post.users);
                  }
                }
            });
    });
}

//Event listener for HTTP server "error" event.
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
        case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
        default:
        throw error;
    }
}

// Event listener for HTTP server "listening" event.
function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}
