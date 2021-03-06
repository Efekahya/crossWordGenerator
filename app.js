// Words to be used in the game
let words = ["set", "tea", "eat", "east", "seat"];
const gridMatrix = () => {
	let grid = [];
	for (let i = 0; i < 7; i++) {
		grid.push([]);
		for (let j = 0; j < 7; j++) {
			grid[i].push("_");
		}
	}
	return grid;
};

const initializeGame = (grid) => {
	let tempWords = words;
	let word = tempWords[Math.floor(Math.random() * tempWords.length)];
	tempWords = tempWords.filter((filter) => filter !== word);
	let wordArray = word.split("");
	let wordLength = wordArray.length;
	// choose random direction
	let randomDirection = Math.floor(Math.random() * 2);
	// place the word in grid
	if (randomDirection === 0) {
		for (let i = 0; i < wordLength; i++) {
			grid[0][0 + i] = wordArray[i];
		}
	} else {
		for (let i = 0; i < wordLength; i++) {
			grid[0 + i][0] = wordArray[i];
		}
	}
	return {
		grid: grid,
		words: tempWords,
	};
};
const edgeCheck = (grid, coordinates) => {
	let edgeCounter = 0;
	if (coordinates[0] - 1 >= 0 && coordinates[0] + 1 <= 6 && coordinates[1] - 1 >= 0 && coordinates[1] + 1 <= 6) {
		if (grid[coordinates[0] + 1][coordinates[1]] !== "_") {
			edgeCounter++;
		}
		if (grid[coordinates[0] - 1][coordinates[1]] !== "_") {
			edgeCounter++;
		}
		if (grid[coordinates[0]][coordinates[1] + 1] !== "_") {
			edgeCounter++;
		}
		if (grid[coordinates[0]][coordinates[1] - 1] !== "_") {
			edgeCounter++;
		}
	}

	if (edgeCounter >= 3) {
		return false;
	}
	return true;
};
const canBePlaced = (grid, word, direction, coordinates) => {
	let wordArray = word.split("");
	let wordLength = wordArray.length;
	let canPlace = true;

	if (direction === 0) {
		for (let i = 0; i < wordLength; i++) {
			if (coordinates[1] + i + 1 >= 6) {
				canPlace = false;
				break;
			}

			let coord = [coordinates[0], coordinates[1] + i + 1];
			if (!edgeCheck(grid, coord)) {
				canPlace = false;
				break;
			}
			if (grid[coordinates[0]][coordinates[1] + i + 1] !== "_") {
				canPlace = false;
				break;
			}
		}
	} else {
		for (let i = 0; i < wordLength; i++) {
			if (coordinates[0] + i + 1 >= 6) {
				canPlace = false;
				break;
			}

			let coord = [coordinates[0] + i + 1, coordinates[1]];
			if (!edgeCheck(grid, coord)) {
				canPlace = false;
				break;
			}
			if (grid[coordinates[0] + i + 1][coordinates[1]] !== "_") {
				canPlace = false;
				break;
			}
		}
	}

	// check if direction is not same at the same index
	if (direction === 0) {
		if (coordinates[1] - 1 >= 0) {
			if (grid[coordinates[0]][coordinates[1] - 1] !== "_") {
				canPlace = false;
				return canPlace;
			}
		}
	} else {
		if (coordinates[0] - 1 >= 0) {
			if (grid[coordinates[0] - 1][coordinates[1]] !== "_") {
				canPlace = false;
				return canPlace;
			}
		}
	}

	if (!canPlace) {
		if (coordinates.length > 2) {
			coordinates.shift();
			coordinates.shift();
			canPlace = canBePlaced(grid, word, direction, coordinates);
			if (!canPlace) {
				direction = direction === 0 ? 1 : 0;
				canPlace = canBePlaced(grid, word, direction, coordinates);
			}
		}
	}
	return canPlace;
};

const addWord = (grid, word) => {
	let wordArray = word.split("");
	let wordLength = wordArray.length;
	// find matching letter
	let coordinates = [];
	for (let i = 0; i < grid.length; i++) {
		for (let j = 0; j < grid[i].length; j++) {
			if (grid[i][j] === wordArray[0]) {
				coordinates.push(i, j);
			}
		}
	}
	if (coordinates.length === 0) {
		return false;
	}
	// choose random direction
	let randomDirection = Math.floor(Math.random() * 2);
	if (!canBePlaced(grid, word, randomDirection, coordinates)) return false;
	// place the word in grid
	if (randomDirection === 0) {
		for (let i = 0; i < wordLength; i++) {
			grid[coordinates[0]][coordinates[1] + i] = wordArray[i];
		}
	} else {
		for (let i = 0; i < wordLength; i++) {
			grid[coordinates[0] + i][coordinates[1]] = wordArray[i];
		}
	}
	return grid;
};

const createBoard = (grid, words) => {
	let iterator = 0;
	let failedIndex = [];
	while (words.length > iterator) {
		let state = addWord(grid, words[iterator]);
		if (state != false) {
			iterator++;
			failCounter = 0;
		} else {
			failedIndex.push(iterator);
			iterator++;
		}
	}
	let failedWords = [];
	let retry = 0;
	while (failedIndex.length > 0 && retry < 100) {
		let index = failedIndex.pop();
		let isFailed = addWord(grid, words[index]);
		if (isFailed == false) {
			failedWords.push(words[index]);
			failedIndex.splice(0, 0, index);
			retry++;
		}
	}
	failedWords = [...new Set(failedWords)];
	return {
		grid: grid,
		failedWords: failedWords,
	};
};

let generatedBoards = [];
let boardGenerationLimit = 0;
while (generatedBoards.length < 10 && boardGenerationLimit < 200) {
	let grid = gridMatrix();
	game = initializeGame(grid);
	let board = createBoard(game.grid, game.words);

	while (board.failedWords.length > 0) {
		grid = gridMatrix();
		game = initializeGame(grid);

		board = createBoard(game.grid, game.words);
	}
	generatedBoards.push(board.grid);
	generatedBoards.forEach((element, index) => {
		for (let i = 0; i < generatedBoards.length; i++) {
			if (i !== index) {
				if (JSON.stringify(element) === JSON.stringify(generatedBoards[i])) {
					generatedBoards.splice(i, 1);
				}
			}
		}
	});
	boardGenerationLimit++;
}

generatedBoards.forEach((element) => {
	console.table(element);
});

console.log(`Successfully generated ${generatedBoards.length} unique and valid boards`, "in", boardGenerationLimit, "attempts");