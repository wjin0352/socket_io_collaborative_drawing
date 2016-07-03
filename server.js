var http = require('http');
var express = require('express');
var socket_io = require('socket.io');
var app = express();
app.use(express.static('public'));
var server = http.Server(app);
var io = socket_io(server);
var EventEmitter = require('events').EventEmitter;

// word list for guessers
var WORDS = [
    "word", "letter", "number", "person", "pen", "class", "people",
    "sound", "water", "side", "place", "man", "men", "woman", "women", "boy",
    "girl", "year", "day", "week", "month", "name", "sentence", "line", "air",
    "land", "home", "hand", "house", "picture", "animal", "mother", "father",
    "brother", "sister", "world", "head", "page", "country", "question",
    "answer", "school", "plant", "food", "sun", "state", "eye", "city", "tree",
    "farm", "story", "sea", "night", "day", "life", "north", "south", "east",
    "west", "child", "children", "example", "paper", "music", "river", "car",
    "foot", "feet", "book", "science", "room", "friend", "idea", "fish",
    "mountain", "horse", "watch", "color", "face", "wood", "list", "bird",
    "body", "dog", "family", "song", "door", "product", "wind", "ship", "area",
    "rock", "order", "fire", "problem", "piece", "top", "bottom", "king",
    "space"
];

var user_id = 0;
var users = [];

var User = function(socket) {
  user_id++;
  this.user_id = user_id;
  this.socket = socket;
};

var isFirstUser = function(user) {
  return users[0] === user;
};

var removeUser = function(user) {
  var userIndex = users.indexOf(user);
  users.splice(userIndex, 1);
  notifyDrawer();
};

var notifyDrawer = function() {
  if(users[0]) {
    var word = randomWord();
    users[0].socket.emit('is_drawer', word);
  }
};

var createDrawHandler = function(user) {
  return function(position) {
    if(isFirstUser(user)) {
      io.emit('draw', position);
    } else {
      // console.log(user);
      user.socket.emit('cant_draw');
    }
  }
}
// currying
var createDisconnectHandler = function(user) {
  return function(disconnect) {
    removeUser(user);
    console.log('User has disconnected');
  }
}

var createUser = function(socket) {
  var user = new User(socket);
  users.push(user);
  if(isFirstUser(user)) {
    notifyDrawer();
    return user;
  }
  return user;
};

var createGuessHandler = function(user) {
  return function(userGuess) {
    if(!isFirstUser(user)) {
      user.socket.broadcast.emit('guess', userGuess);
    } else {
     io.emit('cant_guess');
    }
  }
};

var randomWord = function() {
  var word = WORDS[Math.floor(Math.random() * WORDS.length)];
  return word;
}
// created server side event handlers for socket connections, draw etc.These will be triggered
// on the client side code, with event handlers that trigger them with emit on client side.

// Notice that I initialize a new instance of socket.io by passing the http (the HTTP server) object. Then I listen on the connection event for incoming sockets, and I log it to the console.
io.on('connection', function(socket) {
  var user = createUser(socket);

  socket.on('draw', createDrawHandler(user));
  socket.on('guess', createGuessHandler(user));
  socket.on('disconnect', createDisconnectHandler(user));
});

server.listen(8080);
