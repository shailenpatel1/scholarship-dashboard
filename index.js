var app = require('express')();          // initializes app 
var http = require('http').Server(app);  // app is function handler for HTTP server

app.get('/', function(req, res){		 // '/' is route handler
	res.sendFile(__dirname + '/index.html');  // send my index.html file as a template when get request is made to homepage"
});

http.listen(8080, function(){
	console.log('listening on *:8080');  // http server listens on port 3000 and terminal outputs
});


