const express = require('express');
const app = express();
const cookie = require('cookie');

app.set('view engine', 'ejs');
app.use(express.static('static'));

app.get('/', (req, res) => {
	res.render('index');
});

// port 8080
server = app.listen(8080);

var users = [];
var all_users = [];

var log = [];

var timestamp;
var msg_format;

//socket instantiation
const io = require("socket.io")(server);

function getName() {
    var number = Math.random();
    number.toString(36);
    var id = number.toString(36).substr(2, 9);
    return id;
}

function userExists(name) {
    return all_users.find(x => {
        return x.nickname === name;
    }) !== undefined;
}

io.on('connection', (socket) => {

    var user = {};
    var cookies = {};
    let cookies_str = socket.handshake.headers['cookie'];
    if (cookies_str !== undefined) {
        cookies = cookie.parse(cookies_str);
    }
    if (cookies.nickname == undefined) {
        do {
            socket.nickname = getName();
        } while (userExists(socket.nickname));
        socket.color = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
        user.nickname = socket.nickname;
        user.color = socket.color;
        all_users.push(user);
    }
    else {
        socket.nickname = cookies.nickname;
        socket.color = cookies.color;
        user.nickname = socket.nickname;
        user.color = socket.color;
    }

    if (users.find(x => {
        return x.nickname === user.nickname;
    }) === undefined) {
        users.push(user);
    }

    timestamp = new Date();
    msg_format = {};
    msg_format.msg = "has connected to the server.";
    msg_format.timestamp = timestamp;
    msg_format.nickname = socket.nickname;
    msg_format.color = socket.color;

    log.push(msg_format);

    socket.broadcast.emit('new_message', msg_format);
    io.emit('update_users', users);
    socket.emit('update_self', user);

    socket.emit('load_from_log', log);

    // Disconnect user
    socket.on('disconnect', () => {
        timestamp = new Date();
        msg_format = {};
        msg_format.msg = "";
        msg_format.msg += "has disconnected from the server.";
        msg_format.timestamp = timestamp;
        msg_format.nickname = socket.nickname;
        msg_format.color = socket.color;

        log.push(msg_format);

        users.splice(users.indexOf(user), 1);
        io.emit('update_users', users);
        io.emit('new_message', msg_format);
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

            io.emit('update_users', users);
            socket.emit('update_self', user);
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

            io.emit('update_users', users);
            socket.emit('update_self', user);
        }

    }
    else {
        timestamp = new Date();
        msg_format = {};
        msg_format.msg = data.message;
        msg_format.timestamp = timestamp;
        msg_format.nickname = socket.nickname;
        msg_format.color = socket.color;

        log.push(msg_format);
        console.log(log);
        io.emit('new_message', msg_format);

        }
    });

});
