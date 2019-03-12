$(function(){
	var socket = io.connect('http://localhost:8080');

	// Document objects
	var message = $("#message");
	var send_message = $("#send_message");
	var messages = $("#messages");
	var msg_obj = $("#messages")[0];
	var users_obj = $("#users");
	var title = $("#title");

	var time_string;
	var curr_user;

	// Send message
	send_message.click(function(){
		socket.emit('chat_message', {message : message.val()});
	});

	// Listen for sent messages
	socket.on("new_message", (data) => {
		message.val('');
		if (data.msg.length > 0) {
			display(data);
		}
		else {
			return;
		}
	});

	// Update list of users
	socket.on('update_users', (data) => {
		let user_html = [];
		for (let i = 0; i < data.length; i++) {
			user_html.push("<p class='nickname' style='color:" + data[i].color + ";'>" + data[i].nickname + "</p>");
		}
		users_obj.html(user_html.join(""));
		
	});

	// Update welcome message and cookies
	socket.on('update_self', (data) => {
		message.val('');
		curr_user = data.nickname;

		document.cookie = "nickname=" + data.nickname;
		document.cookie = "color=" + data.color;

		title.html("Welcome to Chat Out &#128172 You are " + data.nickname);
	});

	// Load messages from message log
	socket.on('load_from_log', (data) => {
		for (let x of data) {
			display(x);
		}
	});

	// HTML display
	function display(data) {

		let user_time = new Date(data.timestamp);
		hours = user_time.getHours();
		hours = ("0" + hours).slice(-2);
		minutes = user_time.getMinutes();
		minutes = ("0" + minutes).slice(-2);
		time_string = "[" + hours + ":" + minutes + "] ";

		let html = "<div class='message'>";
		html += "<span class='timestamp'>" + time_string  + "</span>";
		// User's own messages are bolded
		if (curr_user === data.nickname) {
			html += "<span class='nickname-bold' style='color:" + data.color + ";'>" + data.nickname + "</span>";
			html += "<span class='msgcontent-bold'>" + " " + data.msg;
		}
		else {
			html += "<span class='nickname' style='color:" + data.color + ";'>" + data.nickname + "</span>";
			html += "<span class='msgcontent'>" + " " + data.msg;
		}
		messages.append(html);
		msg_obj.scrollTop = msg_obj.scrollHeight;
	}
});
