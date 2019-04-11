var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  var ip = req.headers['x-forwarded-for'] ||
       req.connection.remoteAddress ||
       req.socket.remoteAddress ||
       (req.connection.socket ? req.connection.socket.remoteAddress : null);
  console.log(ip);
    next();
});

var numUsers = 0;

io.on('connection', function(socket){
var addedUser = false;

socket.on('add user', function(data){
  var colorName = randomColorGen();
  socket.color = colorName;
  socket.username = data;
  ++numUsers;
  addedUser = true;
  socket.emit('greetings msg', {
    colorName : colorName,
    gmsg : 'Welcome to Simple Chat',
    numUsers : numUsers
  });
  socket.broadcast.emit('online users',{
    colorName: colorName,
    username : socket.username,
    numUsers : numUsers
  });
  socket.broadcast.emit('add user', {
    colorName: colorName,
    username : socket.username,
    numUsers : numUsers
  });
});

socket.on('new message', function(data){
  socket.emit('my message', {
    colorName: socket.color,
    username: 'You',
    message: data
  });
  socket.broadcast.emit('new message', {
    colorName: socket.color,
    username: socket.username,
    message: data
  });

});

socket.on('is typing', function(data){
  if(data == true){
    socket.broadcast.emit('is typing', {
      colorName: socket.color,
      username: socket.username,
      message: 'typing'
    });
  }else{
    socket.broadcast.emit('is typing', {
      username: '',
      message: ''
    });
  }
});

socket.on('disconnect', function(data){
  if(addedUser){
    --numUsers;
    socket.broadcast.emit('user left', {
      colorName: socket.color,
      username: socket.username,
      numUsers : numUsers
    });
  }
});

});

function randomColorGen(){
  var randomColor = '#' + ('000000' + Math.floor(Math.random()*16777215).toString(16)).slice(-6);
  return randomColor;
}

http.listen(process.env.PORT || 5400, function(){
 console.log('listening on *:',process.env.PORT);
});
