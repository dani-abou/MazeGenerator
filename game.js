//Instantiates the canvas as well as the drawing context
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

//Default dimensions of the board
var columnCount = 10;
var rowCount = 15;

//INstantiates tile and wall dimensions;
var tileWidth;
var tileHeight;
var cornerHeight;
var cornerWidth;

//Default colors for the tiles and the walls
const BGColor = '#147496';
const wallColor = '#61b872';

//Instantiates the 2D array for the board
var board;

//INstantiates a temporary variable used to traverse through the board
var current;

//Boolean representing user inputted direction
var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;

//Used in Breadth First solver to erase extra branches
var visits = []

//CLass representing each individual spot on the board's grid
class Tile {
  constructor(col, row) {
    this.column = col;
    this.row = row;
    this.connections = [];
    this.visited = false;
    //userVisited is used differently if user inputs keys or solver is used
    this.userVisited = false;
  }
}

//Generates instances of tiles for the board
function generateBoard() {
  board = []
  for (var c = 0; c < columnCount; c++) {
    board[c] = [];
    for (var r = 0; r < rowCount; r++) {
      board[c][r] = new Tile(c, r);
      if (c == 0 && r == 0) {
        board[c][r].userVisited = true;
      }
    }
  }
}


//Uses depth first to generatePath a path recursively.
//Picks a random valid neighbor and adds it to the accumulating stack.
//If there are no valid neighbors, we pop that value from the stack, and
//rollback through the stack till we arrive at a tile with at least one valid
//neighbor (creating a dead end)
//Continues until there are no values left in the stack since no value
//has any valid enighbros anymore
function generatePath(stack) {
  if (stack.length == 0) {
    return;
  }
  const current = stack[stack.length - 1];
  const neighbors = validNeighbors(current, stack);
  if (neighbors.length == 0 || (current.column == columnCount - 1 &&
      current.row == rowCount - 1)) {
    stack.pop();
    generatePath(stack);
    return;
  }
  next = neighbors[Math.floor(Math.random() * neighbors.length)];
  stack.push(next);
  current.connections.push(next);
  next.connections.push(current);
  next.visited = true;
  generatePath(stack);
  return;
}

//Returns an array of valid neighbor tiles of the current
//A tile is a valid neighbor if it is not in the stack, on the board,
//and has not already been visited

function validNeighbors(current, stack) {
  const currentCol = current.column;
  const currentRow = current.row;
  var temp;
  var neighbors = [];
  for (var i = 0; i < 4; i++) {
    switch (i) {
      case 0:
        try {
          temp = board[currentCol - 1][currentRow];
        } catch (err) {
          temp = undefined
        }
        break;
      case 1:
        try {
          temp = board[currentCol + 1][currentRow];
        } catch (err) {
          temp = undefined
        }
        break;
      case 2:
        try {
          temp = board[currentCol][currentRow - 1];
        } catch (err) {
          temp = undefined
        }
        break;
      case 3:
        try {
          temp = board[currentCol][currentRow + 1];
        } catch (err) {
          temp = undefined
        }
        break;
    }
    if (!(temp === undefined || stack.includes(temp) || temp.visited)) {
      neighbors.push(temp);
    }
  }
  return neighbors;
}

//Draws an individual tile aling with the necessary walls
function drawTile(tile) {
  tileY = tile.column * tileHeight;
  tileX = tile.row * tileWidth;
  drawTileBasic(tileX, tileY, tile);
  if (tile.column == 0 ||
    !tile.connections.includes(board[tile.column - 1][tile.row])) {
    drawHoriWall(tileX, tileY);
  }
  if (tile.column == columnCount - 1 ||
    !tile.connections.includes(board[tile.column + 1][tile.row])) {
    drawHoriWall(tileX, tileY + tileHeight - cornerHeight);
  }
  if (tile.row == 0 ||
    !tile.connections.includes(board[tile.column][tile.row - 1])) {
    drawVertiWall(tileX, tileY);
  }
  if (tile.row == rowCount - 1 ||
    !tile.connections.includes(board[tile.column][tile.row + 1])) {
    drawVertiWall(tileX + tileWidth - cornerWidth, tileY);
  }
}

//Draws a horizontal wall at the given x, y
function drawHoriWall(x, y) {
  ctx.beginPath();
  ctx.rect(x, y, tileWidth, cornerHeight);
  ctx.fillStyle = wallColor;
  ctx.fill();
  ctx.closePath()
}

