var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Game = require('./Game.js');

var game = null;

server.listen(process.env.PORT || 8080, function() {
	console.log('_____Server started_____');
	game = new Game(
		function(row, col, currentPlayerId, prevPlayerId, winSequence) {
			var msg = {
				row: row,
				col: col
			}
			if (winSequence) {
				msg.sequence = winSequence;
				game.restart();
			}
			io.to(currentPlayerId).emit('turnBegan', msg);
			io.to(prevPlayerId).emit('turnEnded', msg);
		}
	);
});

app.get('/', function (req, res) {
	res.json({
		result: 'ok'
	});
});

io.on('connection', function (socket) {
	console.log('New client connected, id = ' + socket.id);
	// socket.emit('news', { hello: 'world' });

	socket.on('hello', hello.bind(socket));

	socket.on('joinGame', joinGame.bind(socket));

	socket.on('setTileIndex', setTileIndex.bind(socket));

	socket.on('ready', ready.bind(socket));

	socket.on('disconnect', disconnect.bind(socket));
});

var hello = function(userInfo) {
	this.emit('hello', {
		message: 'Hello, ' + userInfo,
		id: this.id
	});
}

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
				name: name,
				ready: true
			});
			if (clientsNum == 1) {
				this.emit('joinGameSucceeded', {
					message: 'Please wait for other player'
				})
			} else {
				this.emit('joinGameSucceeded', {
					message: 'Please enjoy the game!!'
				})
				startGame();
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
					message: 'Unknow exception'
				}); 
			}
		}
	}
};

var setTileIndex = function(userInfo) {
	var row = userInfo.row;
	var col = userInfo.col;
	var id = this.id;

	if (!game.checkIsPlayingById(id)) {
		this.emit('setTileIndexFailed', {
			message: 'You are not playing the game'
		});		
	} else if (!game.checkToTurnById(id)) {
		this.emit('setTileIndexFailed', {
			message: 'It\'s not your turn'
		});
	} else {
		try {
			game.setTileIndex(row, col);
		} catch (e) {
			console.log(e);
			if (e.name == 'IndexOutOfBoundException') {
				this.emit('setTileIndexFailed', {
					message: 'Invalid tile coordinate'
				});
			} else if (e.name == 'NotEmptyTileException') {
				this.emit('setTileIndexFailed', {
					message: 'Tile is claimed'
				});
			} else if (e.name == 'GameNotReadyException') {
				this.emit('setTileIndexFailed', {
					message: e.message
				})
			} else {
				this.emit('setTileIndexFailed', {
					message: 'Unknow exception'
				});
			}
		}		
	}
};

var ready = function() {
	if (game.setReadyById(this.id)) {
		io.emit('nextGameStarted');
	};
}

var disconnect = function() {
	console.log('Client with id = ' + this.id + ' disconnected');
	var client;
	if (client = game.getClientById(this.id)) {
		io.emit('opponentDisconnected');
		game.reset();
	} 	
}

var startGame = function() {
	var client1 = game.getClientNo(0);
	var client2 = game.getClientNo(1);
	io.to(client1.id).emit('gameStarted', {
		color: 'WHITE',
		goFirst: true,
		opponent: client2.name
	});
	io.to(client2.id).emit('gameStarted', {
		color: 'BLACK',
		goFirst: false,
		opponent: client1.name
	});
};