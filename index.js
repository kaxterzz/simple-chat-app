var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
const cors = require('cors');
const passport = require('passport');
const gauth = require('./g-auth');
const fauth = require('./f-auth');

gauth(passport);
fauth(passport);
app.use(passport.initialize());

app.use(cors());
app.options('*', cors());

app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Methods", "POST,GET,PUT,DELETE");
    res.header("Content-Type", "application/json");
    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null);
    console.log(ip);
    next();
});

app.get('/auth/google', passport.authenticate('google', {
    scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
    ]
}));




var numUsers = 0;

io.on('connection', function(socket) {
    var addedUser = false;
    const socketId = socket.id;

    app.get('/auth/google/callback',
        passport.authenticate('google', { failureRedirect: '/' }),
        (req, res) => {
            // var f = JSON.stringify(req.user)
            req.session.token = req.user.token;

            //res.json({status:"success", token:req.user.token, data:req.user.profile});

            var user = {
                id: req.user.profile._json.sub,
                name: req.user.profile._json.name,
                email: req.user.profile._json.email,
                picture: req.user.profile._json.picture
            }

            res.cookie('token', req.session.token);
            res.cookie('user', user);

            socket.emit('auth status', {
                status: true,
                token: req.session.token
            });

            socket.broadcast.emit('online users oauth', {
                colorName: colorName,
                username: user.name,
                numUsers: numUsers
            });
            socket.broadcast.emit('add user oauth', {
                colorName: colorName,
                username: user.name,
                numUsers: numUsers,
                msg: user.name + ' joined'
            });

            socket.on('add user oauth', function(data) {
                var colorName = randomColorGen();
                socket.color = colorName;
                socket.username = user.name;
                ++numUsers;
                addedUser = true;
            });
        }
    );

    socket.on('add user', function(data) {
        var colorName = randomColorGen();
        socket.color = colorName;
        socket.username = data;
        ++numUsers;
        addedUser = true;
        socket.emit('greetings msg', {
            colorName: colorName,
            gmsg: 'Welcome to Simple Chat',
            numUsers: numUsers
        });
        socket.broadcast.emit('online users', {
            colorName: colorName,
            username: socket.username,
            numUsers: numUsers
        });
        socket.broadcast.emit('add user', {
            colorName: colorName,
            username: socket.username,
            numUsers: numUsers,
            msg: socket.username + ' joined'
        });
    });

    socket.on('send_res', function(data){
        socket.broadcast.emit('send_res',{
            output: data
        });
        socket.emit('send_res',{
            output: data
        });
    });

    socket.on('new message', function(data) {
        socket.emit('my message', {
            _id: Math.round(Math.random() * 1000000),
            text: data,
            createdAt: Date.now(),
            user: {
                _id: Math.round(Math.random() * 1000000),
                name: 'You'
            },
            colorName: socket.color,
            username: 'You',
        });
        socket.broadcast.emit('new message', {
            _id: Math.round(Math.random() * 1000000),
            text: data,
            createdAt: Date.now(),
            user: {
                _id: Math.round(Math.random() * 1000000),
                name: socket.username
            },
            colorName: socket.color,
            username: socket.username,
        });

    });

    socket.on('new private message', function(data) {
        socket.emit('my new message', {
            _id: Math.round(Math.random() * 1000000),
            text: data,
            createdAt: Date.now(),
            user: {
                _id: Math.round(Math.random() * 1000000),
                name: 'You'
            },
            colorName: socket.color,
            username: 'You',
        });
        socket.emit('new private message', {
            _id: Math.round(Math.random() * 1000000),
            text: data,
            createdAt: Date.now(),
            user: {
                _id: Math.round(Math.random() * 1000000),
                name: socket.username
            },
            colorName: socket.color,
            username: socket.username,
        });

    });

    socket.on('is typing', function(data) {
        if (data == true) {
            socket.broadcast.emit('is typing', {
                colorName: socket.color,
                username: socket.username,
                message: 'typing'
            });
        } else {
            socket.broadcast.emit('is typing', {
                username: '',
                message: ''
            });
        }
    });

    socket.on('disconnect', function(data) {
        if (addedUser) {
            --numUsers;
            socket.broadcast.emit('user left', {
                colorName: socket.color,
                username: socket.username,
                numUsers: numUsers,
                msg: socket.username + ' left'
            });
        }
    });

    socket.on('exchange', function(data) {
        socket.broadcast.emit('exchange', {
            to: data.to,
            from: data.from,
            candidate: data.candidate,
            sdp: data.sdp
        });
    });

    socket.on('video exchange', function(data) {
        data.from = socketId;
        let to = io.sockets.connected[data.to];
        to.emit('video exchange', data);
    });

});

function randomColorGen() {
    var randomColor = '#' + ('000000' + Math.floor(Math.random() * 16777215).toString(16)).slice(-6);
    return randomColor;
}

http.listen(process.env.PORT || 3770, function() {
    console.log('listening on *:', process.env.PORT);
});