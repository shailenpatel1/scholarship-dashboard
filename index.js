var app = require('express')();          // initializes app 
var http = require('http').Server(app);  // app is function handler for HTTP server
var io = require('socket.io')(http);

app.get('/', function(req, res){		 // '/' is route handler
	res.sendFile(__dirname + '/index.html');  // send my index.html file as a template when get request is made to homepage"
});

io.on('connection', function(socket){
	console.log('a user has connected');
	socket.on('disconnect', function(){
		console.log('user disconnected');
	}) 
	socket.on('chat message', function(msg){
		io.emit('chat message', msg);
	}); 
});   

http.listen(8080, function(){
	console.log('listening on *:8080');  // http server listens on port 3000 and terminal outputs
});

