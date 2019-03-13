const express = require('express');
const app = express();
const cookie = require('cookie');

app.set('view engine', 'ejs');
app.use(express.static('static'));

app.get('/', (req, res) => {
	res.render('index');
});

// Port 8080
server = app.listen(8080);

var users = [];
var all_users = [];

var log = [];

var timestamp;
var msg_format;

// Socket instantiation
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
    var cookies_str = socket.handshake.headers['cookie'];
    // Set up cookies
    if (cookies_str !== undefined) {
        cookies = cookie.parse(cookies_str);
    }
    if (cookies.nickname == undefined) {
        do {
            user.nickname = getName();
        } while (userExists(user.nickname));
        user.color = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
        all_users.push(user);
    }
    else {
        user.nickname = cookies.nickname;
        user.color = cookies.color;
    }

    // Check to see if user is returning
    if (users.find(x => {
        return x.nickname === user.nickname;
    }) === undefined) {
        users.push(user);
    }

    timestamp = new Date();
    msg_format = {};
    msg_format.msg = "has connected to the server.";
    msg_format.timestamp = timestamp;
    msg_format.nickname = user.nickname;
    msg_format.color = user.color;

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
        msg_format.nickname = user.nickname;
        msg_format.color = user.color;

        log.push(msg_format);

        users.splice(users.indexOf(user), 1);
        io.emit('update_users', users);
        io.emit('new_message', msg_format);
    });

    // User is typing
    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', user.nickname);
    });

    // Send message
    socket.on('chat_message', (data) => {
        // Change user color
        if (data.message.startsWith("/nickcolor")) {
            let newcolor = data.message.slice(10);
            newcolor = newcolor.trim();
            if (newcolor.length === 6) {
                // Prefix colors with #
                newcolor =  "#" + newcolor;

                let user_ind = (users.findIndex(x => x.nickname == user.nickname));

                user.color = newcolor;
                users[user_ind].color = newcolor;

                io.emit('update_users', users);
                socket.emit('update_self', user);
            }
        }
        // Change nick name
        else if (data.message.startsWith("/nick")) {
            let newnickname = data.message.slice(6);
            // Make sure new nickname is unique
            if (!users.includes(newnickname)) {
                // Sanity checking to make sure nicknames are not too long
                if (newnickname.length > 20) {
                    newnickname = newnickname.substring(0, 20);
                }

                let user_ind = (users.findIndex(x => x.nickname == user.nickname));
                
                user.nickname = newnickname;
                users[user_ind].nickname = newnickname;

                io.emit('update_users', users);
                socket.emit('update_self', user);
            }
        }
        // Send regular message if no commands are issued
        else {
            timestamp = new Date();
            msg_format = {};
            msg_format.msg = data.message;
            msg_format.timestamp = timestamp;
            msg_format.nickname = user.nickname;
            msg_format.color = user.color;

            log.push(msg_format);
            io.emit('new_message', msg_format);
            }
        });
});
