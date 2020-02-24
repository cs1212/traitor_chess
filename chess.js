const BOARD_WIDTH = 8;
const BOARD_HEIGHT = 8;
const TILE_SIZE = 50;
const WHITE_TILE_COLOR = "rgb(255, 228, 196)";
const BLACK_TILE_COLOR = "rgb(206, 162, 128)";
const HIGHLIGHT_COLOR = "rgb(75, 175, 75)";
const WHITE = 0;
const BLACK = 1;

//assign piece #s to tiles
const EMPTY = -1;
const PAWN = 0;
const KNIGHT = 1;
const BISHOP = 2;
const ROOK = 3;
const QUEEN = 4;
const KING = 5;

//dictionary of pieces
const piecesCharacters = {
    0: '♙',
    1: '♘',
    2: '♗',
    3: '♖',
    4: '♕',
    5: '♔'
};

let chessCanvas;
let chessCtx;
let firstClick = true;
let firstClickCoord = [];

document.addEventListener("DOMContentLoaded", onLoad);

function onLoad() {
    chessCanvas = document.getElementById("chessCanvas");
    chessCtx = chessCanvas.getContext("2d");
    chessCanvas.addEventListener("click", boardClick);
    board = new Board;
    drawBoard();
    drawPieces();
}

function boardClick(event){
  //this function is for when a board element is clicked
  let chessCanvasX = chessCanvas.getBoundingClientRect().left; //get left board value
  let chessCanvasY = chessCanvas.getBoundingClientRect().top; // get upper board value

  //get mouseclick and convert to x,y coord on board
  let x = Math.floor((event.clientX-chessCanvasX)/TILE_SIZE);
  let y = Math.floor((event.clientY-chessCanvasY)/TILE_SIZE);

  let square = board.tiles[y][x];
  if (square.filled){
    if (firstClick == true){
      firstClickCoord = [x,y];
      firstClick = false;
      return null;
    } else{
      firstClick = true;
      let oldX = firstClickCoord[0];
      let oldY = firstClickCoord[1];
      switch(square.piece){
        case 0:
          //check pawn moves

          break;
        case 1:
          //check knight moves

          break;
        case 2:
          //check bishop moves

          break;
        case 3:
          //check rook moves

          break;
        case 4:
          //check queen moves

         break;
        case 5:
          //check king moves

          break;
        default:

      }
    }
  }

}

function checkPawnMoves(x,y){
  //starting move, can move 2 steps
  if (y == 1 || y == 6){

  }

}

function drawBoard() {
    chessCtx.fillStyle = WHITE_TILE_COLOR;
    chessCtx.fillRect(0, 0, BOARD_WIDTH*TILE_SIZE, BOARD_HEIGHT*TILE_SIZE);

    for (let i = 0; i < BOARD_HEIGHT; i++) {
        for (let j = 0; j < BOARD_WIDTH; j++) {
            if ((i+j)%2 === 1) {
                drawTile(j, i, BLACK_TILE_COLOR);
            }
        }
    }
}

function drawTile(x, y, fillStyle) {
    chessCtx.fillStyle = fillStyle;
    chessCtx.fillRect(TILE_SIZE*x, TILE_SIZE*y, TILE_SIZE, TILE_SIZE);
}

function drawPieces() {
    for (let i = 0; i < BOARD_HEIGHT; i++) {
        for (let j = 0; j < BOARD_WIDTH; j++) {
            if (board.tiles[i][j].color == EMPTY){
              continue;
            }

            if (board.tiles[i][j].color == WHITE) {
                chessCtx.fillStyle = "#FF0000";
            } else {
                chessCtx.fillStyle = "#0000FF";
            }

            chessCtx.font = "38px Arial";
            let pieceType = board.tiles[i][j].piece;
            chessCtx.fillText(piecesCharacters[pieceType], TILE_SIZE*(j+1/8), TILE_SIZE*(i+4/5));
        }
    }
}

class Board {
    constructor() {
        this.tiles = [];

        this.tiles.push([
            new Tile(ROOK, BLACK, true),
            new Tile(KNIGHT, BLACK, true),
            new Tile(BISHOP, BLACK, true),
            new Tile(QUEEN, BLACK, true),
            new Tile(KING, BLACK, true),
            new Tile(BISHOP, BLACK, true),
            new Tile(KNIGHT, BLACK, true),
            new Tile(ROOK, BLACK, true)
        ]);

        this.tiles.push([
            new Tile(PAWN, BLACK, true),
            new Tile(PAWN, BLACK, true),
            new Tile(PAWN, BLACK, true),
            new Tile(PAWN, BLACK, true),
            new Tile(PAWN, BLACK, true),
            new Tile(PAWN, BLACK, true),
            new Tile(PAWN, BLACK, true),
            new Tile(PAWN, BLACK, true)
        ]);

        for (let i = 0; i < 4; i++) {
            this.tiles.push([
                new Tile(EMPTY, EMPTY, false),
                new Tile(EMPTY, EMPTY, false),
                new Tile(EMPTY, EMPTY, false),
                new Tile(EMPTY, EMPTY, false),
                new Tile(EMPTY, EMPTY, false),
                new Tile(EMPTY, EMPTY, false),
                new Tile(EMPTY, EMPTY, false),
                new Tile(EMPTY, EMPTY, false),
            ]);
        }

        this.tiles.push([
            new Tile(PAWN, WHITE, true),
            new Tile(PAWN, WHITE, true),
            new Tile(PAWN, WHITE, true),
            new Tile(PAWN, WHITE, true),
            new Tile(PAWN, WHITE, true),
            new Tile(PAWN, WHITE, true),
            new Tile(PAWN, WHITE, true),
            new Tile(PAWN, WHITE, true)
        ]);

        this.tiles.push([
            new Tile(ROOK, WHITE, true),
            new Tile(KNIGHT, WHITE, true),
            new Tile(BISHOP, WHITE, true),
            new Tile(QUEEN, WHITE, true),
            new Tile(KING, WHITE, true),
            new Tile(BISHOP, WHITE, true),
            new Tile(KNIGHT, WHITE, true),
            new Tile(ROOK, WHITE, true)
        ]);
    }
}

class Tile{
  constructor(chessPiece,pieceColor,hasPiece){
    this.piece = chessPiece;
    this.color = pieceColor;
    this.filled = hasPiece; //true or false value. Whether or not the tile has a piece on it

  }
}
