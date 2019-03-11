$(function(){
	var socket = io.connect('http://localhost:8080');

	// buttons and inputs
	var message = $("#message");
	var send_message = $("#send_message");
	var messages = $("#messages");
	var msgObj = $("#messages")[0];

	var timestamp;
	var time_string;

	// Sent message
	send_message.click(function(){
		socket.emit('new_message', {message : message.val()});
	});

	//Listen sent messages
	socket.on("new_message", (data) => {
		message.val('');

		if (data.message.length > 0) {
            if (data.message.startsWith("/nickcolor")) {
                let newcolor = data.message.slice(10);
                newcolor = newcolor.trim();
                if (newcolor.length === 6) {
                    newcolor =  "#" + newcolor;
                    socket.emit('change_color', {color: newcolor});
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

				let html = "<div class='message'>";
				html += "<span class='timestamp'>" + time_string  + "</span>";
				html += "<span class='nickname' style='color:" + data.color + ";'>" + data.nickname + "</span>";
				html += "<span class='msgcontent'>" + " " + data.message;
		
				messages.append(html);
				msgObj.scrollTop = msgObj.scrollHeight;
			}
		}

	});

	socket.on('connected', (data) => {
		timestamp = new Date();
		hours = timestamp.getHours();
		hours = ("0" + hours).slice(-2);
		minutes = timestamp.getMinutes();
		minutes = ("0" + minutes).slice(-2);

		time_string = "[" + hours + ":" + minutes + "] ";

		let html = "<div class='message'>";
		html += "<span class='timestamp'>" + time_string  + "</span>";
		html += "<span class='nickname' style='color:" + data.color + ";'>" + data.nickname + "</span>";
		html += "<span class='msgcontent'>" + " has connected to the server.</span>";

		messages.append(html);
	});

	socket.on('disconnected', (data) => {
		timestamp = new Date();
		hours = timestamp.getHours();
		hours = ("0" + hours).slice(-2);
		minutes = timestamp.getMinutes();
		minutes = ("0" + minutes).slice(-2);

		time_string = "[" + hours + ":" + minutes + "] ";

		let html = "<div class='message'>";
		html += "<span class='timestamp'>" + time_string  + "</span>";
		html += "<span class='nickname' style='color:" + data.color + ";'>" + data.nickname + "</span>";
		html += "<span class='msgcontent'>" + " has disconnected from the server.</span>";

		messages.append(html);
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


