var http = require('http');
var express = require('express');
var socket_io = require('socket.io');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

var user_count = 0;
// created server side event handlers for socket connections, draw etc.These will be triggered
// on the client side code, with event handlers that trigger them with emit on client side.

// Notice that I initialize a new instance of socket.io by passing the http (the HTTP server) object. Then I listen on the connection event for incoming sockets, and I log it to the console.
io.on('connection', function(socket) {
  user_count++;
  console.log('User count: ' + user_count);
  socket.broadcast.emit('user count', user_count);

  // defining event handler for 'draw' event thats emitted on client side
  socket.on('draw', function(position) {
    // socket.broadcast.emit('draw', position);
    io.emit('draw' ,position);
    // console.log(socket);

    // use io.emit('some event', {for: 'everyone'}) to send an event to everyone
    // io.emit('draw', { 'my position: ': position});
  });

  socket.on('disconnect', function(disconnect) {
    console.log('User has disconnected');
    user_count--;
    socket.broadcast.emit('users: ' + user_count);
  });
});


server.listen(8080);
