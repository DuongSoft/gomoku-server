var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(process.env.PORT || 8080);

app.get('/', function (req, res) {
	// res.sendfile(__dirname + '/index.html');
	res.json({
		result: 'ok'
	});
});

io.on('connection', function (socket) {
	socket.emit('news', { hello: 'world' });
	socket.on('client-say-hello', function (data) {
		console.log(data);
		socket.emit('server-say-hello', 'hello ' + data);
	});
});

