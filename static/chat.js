$(function(){
	var socket = io.connect('http://localhost:8080');

	// buttons and inputs
	var message = $("#message");
	var send_message = $("#send_message");
	var chatroom = $("#chatroom");
	var messages = $("#messages");

	var timestamp;
	var time_string;

	// Sent message
	send_message.click(function(){
		socket.emit('new_message', {message : message.val()});
	});

	//Listen sent messages
	socket.on("new_message", (data) => {
		messages.html('');
		message.val('');

		if (data.message.length > 0) {
            if (data.message.startsWith("/nickcolor")) {
                let colours = data.message.slice(10);
                colours = colours.trim();
                if (colours.length === 6) {
                    name_colour =  "#" + colours;
                    document.cookie = "colour=" + name_colour;
                    socket.emit('colourchange');
				}
				else {
                    let msg = "Incorrect colour format. Please use /nickcolor RRGGBB format";
                    message.append($('<li class="svmsg">').text(msg));
				}
			}
			else if (data.message.startsWith("/nick")) {	
				let newnickname = data.message.slice(6);
				socket.emit('change_name', {nickname : newnickname});
			}
			else {
				timestamp = new Date();
				hours = timestamp.getHours();
				hours = ("0" + hours).slice(-2);
				minutes = timestamp.getMinutes();
				minutes = ("0" + minutes).slice(-2);
		
				time_string = "[" + hours + ":" + minutes + "] ";
				chatroom.append("<p class='message'; style='color':" + data.color + ";'>" + time_string + data.nickname + ": " + data.message + "</p>");
			}
		}

	});

	socket.on('connected', (data) => {
		timestamp = new Date();
		hours = timestamp.getHours();
		hours = ("0" + hours).slice(-2);
		minutes = timestamp.getMinutes();
		minutes = ("0" + minutes).slice(-2);
		//data.color = data.color.trim();

		time_string = "[" + hours + ":" + minutes + "] ";
		chatroom.append("<p class='message'; style='color':" + data.color + ";'>" + time_string + "User <strong>" + data.nickname + "</strong> has connected to the server.</p>");
	});

	socket.on('updateusers'), (data) => {
		console.log(data);
		let newHTML = [];
        for (let i = 0; i < data.length; i++) {
            newHTML.push('<p style="color:' +  data[i].color + ';">' + data[i].name + '</p>');
        }
        $('#users').html(newHTML.join(''));
	}

});


