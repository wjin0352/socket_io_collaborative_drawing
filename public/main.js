//  try making this networked using Socket.IO. In order to do this you will need to:
// Emit a draw event from your mousemove function to the Socket.IO server.
// The event should contain the position object as data.
// In server.js, listen for the draw event, and broadcast it out to all other clients.
// Listen for the broadcast draw event in public/main.js, and call the draw function when it is received

// Listen for the mousedown event
// When the event is fired, set a variable called drawing to true
// Listen for the mouseup event
// When the event is fired, set the drawing variable to false
// Only perform the mousemove actions when drawing is set to true

var socket = io();

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

var pictionary = function() {
  var canvas, context, drawing;

  var draw = function(position) {
    context.beginPath();
    context.arc(position.x, position.y,
                         6, 0, 2 * Math.PI);
    context.fill();
  };

  canvas = $('canvas');
  context = canvas[0].getContext('2d');
  canvas[0].width = canvas[0].offsetWidth;
  canvas[0].height = canvas[0].offsetHeight;

  canvas.on('mousemove', function(event) {
    if (!drawing) {
      return;
    }
    var offset = canvas.offset();
    var position = {x: event.pageX - offset.left,
                    y: event.pageY - offset.top};
    socket.emit('draw', position);

  });

  canvas.on('mousedown', function(event) {
    drawing = true;
    var offset = canvas.offset();
    var position = {x: event.pageX - offset.left,
                    y: event.pageY - offset.top};
    socket.emit('draw', position);
  });

  canvas.on('mouseup', function(event) {
    drawing = false;
  })

  socket.on('draw', function(position) {
    draw(position);
  })

  socket.on('user count', function(user_count) {
    console.log('User count: ' + user_count);
  })

  // guess box feature
  var guessBox;

  var onKeyDown = function(event) {
    if (event.keyCode != 13) { // Enter
        return;
    }

    var guess = guessBox.val();
    socket.emit('guess', guess);
    console.log(guess);

    guessBox.val('');
    // $('#show_guess').text(guess);
  };

  guessBox = $('#guess input');
  showGuess = $('div#show_guess');
  guessBox.on('keydown', onKeyDown);

  // listens for the broadcast.emit 'guess' event response from server
  socket.on('guess', function(guess) {
    $('#show_guess').text(guess);
  });
};



// create an event handler thats triggered here in the client side code main.js using emit.
$(document).ready(function() {
  pictionary();
});