//Draws a vertical wall at the given x, y
function drawVertiWall(x, y) {
  ctx.beginPath();
  ctx.rect(x, y, cornerWidth, tileHeight);
  ctx.fillStyle = wallColor;
  ctx.fill();
  ctx.closePath()
}

//Draws a tile before any wall placement
//If the tile is the first, last, or has been visited, has a different color
function drawTileBasic(tileX, tileY, tile) {
  var color = BGColor;
  if (tileY == (columnCount - 1) * tileHeight &&
    tileX == (rowCount - 1) * tileWidth) {
    color = '#c212fc';
  }
  if (tile.userVisited == true) {
    color = '#f5fc12';
  } //else {console.log(tile);}
  ctx.beginPath();
  ctx.rect(tileX, tileY, tileWidth, tileHeight);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
  if (tile == current) {
    drawFace(tileX, tileY);
  }
  drawTileCorner(tileX, tileY);
  drawTileCorner(tileX + tileWidth - cornerWidth, tileY);
  drawTileCorner(tileX, tileY + tileHeight - cornerHeight);
  drawTileCorner(tileX + tileWidth - cornerWidth,
    tileY + tileHeight - cornerHeight);
}

//Draws the cure face onto the current tile
function drawFace(tileX, tileY) {
  var centerX = tileX + tileWidth / 2;
  var centerY = tileY + tileHeight / 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, tileWidth / 6, 0, 2 * Math.PI);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.arc(centerX, centerY, tileWidth / 6, 0, 2 * Math.PI);
  ctx.strokeStyle = '#000000';
  ctx.stroke();
  ctx.closePath();
  ctx.beginPath();
  ctx.arc(centerX + tileWidth / 12, centerY + tileHeight / 12, tileWidth / 12,
    0, 2 * Math.PI);
  ctx.fillStyle = '#000000';
  ctx.fill();
  ctx.arc(centerX, centerY, tileWidth / 4, 0, Math.PI);
  ctx.strokeStyle = '#000000';
  ctx.stroke();
  ctx.closePath();
}

//Draws an individual corner wall for the basic tile
function drawTileCorner(cornerX, cornerY) {
  ctx.beginPath();
  ctx.rect(cornerX, cornerY, cornerWidth, cornerHeight);
  ctx.fillStyle = wallColor;
  ctx.fill();
  ctx.closePath()
}

//Draws the entire board, after clearing the previous iteration
function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  board.forEach(drawRow);
}

//Draws an individual row of the board
function drawRow(row) {
  row.forEach(drawTile);
}

//Draws the game
//Takes in the input boolean values and updates the player's position
//If player is on the end, shows winscreen
function draw() {
  var temp;
  if (rightPressed) {
    makeMove(current.column, current.row + 1);
  } else if (leftPressed) {
    makeMove(current.column, current.row - 1);
  } else if (upPressed) {
    makeMove(current.column - 1, current.row);
  } else if (downPressed) {
    makeMove(current.column + 1, current.row);
  }
  drawBoard();
  if (current == board[columnCount - 1][rowCount - 1]) {
    winScreen();
    return;
  }
}

//Creates the text "YOU WIN!!!" in red in the middle of the canvas"
function winScreen() {
  ctx.font = "50px Arial";
  ctx.fillStyle = "#dd0000";
  ctx.fillText("YOU WIN!!!", canvas.width / 2 - 100, canvas.height / 2);
}

//Takes in a new column and row, checks if the current till could move there,
//then makes the move if possible
//If the move goes back on a previous move, makes the current unvisited and
//makes the previouslt visited tile into the current
function makeMove(column, row) {
  if (column < columnCount && row < rowCount && column >= 0 && row >= 0) {
    temp = board[column][row];
    if (current.connections.includes(temp)) {
      if (temp.userVisited == true) {
        current.userVisited = false
      }
      current = temp;
      current.userVisited = true;
    }
  }
}

//Creates an event listener for user input
document.addEventListener("keydown", keyDownHandler, false);

//When user puts input, goes to here
//Updates the corresponding boolean to represent the direction
//Calls the draw to update screen, the returns boolean to false
function keyDownHandler(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = true;
    draw();
    rightPressed = false;
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = true;
    draw();
    leftPressed = false;
  } else if (e.key == "Up" || e.key == "ArrowUp") {
    upPressed = true;
    draw();
    upPressed = false;
  } else if (e.key == "Down" || e.key == "ArrowDown") {
    downPressed = true;
    draw();
    downPressed = false;
  }
}

