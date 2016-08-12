"use strict"

var Board = require('./Board.js');

var WHITE = 'WHITE';
var BLACK = 'BLACK';

function GameStartedException(message) {
	this.message = message;
	this.name = "GameStartedException";
}

function GameNotReadyException(message) {
	this.message = message;
	this.name = "GameNotReadyException";
}

class Game {
	constructor(onTurnChanged, onGameWon) {
		this.board = new Board();
		this.reset();
		this.onTurnChanged = onTurnChanged;
		this.onGameWon = onGameWon;
	}

	reset() {
		this.players = [];
		this.board.reset();
		this.currentPlayerColor = WHITE;
		this.gameCount = 0;
		this.gameReady = true;
		this.readyNumber = this.players.length;
	}

	restart() {
		this.board.reset();
		this.gameCount++;
		this.currentPlayerColor = this.gameCount % 2 == 1 ? BLACK : WHITE;
		this.players[0].ready = false;
		this.players[1].ready = false;
		this.gameReady = false;
		this.readyNumber = 0;
	}

	addPlayer(player) {
		if (this.players.length == 0) {
			player.color = WHITE;
			this.players.push(player);
			return 1;
		} else if (this.players.length == 1) {
			player.color = BLACK;
			this.players.push(player);
			return 2;
		} else {
			throw new GameStartedException("The game is already started");
		}
	}

	removePlayerById(id) {
		for (var i = 0; i < this.players.length; i++) {
			if (this.players[i].id == id) {
				return this.players.splice(i, 0);
			}
		}
	}

	getPlayerNo(no) {
		return this.players[no];
	}

	// getPlayerById(id) {
	// 	for (var i = 0; i < this.players.length; i++) {
	// 		if (this.players[i].id == id) {
	// 			return this.players[i];
	// 		}
	// 	}

	// 	return null;
	// }

	getPlayerByColor(color) {
		for (var i = 0; i < this.players.length; i++) {
			if (this.players[i].color == color) {
				return this.players[i];
			}
		}

		return null;
	}

	getOpponentById(id) {
		for (var i = 0; i < this.players.length; i++) {
			if (this.players[i].id != id) {
				return this.players[i];
			}
		}
		return null;
	}

	getPlayersNumber() {
		return this.players.length;
	}

	setReadyById(id) {
		for (var i = 0; i < this.players.length; i++) {
			if (this.players[i].id == id) {
				this.players[i].ready = true;
				this.readyNumber++;
				if (this.readyNumber == this.players.length) {
					return true;
				}
			}
		}		
		return false;
	}

	checkIsPlayingById(id) {
		for (var i = 0; i < this.players.length; i++) {
			if (this.players[i].id == id) {
				return true;
			}
		}

		return false;
	}

	checkToTurnById(id) {
		for (var i = 0; i < this.players.length; i++) {
			if (this.players[i].id == id) {
				if (this.players[i].color == this.currentPlayerColor)
				{
					return true;
				}
				return false;
			}
		}
	}

	resetBoard() {
		this.board.reset();
	}

	setTileIndex(row, col) {
		try {
			for (var i = 0; i < this.players.length; i++) {
				if (this.players[i].ready == false) {
					throw new GameNotReadyException("The game is not ready yet");
				}
			}

			this.board.setTileIndex(row, col, this.currentPlayerColor == WHITE ? 1 : 2);
			var winSequence = undefined;
			if (this.board.checkWin()) {
				winSequence = this.board.getWinSequence();
			} 
				
			this.prevPlayerColor = this.currentPlayerColor;
			this.currentPlayerColor = (this.currentPlayerColor == WHITE ? BLACK : WHITE);
			this.onTurnChanged && this.onTurnChanged(row, col, 
					this.getPlayerByColor(this.currentPlayerColor).id,
					this.getPlayerByColor(this.prevPlayerColor).id,
					winSequence);
		} catch (e) {
			throw e;
		}
	}
}

module.exports = Game;