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
const TEAMSWAP = 7;

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
let firstPiece = -1;
let firstClickCoord = [];
let valid = false;
let turn = WHITE;
let turnCounter = 0;
let counter = 1;
let flag = true;

let whiteDeath = [];
let blackDeath = [];

let whitePieces = [0,0,0,0,0,0,0,0,1,1,2,2,3,3,4];
let blackPieces = [0,0,0,0,0,0,0,0,1,1,2,2,3,3,4];

document.addEventListener("DOMContentLoaded", onLoad);

function onLoad() {
    chessCanvas = document.getElementById("chessCanvas");
    chessCtx = chessCanvas.getContext("2d");
    chessCanvas.addEventListener("click", boardClick);
    board = new Board;
    drawBoard();
    drawPieces();
    document.getElementById("restart").onclick=restartGame;
    document.getElementById("swapcounter").innerHTML = "Impending Doom in: " + (TEAMSWAP-1);
}

function boardClick(event){
  //this function is for when a board element is clicked
  let chessCanvasX = chessCanvas.getBoundingClientRect().left; //get left board value
  let chessCanvasY = chessCanvas.getBoundingClientRect().top; // get upper board value

  //get mouseclick and convert to x,y coord on board
  let x = Math.floor((event.clientX-chessCanvasX)/TILE_SIZE);
  let y = Math.floor((event.clientY-chessCanvasY)/TILE_SIZE);

  let square = board.tiles[y][x];
  //first click must be a chess piece
  if (square.filled && firstClick == true && square.color == turn){
    console.log("first click"); // TODO: get rid of this later
    console.log(x,y);
    firstClickCoord = [x,y];
    firstClick = false;
    firstPiece = square;
    return null;
  }
  //second click can be whatever, we check for legal move here
  else if (firstClick == false){
      firstClick = true;
      let oldX = firstClickCoord[0];
      let oldY = firstClickCoord[1];
      console.log("second click"); // TODO: get rid of this later
      console.log(x,y);
      if(checkMoves(firstPiece,square,oldX,oldY,x,y)){
        board.tiles[y][x] = firstPiece;
        board.tiles[oldY][oldX] = new Tile(EMPTY,EMPTY,false);

        if (turn == WHITE){
          turn = BLACK;
          turnCounter += 1;
          document.getElementById("currentteam").innerHTML = "Current Turn: BLACK"
        }
        else{
          turn = WHITE;
          document.getElementById("currentteam").innerHTML = "Current Turn: WHITE"
          counter += 1;
        }
        if (square.piece == 5){
          console.log('checkmate!');
          // TODO: add this functionality
          //restartGame();
        }

        updatePieceList(square,whitePieces,whiteDeath,blackPieces,blackDeath);

        if (counter%TEAMSWAP == 0){
          changePieces(whitePieces,whiteDeath,blackPieces,blackDeath,board);
          counter = 1;
        }
        document.getElementById("turncounter").innerHTML = "Turn: " + turnCounter;
        document.getElementById("swapcounter").innerHTML = "Impending Doom in: " + (TEAMSWAP - counter);
        drawBoard();
        drawPieces();
      }
      else{
        console.log('not a valid move');
      }
    }

}

function checkMoves(firstpiece, secondpiece, oldx, oldy, newx, newy){
  switch(firstpiece.piece){
    case 0:
      //check pawn moves
      return checkPawnMoves(firstpiece,secondpiece,oldx,oldy,newx,newy);
      break;
    case 1:
      //check knight moves
      return checkKnightMoves(firstpiece,secondpiece,oldx,oldy,newx,newy);
      break;
    case 2:
      //check bishop moves
      return checkBishopMoves(firstpiece,secondpiece,oldx,oldy,newx,newy);
      break;
    case 3:
      //check rook moves
      return checkRookMoves(firstpiece,secondpiece,oldx,oldy,newx,newy);
      break;
    case 4:
      //check queen moves
      return checkQueenMoves(firstpiece,secondpiece,oldx,oldy,newx,newy);
     break;
    case 5:
      //check king moves
      return checkKingMoves(firstpiece,secondpiece,oldx,oldy,newx,newy);
      break;
    default:

  }

}