//Sets up the board for the solverController
//Connects the button into a solver call
function controller(func, type) {
  current = board[0][0];
  resetTiles(false);
  return recursionController([current], type, func);
}

//Type represents if it is a fill (false) or a solve(true)
//Instantiates either depth first or breadth recursion
//Determines if we have finished yet, if not returns into recursion
function recursionController(list, type, func) {
  var condition = false
  if (type) {
    condition = (current == board[columnCount - 1][rowCount - 1]);
  } else {
    //condition = (list.length == 0);
    condition = isFull();
  }
  func(list, type, condition);
}

function isFull() {
  var anyfalse = board.some((row) => row.some(
    (element) => !element.userVisited))
  return !anyfalse;
}

//Runs either the depth first solver or filler based off the give Type
//Condition represents if we have reached the end

function depthFirst(stack, type, condition) {
  current.userVisited = true;
  current.visited = true;
  draw();
  if (condition) {
    return;
  }
  var temp = current.connections.find(element => !element.visited);
  if (temp === undefined) {
    if (type) {
      current.userVisited = false;
    }
    stack.pop();
    current = stack[stack.length - 1];
  } else {
    current = temp;
    stack.push(temp);
  }
  requestAnimationFrame(() => {
    recursionController(stack, type, depthFirst);
  });
}

//Runs either the breadth first solver or filler based off Type
//Condition represents if we have reached the end
function breadthFirst(queue, type, condition) {
  if (condition) {
    if (type) {
      var facePos = current;
      simplifyBoard([current]);
      current = facePos;
      draw();
    }
    return;
  }
  current = queue[0];
  current.userVisited = true;
  if (type) {
    visits.push(current);
  }
  draw();
  current.connections.forEach((connection) => {
    if (connection.userVisited == false) {
      queue.push(connection);
    }
  });
  queue.shift();
  requestAnimationFrame(() => {
    recursionController(queue, type, breadthFirst);
  })
}

//Cuts off all of the excess branches from the breadth first solution
function simplifyBoard(solution) {
  if (solution[solution.length - 1] == board[0][0]) {
    for (var c = 0; c < columnCount; c++) {
      for (var r = 0; r < rowCount; r++) {
        if (!solution.includes(board[c][r])) {
          board[c][r].userVisited = false;
        }
      }
    }
  } else {
    var temp = visits.find(element => current.connections.includes(element));
    solution.push(temp);
    current = temp;
    simplifyBoard(solution)
  }

}


//Resets all of the visited properties of all the tiles to false,
//If resetConnects is true. we also reset all the connections
function resetTiles(resetConnects) {
  if (resetConnects) {
    board.forEach((row) => {
      row.forEach((tile) => {
        tile.visited = false;
        tile.userVisited = false;
        tile.connections = [];
      });
    });
  } else {
    board.forEach((row) => {
      row.forEach((tile) => {
        tile.visited = false;
        tile.userVisited = false;
      });
    });
  }
  board[0][0].userVisited = true;
}

//Reset button goes through this function
//Resets the progress of the player by resetting all of the boolean values a
//nd redrawing
function reset() {
  current = board[0][0]
  resetTiles(false);
  draw();
}

//Clears all the values from the tiles, resets the current to the first tile
//Then generates a new board and draws it
function instantiate() {
  instantiateVars();
  generateBoard();
  current = board[0][0];
  resetTiles(true);
  generatePath([board[0][0]]);
  draw();
}

//Instantiates the dimenions of the tiles, walls and board based off user input
function instantiateVars() {
  var inRow = Number(document.getElementById('widthField').value);
  if (!(isNaN(inRow) || inRow == 0)) {
    rowCount = inRow;
  } else {
    rowCount = 15;
  }
  var inCol = Number(document.getElementById('heightField').value);
  if (!(isNaN(inCol) || inCol == 0)) {
    columnCount = inCol;
  } else {
    columnCount = 10;
  }

  document.getElementById('htmlWidth').innerHTML = 'Width, currently ' +
    rowCount + ' tiles';
  document.getElementById('htmlHeight').innerHTML = 'Height, currenly ' +
    columnCount + ' tiles';

  tileWidth = (canvas.width / rowCount);
  tileHeight = canvas.height / columnCount;

  cornerHeight = Math.floor(tileHeight / 5);
  cornerWidth = Math.floor(tileWidth / 5);
}

//Program call:
instantiate();
