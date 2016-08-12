var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Game = require('./Game.js');

var games = null;

server.listen(process.env.PORT || 8080, function() {
	console.log('_____Server started_____');
	games = {};
	// game = new Game(
	// 	function(row, col, currentPlayerId, prevPlayerId, winSequence) {
	// 		var msg = {
	// 			row: row,
	// 			col: col
	// 		}
	// 		if (winSequence) {
	// 			msg.sequence = winSequence;
	// 			game.restart();
	// 		}
	// 		io.to(currentPlayerId).emit('turnBegan', msg);
	// 		io.to(prevPlayerId).emit('turnEnded', msg);
	// 	}
	// );
});

app.get('/', function (req, res) {
	res.json({
		result: 'ok'
	});
});

app.get('/games', function(req, res) {
	res.json(games);
});

io.on('connection', function (socket) {
	console.log('New client connected, id = ' + socket.id);
	// socket.emit('news', { hello: 'world' });

	socket.on('hello', hello.bind(socket));

	socket.on('createGame', createGame.bind(socket));

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
};

var createGame = function(userInfo) {
	var id = this.id;
	var name = userInfo.name;

	if (!name) {
		this.emit('joinGameFailed', {
			message: 'missing name',
		});
	} else {
		var game = new Game(
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
		games[id] = game;

		var player = {
			id: id,
			name: name,
			ready: true
		};
		game.addPlayer(player);

		this.emit('joinGameSucceeded', {
			message: 'Please wait for other player'
		});
	}
};

var joinGame = function(userInfo) {
	var id = this.id;
	var name = userInfo.name;
	var gameId = userInfo.gameId;
	var game = games[gameId];
	// if (!id) {
	// 	this.emit('joinGameFailed', {
	// 		message: 'missing id'
	// 	});
	// 	return;
	// } 
	if (!name) {
		this.emit('joinGameFailed', {
			message: 'missing name'
		});
		return;
	}  
	if (!gameId) {
		this.emit('joinGameFailed', {
			message: 'missing game id'
		});
		return;
	} else {
		if (!game) {
			this.emit('joinGameFailed', {
				message: 'No game with such id'
			});
			return;			
		}

		try {
			var playersNum = game.addPlayer({
				id: id,
				name: name,
				ready: true
			});
			if (playersNum == 1) {
				this.emit('joinGameSucceeded', {
					message: 'Please wait for other player'
				});
			} else if (playersNum == 2) {
				this.emit('joinGameSucceeded', {
					message: 'Please enjoy the game!!'
				});
				games[id] = game;
				startGame(gameId);
			} else {
				this.emit('joinGameFailed', {
					message: 'Unknow exception - 1'
				}); 
			}
			console.log("Player " + id + " joined game");
		} catch (e) {
			console.log(e);
			if (e.name == 'GameStartedException') {
				this.emit('joinGameFailed', {
					message: 'The game is already started'
				}); 
			} else {
				this.emit('joinGameFailed', {
					message: 'Unknow exception - 2'
				}); 
			}
		}
	}
};

var setTileIndex = function(userInfo) {
	var row = userInfo.row;
	var col = userInfo.col;
	var id = this.id;
	var game = games[id];

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
	var id = this.id;
	var game = games[id];
	if (game.setReadyById(id)) {
		io.emit('nextGameStarted');
	};
};

var disconnect = function() {
	var id = this.id;
	console.log('Client with id = ' + id + ' disconnected');
	var game = games[id];
	if (game) {
		var opponent = game.getOpponentById(id)

		if (opponent) {
		io.to(opponent.id).emit('opponentDisconnected');
		}

		game.removePlayerById(id);
		games[id] = null;
	} 	
};

var startGame = function(gameId) {
	var game = games[gameId];
	var player1 = game.getPlayerNo(0);
	var player2 = game.getPlayerNo(1);
	io.to(player1.id).emit('gameStarted', {
		color: 'WHITE',
		goFirst: true,
		opponent: player2.name
	});
	io.to(player2.id).emit('gameStarted', {
		color: 'BLACK',
		goFirst: false,
		opponent: player1.name
	});
};