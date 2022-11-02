// HTTP Portion
var http = require('http');
// Path module
var path = require('path');

// Using the filesystem module
var fs = require('fs');

var server = http.createServer(handleRequest);
server.listen(3000);

let io = require('socket.io').listen(server);
console.log('Server started on port 3000');

function handleRequest(req, res) {
  // What did we request?
  var pathname = req.url;
  
  // If blank let's ask for index.html
  if (pathname == '/') {
    pathname = '/ThreeJS_Example/learn-threejs-master/chapter-08/08-01-model-loader.html';//'/ThreeJS_Example/learn-threejs-master/chapter-08/08-01-model-loader.html';
  }
  
  // Ok what's our file extension
  var ext = path.extname(pathname);

  // Map extension to file type
  var typeExt = {
    '.html': 'text/html',
    '.js':   'text/javascript',
    '.css':  'text/css'
  };
  // What is it?  Default to plain text

  var contentType = typeExt[ext] || 'text/plain';

  // User file system module
  fs.readFile(__dirname + pathname,
    // Callback function for reading
    function (err, data) {
      // if there is an error
      if (err) {
        res.writeHead(500);
        return res.end('Error loading ' + pathname);
      }
      // Otherwise, send the data, the contents of the file
      res.writeHead(200,{ 'Content-Type': contentType });
      res.end(data);
    }
  );
}

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
  // We are given a websocket object in our function
  function (socket) {
  
    console.log("We have a new client: " + socket.id);
  
    // When this user emits, client side: socket.emit('otherevent',some data);
    socket.on('mouse',
      function(data) {
        // Data comes in as whatever was sent, including objects
        console.log("Received: 'mouse' " + data.x + " " + data.y);
      
        // Send it to all other clients
        socket.broadcast.emit('mouse', data);
        
        // This is a way to send to everyone including sender
        // io.sockets.emit('message', "this goes to everyone");

      }
    );
    socket.on('ping_from_client',
        function(data){
            console.log("Received signal from Backend!!!! " + "mode: "+data.mode 
                        + " " + "value: " + data.value);
            socket.broadcast.emit('ping_from_client', data);
    });
    
    socket.on('disconnect', function() {
      console.log("Client has disconnected");
    });
  }
);