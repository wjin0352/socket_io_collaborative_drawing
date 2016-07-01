var http = require('http');
var express = require('express');
var socket_io = require('socket.io');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

// create a Constructor for user
var user_id = 0;

var User = function() {
  this.user_id = user_id;
  user_id++;
  console.log('user_id: '+ user_id + ', this.user_id: ' + this.user_id );
  // console.log(user_name);
  // this.user_name = user_name;
}

var user_count = 0;
// created server side event handlers for socket connections, draw etc.These will be triggered
// on the client side code, with event handlers that trigger them with emit on client side.

// Notice that I initialize a new instance of socket.io by passing the http (the HTTP server) object. Then I listen on the connection event for incoming sockets, and I log it to the console.
io.on('connection', function(socket) {
  user_count++;
  console.log('User count: ' + user_count);
  socket.broadcast.emit('user count', user_count);

  var first_user = false;
  var user = new User();

  if(user.user_id === 1) {
    var first_user = true;
  } else {
    var first_user = false;
  }

  // defining event handler for 'draw' event thats emitted on client side
  // only the first user should be able to draw, the others will guess

    socket.on('draw', function(position) {
      // socket.broadcast.emit('draw', position);
      // only the first user should be able to draw
      if (first_user) {
        io.emit('draw', position);
      }
    });


    socket.on('guess', function(userGuess) {
      if(!first_user) {
        socket.broadcast.emit('guess', userGuess);
      }
    });


  socket.on('disconnect', function(disconnect) {
    console.log('User has disconnected');
    user_count--;
    socket.broadcast.emit('users: ' + user_count);
  });
});


server.listen(8080);
