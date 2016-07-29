var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Game = require('./Game.js');

var game = null;

server.listen(process.env.PORT || 8080, function() {
	console.log('_____Server started_____');
	game = new Game(function() {
		var client1 = game.getClientNo(0);
		var client2 = game.getClientNo(1);
		io.to(client1.id).emit('gameStarted', {
			opponent: client2.name,
			goFirst: true
		});
		io.to(client2.id).emit('gameStarted', {
			opponent: client1.name,
			goFirst: false
		})
	});
});

app.get('/', function (req, res) {
	res.json({
		result: 'ok'
	});
});

io.on('connection', function (socket) {
	console.log('New client connected, id = ' + socket.id);
	socket.emit('news', { hello: 'world' });
	socket.on('hello', function (data) {
		socket.emit('hello', {
			message: 'Hello, ' + data,
			id: socket.id
		});
	});
	socket.on('joinGame', joinGame.bind(socket));
	socket.on('setTileIndex', setTileIndex.bind(socket));

	socket.on('disconnect', function() {
		console.log('Client with id = ' + socket.id + ' disconnected');
		var client;
		if (client = game.getClientById(socket.id)) {
			io.emit('playerDisconnected', client.name);
			game.resetGame();
		} 
	});
});

var joinGame = function(userInfo) {
	var id = userInfo.id;
	var name = userInfo.name;
	if (!id) {
		this.emit('joinGameFailed', {
			message: 'missing id'
		});
	} else if (!name) {
		this.emit('joinGameFailed', {
			message: 'missing name',
		});
	} else {
		try {
			var clientsNum = game.addClient({
				id: id,
				name: name
			});
			if (clientsNum == 1) {
				this.emit('joinGameSucceeded', {
					message: 'Please wait for other player'
				})
			} else {
				this.emit('joinGameSucceeded', {
					message: 'Please enjoy the game!!'
				})
			}
			console.log("Player " + id + " joined game");
		} catch (e) {
			console.log(e);
			if (e.name == "GameStartedException") {
				this.emit('joinGameFailed', {
					message: e.message
				}); 
			} else {
				this.emit('joinGameFailed', {
					message: 'unknow exception'
				}); 
			}
		}
	}
};

var setTileIndex = function(userInfo) {
	console.log("set tile index: " + row + ", " + col + ", " + index);
};