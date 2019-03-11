const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('static'));

app.get('/', (req, res) => {
	res.render('index');
});

// port 8080
server = app.listen(8080);

var connections = [];
var users = [];

//socket instantiation
const io = require("socket.io")(server);

function getName() {
    var number = Math.random();
    number.toString(36);
    var id = number.toString(36).substr(2, 9);
    return id;
}

io.on('connection', (socket) => {

    var user = {};
    socket.nickname = getName();
    socket.color = '#'+(Math.random()*0xFFFFFF<<0).toString(16);

    user.nickname = socket.nickname;
    user.color = socket.color;

    connections.push(socket);
    users.push(user);

    io.sockets.emit('connected', {nickname : socket.nickname, color: socket.color});
    io.sockets.emit('update_users', users);

    // Disconnect user
    socket.on('disconnect', () => {
        connections.splice(connections.indexOf(socket), 1);
        users.splice(users.indexOf(user), 1);
        io.sockets.emit('disconnected', {nickname : socket.nickname, color: socket.color});
        io.sockets.emit('update_users', users);
    });

    // Change nickname
    socket.on('change_name', (data) => {
        let key = (users.findIndex(x => x.nickname == socket.nickname));
        socket.nickname = data.nickname;
        user.nickname = data.nickname;
        users[key].nickname = data.nickname;
        io.sockets.emit('update_users', users);
    });

    // Change color
    socket.on('change_color', (data) => {
        let key = (users.findIndex(x => x.nickname == socket.nickname));
        socket.color = data.color;
        user.color = data.color;
        users[key].color = data.color;
        io.sockets.emit('update_users', users);
    });

    // Send message
    socket.on('new_message', (data) => {
        io.sockets.emit('new_message', {message : data.message, nickname : socket.nickname, color: socket.color});
    });

});