function checkPawnMoves(piece, secondpiece, oldx, oldy, newx, newy){
  //capturing
  if (secondpiece.filled){
    if (piece.color == WHITE && secondpiece.color == BLACK){
      if (newx == oldx-1 || newx == oldx+1){
        if (oldy-newy == 1){
          return true;
        }
        else{
          return false;
        }
      }
    }
    else if (piece.color == BLACK && secondpiece.color == WHITE){
      if (newx == oldx-1 || newx == oldx+1){
        if (newy-oldy == 1){
          return true;
        }
        else{
          return false;
        }
      }
    }
  }

  //pawns can only move up if not capturing
  if (newx != oldx){
    return false;
  }
  //if a piece is directly in front
  if (secondpiece.filled){
    console.log('something is in front'); // TODO: get rid of later
    return false;
  }
  //if starting move, can move 2 steps
  if (piece.color == WHITE){

    if (oldy == 6){
      if (newy == 5 || newy == 4){
        return true;
      }
    }
    else{
      if (oldy-newy == 1){
        return true;
      }
      else{
        return false;
      }
    }
  }
  else{
    if (oldy == 1){
      if (newy == 2 || newy == 3){
        return true;
      }
    }
    else{
      if (newy - oldy == 1){
        return true;
      }
      else{
        return false;
      }
    }
  }

}

function checkKnightMoves(piece, secondpiece, oldx, oldy, newx, newy){
  if (piece.color == secondpiece.color){
    return false;
  }

  if ((newx >= 0 || newx <= 7) && (newy >= 0 || newy <= 7)){
    if ((Math.abs(newx-oldx) == 2) && (Math.abs(newy-oldy) == 1)){
      return true;
    }
    else if ((Math.abs(newy-oldy) == 2) && (Math.abs(newx-oldx) == 1)){
      return true;
    }
    else{
      return false;
    }
  }
}

function checkBishopMoves(piece, secondpiece, oldx, oldy, newx, newy){
  if (piece.color == secondpiece.color){
    return false;
  }
  if ((Math.abs(newx-oldx) == Math.abs(newy-oldy))){
    //direction left down
    if (oldx - newx > 0){
      if (oldy - newy < 0){
        for (let i = 1; i<=Math.abs(newx-oldx); i++){
          if (board.tiles[oldy + i][oldx - i].filled && i != Math.abs(newx-oldx)){
            return false;
            // if (board.tiles[oldy + i][oldx - i].color == piece.color){
            //   return false;
            // }
          }
        }
      }
      //direction left up
      else{
        for (let i = 1; i<=Math.abs(newx-oldx); i++){
          if (board.tiles[oldy - i][oldx - i].filled && i != Math.abs(newx-oldx)){
            return false;
            // if (board.tiles[oldy - i][oldx - i].color == piece.color){
            //   return false;
            // }
          }
        }
      }
    }
    //direction right down
    else{
      if (oldy - newy < 0){
        for (let i = 1; i<=Math.abs(newx-oldx); i++){
          if (board.tiles[oldy + i][oldx + i].filled && i != Math.abs(newx-oldx)){
            return false;
            // if (board.tiles[oldy + i][oldx + i].color == piece.color){
            //   return false;
            // }
          }
        }
      }
      //direction right up
      else{
        for (let i = 1; i<=Math.abs(newx-oldx); i++){
          if (board.tiles[oldy - i][oldx + i].filled && i != Math.abs(newx-oldx)){
            return false;
            // if (board.tiles[oldy - i][oldx + i].color == piece.color){
            //   return false;
            // }
          }
        }
      }
    }
    return true;
  }
  else{
    return false;
  }
}

function checkRookMoves(piece, secondpiece, oldx, oldy, newx, newy){
  if (piece.color == secondpiece.color){
    return false;
  }
  //horizontal movement
  if (oldy == newy){
    let h = oldx - newx;
    //go left
    if (h > 0){
      for (let i = 1; i <= Math.abs(h); i++){
        if (board.tiles[oldy][oldx - i].filled && i != Math.abs(h)){ // TODO: finish this
          return false;
        }
      }
    }
    //go right
    else{
      for (let i = 1; i <= Math.abs(h); i++){
        if (board.tiles[oldy][oldx + i].filled && i != Math.abs(h)){ // TODO: finish this
          return false;
        }
      }
    }
    return true;
  }
  //vertical movement
  else{
    let v = oldy - newy;
    //go up
    if (v > 0){
      for (let i = 1; i <= Math.abs(v); i++){
        if (board.tiles[oldy-i][oldx].filled && i != Math.abs(v)){ // TODO: finish this
          return false;
        }
      }
    }
    //go down
    else{
      for (let i = 1; i <= Math.abs(v); i++){
        if (board.tiles[oldy+i][oldx].filled && i != Math.abs(v)){ // TODO: finish this
          return false;
        }
      }
    }
    return true;
  }
}

