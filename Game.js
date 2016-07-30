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
		this.clients = [];
		this.board.reset();
		this.currentPlayerColor = WHITE;
		this.gameCount = 0;
		this.gameReady = true;
		this.readyNumber = this.clients.length;
	}

	restart() {
		this.board.reset();
		this.gameCount++;
		this.currentPlayerColor = this.gameCount % 2 == 1 ? BLACK : WHITE;
		this.clients[0].ready = false;
		this.clients[1].ready = false;
		this.gameReady = false;
		this.readyNumber = 0;
	}

	addClient(client) {
		if (this.clients.length == 0) {
			client.color = WHITE;
			this.clients.push(client);
			return 1;
		} else if (this.clients.length == 1) {
			client.color = BLACK;
			this.clients.push(client);
			return 2;
		} else {
			throw new GameStartedException("The game is already started");
		}
	}

	getClientNo(no) {
		return this.clients[no];
	}

	getClientById(id) {
		for (var i = 0; i < this.clients.length; i++) {
			if (this.clients[i].id == id) {
				return this.clients[i];
			}
		}

		return null;
	}

	getClientByColor(color) {
		for (var i = 0; i < this.clients.length; i++) {
			if (this.clients[i].color == color) {
				return this.clients[i];
			}
		}

		return null;
	}

	setReadyById(id) {
		for (var i = 0; i < this.clients.length; i++) {
			if (this.clients[i].id == id) {
				this.clients[i].ready = true;
				this.readyNumber++;
				if (this.readyNumber == this.clients.length) {
					return true;
				}
			}
		}		
		return false;
	}

	checkIsPlayingById(id) {
		for (var i = 0; i < this.clients.length; i++) {
			if (this.clients[i].id == id) {
				return true;
			}
		}

		return false;
	}

	checkToTurnById(id) {
		for (var i = 0; i < this.clients.length; i++) {
			if (this.clients[i].id == id) {
				if (this.clients[i].color == this.currentPlayerColor)
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
			for (var i = 0; i < this.clients.length; i++) {
				if (this.clients[i].ready == false) {
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
					this.getClientByColor(this.currentPlayerColor).id,
					this.getClientByColor(this.prevPlayerColor).id,
					winSequence);
		} catch (e) {
			throw e;
		}
	}
}

module.exports = Game;