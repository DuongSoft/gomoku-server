"use strict"

var Board = require('./Board.js');

function GameStartedException(message) {
	this.message = message;
	this.name = "GameStartedException";
}

class Game {
	constructor(onGameDidStart) {
		this.board = new Board();
		this.resetGame();
		this.onGameDidStart = onGameDidStart;
	}

	resetGame() {
		this.clients = [];
		this.board.reset();
	}


	addClient(client) {
		if (this.clients.length == 0) {
			this.clients.push(client);
			return 1;
		} else if (this.clients.length == 1) {
			this.clients.push(client);
			this.onGameDidStart && this.onGameDidStart();
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
			console.log('Test with ' + this.clients[i].id);
			if (this.clients[i].id == id) {
				return this.clients[i];
			}
		}

		return null;
	}

	resetBoard() {
		this.board.reset();
	}

	checkWin() {
		return this.board.checkWin();
	}

	setTileIndex(row, col, index) {
		this.board.setTileIndex(row, col, index);
	}

	getWinSequence() {
		return this.board.getWinSequence();
	}
}

module.exports = Game;