function checkQueenMoves(piece, secondpiece, oldx, oldy, newx, newy){
  if (piece.color == secondpiece.color){
    return false;
  }
  //horizontal movement
  if (oldy == newy){
    let h = oldx - newx;
    //go left
    if (h > 0){
      for (let i = 1; i <= Math.abs(h); i++){
        if (board.tiles[oldy][oldx - i].filled && i != Math.abs(h)){ // TODO: finish this
          return false;
        }
      }
    }
    //go right
    else{
      for (let i = 1; i <= Math.abs(h); i++){
        if (board.tiles[oldy][oldx + i].filled && i != Math.abs(h)){ // TODO: finish this
          return false;
        }
      }
    }
    return true;
  }
  //vertical movement
  else if (oldx == newx){
    let v = oldy - newy;
    //go up
    if (v > 0){
      for (let i = 1; i <= Math.abs(v); i++){
        if (board.tiles[oldy-i][oldx].filled && i != Math.abs(v)){ // TODO: finish this
          return false;
        }
      }
    }
    //go down
    else{
      for (let i = 1; i <= Math.abs(v); i++){
        if (board.tiles[oldy+i][oldx].filled && i != Math.abs(v)){ // TODO: finish this
          return false;
        }
      }
    }
    return true;
  }
  //diagonal
  else if ((Math.abs(newx-oldx) == Math.abs(newy-oldy))){
    //direction left down
    if (oldx - newx > 0){
      if (oldy - newy < 0){
        for (let i = 1; i<=Math.abs(newx-oldx); i++){
          if (board.tiles[oldy + i][oldx - i].filled && i != Math.abs(newx-oldx)){
            return false;
            // if (board.tiles[oldy + i][oldx - i].color == piece.color){
            //   return false;
            // }
          }
        }
      }
      //direction left up
      else{
        for (let i = 1; i<=Math.abs(newx-oldx); i++){
          if (board.tiles[oldy - i][oldx - i].filled && i != Math.abs(newx-oldx)){
            return false;
          }
        }
      }
    }
    //direction right down
    else{
      if (oldy - newy < 0){
        for (let i = 1; i<=Math.abs(newx-oldx); i++){
          if (board.tiles[oldy + i][oldx + i].filled && i != Math.abs(newx-oldx)){
            return false;
          }
        }
      }
      //direction right up
      else{
        for (let i = 1; i<=Math.abs(newx-oldx); i++){
          if (board.tiles[oldy - i][oldx + i].filled && i != Math.abs(newx-oldx)){
            return false;
          }
        }
      }
    }
    return true;
  }
  else{
    return false;
  }
}

function checkKingMoves(piece, secondpiece, oldx, oldy, newx, newy){
  if (piece.color == secondpiece.color){
    return false;
  }
  x = Math.abs(oldx-newx);
  y = Math.abs(oldy-newy);
  if (x > 1 || y > 1){
    return false
  }
  else{
    return true;
  }
}

function restartGame(){
  board = new Board;
  drawBoard();
  drawPieces();
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

function updatePieceList(p, wp, wd, bp, bd){
  /*
  This function updates white/blackpieces and white/blackdeath
  Var:
    p: (class Tile) chess piece that is being eaten
    wp: whitePieces
    wd: whiteDeath
    bp:blackPieces
    bd:blackDeath
  Returns:
    wp,bp,wd,bd inplace
  */
  if (p.color == WHITE){
    wd.push(p.piece);
    wp.splice(wp.indexOf(p.piece),1);
  }
  else if (p.color == BLACK){
    bd.push(p.piece);
    bp.splice(bp.indexOf(p.piece),1);
  }
  //return [wp,wd,bp,bd];
}

function changePieces(wp, wd, bp, bd, b){
  /*
  This function changes 1 piece's color from each team randomly.
  Var:
    wp,wd,bd,bp: same as updatePieceList
    b: (class Board)
  */
  let wmax = wp.length - 1;
  let bmax = bp.length - 1;

  //choose random element in array between 0 and wmax inclusive
  let wnum = Math.floor(Math.random() * (wmax + 1));
  let bnum = Math.floor(Math.random() * (bmax + 1));
  let wval = wp[wnum];
  let bval = bp[bnum];

  wp.splice(wnum,1);
  bp.splice(bnum,1);

  wp.push(bval);
  bp.push(wval);

  wd.push(wval);
  bd.push(bval);

  let wcounter = 0;
  let bcounter = 0;

  for (let i = 0; i < BOARD_HEIGHT; i++) {
    for (let j = 0; j < BOARD_WIDTH; j++) {
      if (b.tiles[i][j].color == BLACK && b.tiles[i][j].piece == bval && wcounter == 0){
        b.tiles[i][j].color = WHITE;
        wcounter = 1;
      }
      else if (b.tiles[i][j].color == WHITE && b.tiles[i][j].piece == wval && bcounter == 0){
        b.tiles[i][j].color = BLACK;
        bcounter = 1;
      }
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
