"use strict"

const NUMBER_TO_WIN = 5;
const NULL = 0;
const WHITE = 1;
const BLACK = 2;
const ROWS = 19;
const COLS = 19;

function IndexOutOfBoundException(message) {
	this.message = message;
	this.name = "IndexOutOfBoundException";
}

function InvalidTileIndexException(message) {
	this.message = message;
	this.name = "InvalidTileIndexException";
}

function NotEmptyTileException(message) {
	this.message = message;
	this.name = "NotEmptyTileException";
}

class Board {
	constructor() {
		this.numRows = ROWS;
		this.numCols = COLS;
		this.reset();
	}

	reset() {
		this.lastRowIdx = 0;
		this.lastColIdx = 0;
		this.winSequence = [];
		this.tiles = [];
		for (var i = 0; i < this.numRows; i++) {
			this.tiles[i] = [];
			for (var j = 0; j < this.numCols; j++) {
				this.tiles[i][j] = NULL;
			}
		}
	}

	checkWin() {
		var currentTile = this.tiles[this.lastRowIdx][this.lastColIdx];
		return (this.checkHorizontal(currentTile) || this.checkVertical(currentTile) ||
				this.checkBackDiagonal(currentTile) || this.checkForwardDiagonal(currentTile));
	}

	checkHorizontal(currentTile) {
		// console.log('checkHorizontal');
		var row = this.lastRowIdx;
		var column = this.lastColIdx;
		var maxOffset = NUMBER_TO_WIN - 1;
		var count = 0;

		var jMin = column - maxOffset;
		var jMin = jMin > -1 ? jMin : 0;
		var jMax = column + maxOffset;
		var jMax = jMax < this.numCols ? jMax : this.numCols - 1;

		this.winSequence = [];
	
		for (var j = jMin; j <= jMax; j++) {
			if (this.tiles[row][j] == currentTile) {
				this.winSequence.push({row: row, col: j});
				count++;
			} else if (count >= NUMBER_TO_WIN) {
				break;
			} else {
				count = 0;
				this.winSequence = [];
			}
		}

		if (count >= NUMBER_TO_WIN) {
			// console.log("win horizontal");
			return true;
		}
		// console.log("not win horizontal");
		return false;		
	}

	checkVertical(currentTile) {
		// console.log('checkVertical');
		var row = this.lastRowIdx;
		var column = this.lastColIdx;
		var maxOffset = NUMBER_TO_WIN - 1;
		var count = 0;

		var iMin = row - maxOffset;
		var iMin = iMin > -1 ? iMin : 0;
		var iMax = row + maxOffset;
		var iMax = iMax < this.numRows ? iMax : this.numRows - 1;

		this.winSequence = [];

		for (var i = iMin; i <= iMax; i++) {
			if (this.tiles[i][column] == currentTile) {
				this.winSequence.push({row: i, col: column});
				count++;
			} else if (count >= NUMBER_TO_WIN) {
				break;
			} else {
				count = 0;
				this.winSequence = [];
			}
		}

		if (count >= NUMBER_TO_WIN) {
			// console.log("win vertical");
			return true;
		}
		// console.log("not win vertical");
		return false;		
	}

	checkBackDiagonal(currentTile) {
		// console.log('checkBackDiagonal');
		var row = this.lastRowIdx;
		var column = this.lastColIdx;
		var maxOffset = NUMBER_TO_WIN - 1;
		var count = 0;
		var jMin = column - maxOffset;
		var jMax = column + maxOffset;
		var jMax = jMax < this.numCols ? jMax : this.numCols - 1;	
		var iMin = row - maxOffset;
		var iMax = row + maxOffset;
		var iMax = iMax < this.numRows ? iMax : this.numRows - 1;
		if (row > column) {
			if (jMin < 0) {
				jMin = 0;
				iMin = row - column;
			}
		} else {
			if (iMin < 0) {
				iMin = 0;
				jMin = column - row;
			}
		}
		this.winSequence = [];
		
		for (var i = iMin, j = jMin; i <= iMax; i++, j++) {
			if (this.tiles[i][j] == currentTile) {
				this.winSequence.push({row: i, col: j});
				count++;
			} else if (count >= NUMBER_TO_WIN) {
				break;
			}  else {
				count = 0;
				this.winSequence = [];
			}
		}

		if (count >= NUMBER_TO_WIN) {
			// console.log ("win back diagonal");
			return true;
		}
		// console.log ("not win back diagonal");
		return false;		
	}	

	checkForwardDiagonal (currentTile) {
		// console.log('checkForwardDiagonal');
		var row = this.lastRowIdx;
		var column = this.lastColIdx;
		var maxOffset = NUMBER_TO_WIN - 1;
		var count = 0;

		var count = 0;
		var jMin = column - maxOffset;
		var jMin = jMin > -1 ? jMin : 0;
		var jMax = column + maxOffset;
		var jMax = jMax < this.numCols ? jMax : this.numCols - 1;		
		var iMin = row - maxOffset;
		var iMin = iMin > -1 ? iMin : 0;
		var iMax = row + maxOffset;
		var iMax = iMax < this.numRows ? iMax : this.numRows - 1;
		
		this.winSequence = [];

		for (var i = iMin, j = jMax; i <= iMax; i++, j--) {
			if (this.tiles[i][j] == currentTile) {
				this.winSequence.push({row: i, col: j});
				count++;
			} else if (count >= NUMBER_TO_WIN) {
				break;
			} else {
				count = 0;
				this.winSequence = [];
			}
		}

		if (count >= NUMBER_TO_WIN) {
			// console.log ("win forward diagonal");
			return true;
		}
		// console.log ("not win forward diagonal");
		return false;
	}

	setTileIndex (row, col, index) {
		if (row < 0) {
			throw new IndexOutOfBoundException("Row index must be greater than or equal to 0");
		}

		if (row > this.numRows) {
			throw new IndexOutOfBoundException("Row index must be less than or equal to " 
												+ this.numRows);
		}

		if (col < 0) {
			throw new IndexOutOfBoundException("Col index must be greater than or equal to 0");
		}

		if (col > this.numCols) {
			throw new IndexOutOfBoundException("Col index must be less than or equal to "
												+ this.numCols);
		}

		if (index != 1 && index != 2) {
			throw new InvalidTileIndexException("Tile index must be 1 or 2");
		}

		if (this.tiles[row][col] != NULL) {
			throw new NotEmptyTileException("Tile is not empty");
		}

		this.tiles[row][col] = index;
		this.lastRowIdx = row;
		this.lastColIdx = col;
	}

	getWinSequence() {
		return this.winSequence;
	}

	toString() {
		var str = "";
		for (var i = 0; i < this.tiles.length; i++) {
			for (var j = 0; j < this.tiles[i].length; j++) {
				str += this.tiles[i][j] + " ";
			}
			str += "\n";
		}
		return str;
	}
}

module.exports = Board;