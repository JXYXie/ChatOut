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

    io.emit('connected', {nickname : socket.nickname, color: socket.color});
    io.emit('update_users', users);
    socket.emit('update_self', user.nickname);

    // Disconnect user
    socket.on('disconnect', () => {
        connections.splice(connections.indexOf(socket), 1);
        users.splice(users.indexOf(user), 1);
        io.emit('disconnected', {nickname : socket.nickname, color: socket.color});
        socket.emit('update_users', users);
    });

    // Change nickname
    socket.on('change_name', (data) => {
        let user_ind = (users.findIndex(x => x.nickname == socket.nickname));
        let conn_ind = (users.findIndex(x => x.nickname == socket.nickname));

        console.log("Before: " + socket.nickname + " " + user.nickname);
        socket.nickname = data.nickname;
        user.nickname = data.nickname;

        users[user_ind].nickname = data.nickname;
        connections[conn_ind].nickname = data.nickname;
        io.emit('update_users', users);
        socket.emit('update_self', user.nickname);
    });

    // Send message
    socket.on('chat_message', (data) => {

    if (data.message.startsWith("/nickcolor")) {
        let newcolor = data.message.slice(10);
        newcolor = newcolor.trim();
        if (newcolor.length === 6) {
            newcolor =  "#" + newcolor;

            let user_ind = (users.findIndex(x => x.nickname == socket.nickname));
            let conn_ind = (users.findIndex(x => x.nickname == socket.nickname));

            socket.color = newcolor;
            user.color = newcolor;

            users[user_ind].color = newcolor;
            connections[conn_ind].color = newcolor;

            io.emit('update_users', users);
            socket.emit('update_self', user.nickname);
        }
    }
    else if (data.message.startsWith("/nick")) {
        let newnickname = data.message.slice(6);
        socket.emit('change_name', {nickname : newnickname});

        if (!users.includes(newnickname)) {
            let user_ind = (users.findIndex(x => x.nickname == socket.nickname));
            let conn_ind = (users.findIndex(x => x.nickname == socket.nickname));
            
            socket.nickname = newnickname;
            user.nickname = newnickname;

            users[user_ind].nickname = newnickname;
            connections[conn_ind].nickname = newnickname;

            io.emit('update_users', users);
            socket.emit('update_self', user.nickname);
        }

    }
    else {
        let timestamp = new Date();
        let msg_format = {};
        msg_format.msg = data.message;
        msg_format.timestamp = timestamp;
        msg_format.nickname = socket.nickname;
        msg_format.color = socket.color;

        io.emit('new_message', msg_format);
        }
    });

});
