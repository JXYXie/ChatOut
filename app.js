const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('static'));

app.get('/', (req, res) => {
	res.render('index');
});

// port 8080
server = app.listen(8080);

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

    socket.nickname = getName();
    socket.color = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
    users.push(socket);
    io.sockets.emit('connected', {nickname : socket.nickname, color: socket.color});

    //console.log(users);
    //io.sockets.emit('updateusers', {users});

    // Disconnect user
    socket.on('disconnect', () => {
        var i = users.indexOf(socket);
        users.splice(i, 1);
        io.sockets.emit('disconnected', {nickname : socket.nickname, color: socket.color});
    });

    
    // Change nickname
    socket.on('change_name', (data) => {
        socket.nickname = data.nickname;
    });

    // Change color
    socket.on('change_color', (data) => {
        socket.color = data.color;
    });

    // Send message
    socket.on('new_message', (data) => {
        io.sockets.emit('new_message', {message : data.message, nickname : socket.nickname, color: socket.color});
    });

});
