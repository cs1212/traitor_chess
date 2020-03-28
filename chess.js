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
const MAX = 18;
const MIN = 14;
//dictionary of pieces
const piecesCharacters = {
    0: '♙',
    1: '♘',
    2: '♗',
    3: '♖',
    4: '♕',
    5: '♔'
};

let teamSwap = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
let chessCanvas;
let chessCtx;
let firstClick = true;
let firstPiece = -1;
let firstClickCoord = [];
let valid = false;
let turn = WHITE;
let turnCounter = 0;
let counter = 1;
let flag = false;

//var deepclone = require('lodash');
//console.log(_.cloneDeep);
let prevBoard = [];
let whiteDeath = [];
let blackDeath = [];

let whitePieces = [0,0,0,0,0,0,0,0,1,1,2,2,3,3,4];
let blackPieces = [0,0,0,0,0,0,0,0,1,1,2,2,3,3,4];

document.addEventListener("DOMContentLoaded", onLoad);

function onLoad() {
  chessCanvas = document.getElementById("chessCanvas");
  chessCtx = chessCanvas.getContext("2d");
  chessCanvas.addEventListener("click", boardClick);
  //document.getElementById("back").addEventListener("click",goBack);
  board = new Board;
  drawBoard();
  drawPieces();
  document.getElementById("restart").onclick=restartGame;
  //document.getElementById("swapcounter").innerHTML = "Impending Doom in: " + (TEAMSWAP-1);// TODO:original traitor counter
  document.getElementById("swapcounter").innerHTML = "Impending Doom in: " + (teamSwap-1);
  document.getElementById("knightbutton").onclick=knightSwap;
  document.getElementById("bishopbutton").onclick=bishopSwap;
  document.getElementById("rookbutton").onclick=rookSwap;
  document.getElementById("queenbutton").onclick=queenSwap;
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
    console.log("first click");
    //console.log(x,y);
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
      console.log("second click");
      //console.log(x,y);
      if(checkMoves(firstPiece,square,oldX,oldY,x,y,board)){
        if (turn == WHITE){
          turn = BLACK;
          turnCounter += 1;
          document.getElementById("currentteam").innerHTML = "Current Turn: BLACK"
        }
        else{
          turn = WHITE;
          document.getElementById("currentteam").innerHTML = "Current Turn: WHITE"
          //counter += 1; original traitor counter
        }
        counter += 1;
        let cloneboard = _.cloneDeep(board);
        prevBoard.push([cloneboard,turn,turnCounter,counter,whitePieces,blackPieces,teamSwap]);
        //console.log(prevBoard);
        board.tiles[y][x] = firstPiece;
        board.tiles[oldY][oldX] = new Tile(EMPTY,EMPTY,false);
        if (square.piece == 5){
          console.log('King Dead')
          let winner;
          if (turn == WHITE){
            winner = "BLACK";
          }
          else{
            winner = "WHITE";
          }
          document.getElementById("currentteam").innerHTML = "Winner: " + winner;
          drawBoard();
          drawPieces();
          return null;
        }

        updatePieceList(square,whitePieces,whiteDeath,blackPieces,blackDeath);

        if ((teamSwap - counter) <= 0){
        //if (counter%teamSwap == 0){//TEAMSWAP
          changePieces(whitePieces,whiteDeath,blackPieces,blackDeath,board);
          counter = 1;
          teamSwap = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;//added this to original traitor counter
        }
        document.getElementById("turncounter").innerHTML = "Turn: " + turnCounter;
        //document.getElementById("swapcounter").innerHTML = "Impending Doom in: " + (TEAMSWAP - counter); //original traitor counter
        document.getElementById("swapcounter").innerHTML = "Impending Doom in: " + (teamSwap - counter);
        drawBoard();
        drawPieces();
      }
      else{
        console.log('not a valid move');
      }
    }

}

function checkMoves(firstpiece, secondpiece, oldx, oldy, newx, newy, b){
  /*
  Var:
    b: (class Board) used for is_check()
  */
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
      //return checkKingMoves(firstpiece,secondpiece,oldx,oldy,newx,newy);
      if (checkKingMoves(firstpiece,secondpiece,oldx,oldy,newx,newy)){
        let m = is_check(b, firstpiece, newx, newy);
        for (let a=0; a<m.length; a++){
          if (newy == m[a][0] && newx == m[a][1]){
            return false;
          }
        }
        return true;
      }
      else{
        return false;
      }
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
        if (board.tiles[oldy][oldx - i].filled && i != Math.abs(h)){
          return false;
        }
      }
    }
    //go right
    else{
      for (let i = 1; i <= Math.abs(h); i++){
        if (board.tiles[oldy][oldx + i].filled && i != Math.abs(h)){
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
        if (board.tiles[oldy-i][oldx].filled && i != Math.abs(v)){
          return false;
        }
      }
    }
    //go down
    else{
      for (let i = 1; i <= Math.abs(v); i++){
        if (board.tiles[oldy+i][oldx].filled && i != Math.abs(v)){
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
        if (board.tiles[oldy][oldx - i].filled && i != Math.abs(h)){
          return false;
        }
      }
    }
    //go right
    else{
      for (let i = 1; i <= Math.abs(h); i++){
        if (board.tiles[oldy][oldx + i].filled && i != Math.abs(h)){
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
        if (board.tiles[oldy-i][oldx].filled && i != Math.abs(v)){
          return false;
        }
      }
    }
    //go down
    else{
      for (let i = 1; i <= Math.abs(v); i++){
        if (board.tiles[oldy+i][oldx].filled && i != Math.abs(v)){
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
    return false;
  }
  else{
    return true;
  }
}

function is_check(b, firstpiece, newx, newy){
  /*
  This function checks if the king is checked.
  */
  let moves = [];
  let c = firstpiece.color;
  for (let i=0; i<8; i++){
    for (let j=0; j<8; j++){
      if (b.tiles[i][j].color != c){
        let tempi;
        let tempj;
        switch(b.tiles[i][j].piece){
          case 0:
            if (c == WHITE){
              moves.push([i+1,j-1],[i+1,j+1]);
            }
            else{
              moves.push([i-1,j-1],[i-1,j+1]);
            }
            break;
          case 1:
            moves.push([i-1,j-2],[i-1,j+2],[i+1,j-2],[i+1,j-2]);
            break;
          case 2:
            tempi = i+1;
            tempj = j+1;
            while(tempi < 8 && tempj < 8 && b.tiles[tempi][tempj].piece == EMPTY){
              moves.push([tempi,tempj]);
              tempi += 1;
              tempj += 1;
            }
            tempi = i+1;
            tempj = j-1;
            while(tempi < 8 && tempj >= 0 && b.tiles[tempi][tempj].piece == EMPTY){
              moves.push([tempi,tempj]);
              tempi += 1;
              tempj -= 1;
            }
            tempi = i-1;
            tempj = j+1;
            while(tempi >= 0 && tempj < 8 && b.tiles[tempi][tempj].piece == EMPTY){
              moves.push([tempi,tempj]);
              tempi -= 1;
              tempj += 1;
            }
            tempi = i-1;
            tempj = j-1;
            while(tempi >= 0 && tempj >= 0 && b.tiles[tempi][tempj].piece == EMPTY){
              moves.push([tempi,tempj]);
              tempi -= 1;
              tempj -= 1;
            }
            break;
          case 3:
            tempi = i+1;
            while(tempi < 8 && b.tiles[tempi][j].piece == EMPTY){
              moves.push([tempi,j]);
              tempi += 1;
            }
            tempi = i-1;
            while(tempi >= 0 && b.tiles[tempi][j].piece == EMPTY){
              moves.push([tempi,j]);
              tempi += 1;
            }
            tempj = j+1;
            while(tempj < 8 && b.tiles[i][tempj].piece == EMPTY){
              moves.push([i,tempj]);
              tempj += 1;
            }
            tempj = j-1;
            while(tempj >= 0 && b.tiles[i][tempj].piece == EMPTY){
              moves.push([i,tempj]);
              tempj -= 1;
            }
            break;
          case 4:
            tempi = i+1;
            while(tempi < 8 && b.tiles[tempi][j].piece == EMPTY){
              moves.push([tempi,j]);
              tempi += 1;
            }
            tempi = i-1;
            while(tempi >= 0 && b.tiles[tempi][j].piece == EMPTY){
              moves.push([tempi,j]);
              tempi += 1;
            }
            tempj = j+1;
            while(tempj < 8 && b.tiles[i][tempj].piece == EMPTY){
              moves.push([i,tempj]);
              tempj += 1;
            }
            tempj = j-1;
            while(tempj >= 0 && b.tiles[i][tempj].piece == EMPTY){
              moves.push([i,tempj]);
              tempj -= 1;
            }
            tempi = i+1;
            tempj = j+1;
            while(tempi < 8 && tempj < 8 && b.tiles[tempi][tempj].piece == EMPTY){
              moves.push([tempi,tempj]);
              tempi += 1;
              tempj += 1;
            }
            tempi = i+1;
            tempj = j-1;
            while(tempi < 8 && tempj >= 0 && b.tiles[tempi][tempj].piece == EMPTY){
              moves.push([tempi,tempj]);
              tempi += 1;
              tempj -= 1;
            }
            tempi = i-1;
            tempj = j+1;
            while(tempi >= 0 && tempj < 8 && b.tiles[tempi][tempj].piece == EMPTY){
              moves.push([tempi,tempj]);
              tempi -= 1;
              tempj += 1;
            }
            tempi = i-1;
            tempj = j-1;
            while(tempi >= 0 && tempj >= 0 && b.tiles[tempi][tempj].piece == EMPTY){
              moves.push([tempi,tempj]);
              tempi -= 1;
              tempj -= 1;
            }
            break;
          case 5:
            moves.push([i-1,j-1],[i-1,j],[i-1,j+1],[i,j+1],[i,j-1],[i+1,j+1],[i+1,j],[i+1,j-1]);
            break;
        }
      }
    }
  }
  return moves;
}

function restartGame(){
  board = new Board;
  turnCounter = 0;
  firstClick = true;
  firstPiece = -1;
  firstClickCoord = [];
  prevBoard = [];
  valid = false;
  turn = WHITE;
  turnCounter = 0;
  counter = 1;
  flag = false;
  restart = false;
  teamSwap = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
  drawBoard();
  drawPieces();
  document.getElementById("turncounter").innerHTML = "Turn: 1";
  document.getElementById("swapcounter").innerHTML = "Impending Doom in: " + (teamSwap-1);
  document.getElementById("currentteam").innerHTML = "Current Turn: WHITE";
}

function drawBoard(){
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

function drawTile(x, y, fillStyle){
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
  let wmax = wp.length;//-1
  let bmax = bp.length;//-1

  //choose random element in array between 0 and wmax exclusive
  let wnum = Math.floor(Math.random() * wmax);//wmax+1
  let bnum = Math.floor(Math.random() * bmax);//bmax+1
  let wval = wp[wnum];
  let bval = bp[bnum];

  wp.splice(wnum,1);
  bp.splice(bnum,1);

  wp.push(bval);
  bp.push(wval);

  wd.push(wval);
  bd.push(bval);

  // let wcounter = 0;
  // let bcounter = 0;

  let tempWhitePiece = [];
  let tempBlackPiece = [];
  for (let i = 0; i < BOARD_HEIGHT; i++) {
    for (let j = 0; j < BOARD_WIDTH; j++) {
      if (b.tiles[i][j].color == BLACK && b.tiles[i][j].piece == bval){
        tempWhitePiece.push([i,j]);
      }
      else if (b.tiles[i][j].color == WHITE && b.tiles[i][j].piece == wval){
        tempBlackPiece.push([i,j]);
      }
    }
  }
  wnum = Math.floor(Math.random() * (tempWhitePiece.length));
  bnum = Math.floor(Math.random() * (tempBlackPiece.length));
  let a = tempWhitePiece[wnum];
  b.tiles[a[0]][a[1]].color = WHITE;
  a = tempBlackPiece[bnum];
  b.tiles[a[0]][a[1]].color = BLACK;

  // for (let i = 0; i < BOARD_HEIGHT; i++) {
  //   for (let j = 0; j < BOARD_WIDTH; j++) {
  //     if (b.tiles[i][j].color == BLACK && b.tiles[i][j].piece == bval && wcounter == 0){
  //       b.tiles[i][j].color = WHITE;
  //       wcounter = 1;
  //     }
  //     else if (b.tiles[i][j].color == WHITE && b.tiles[i][j].piece == wval && bcounter == 0){
  //       b.tiles[i][j].color = BLACK;
  //       bcounter = 1;
  //     }
  //   }
  // }
}

function knightSwap(){
  for (let i = 0; i < BOARD_HEIGHT; i++) {
    for (let j = 0; j < BOARD_WIDTH; j++) {
      if (((i == 0 && board.tiles[i][j].color == WHITE)||(i == 7 && board.tiles[i][j].color == BLACK)) && board.tiles[i][j].piece == 0){
        board.tiles[i][j].piece = 1;
        drawBoard();
        drawPieces();
        if (i == 0){
          blackPieces.splice(blackPieces.indexOf(0),1);
          blackPieces.push(1)
        }
        else{
          whitePieces.splice(whitePieces.indexOf(0),1);
          whitePieces.push(1);
        }
      }
    }
  }
}

function bishopSwap(){
  for (let i = 0; i < BOARD_HEIGHT; i++) {
    for (let j = 0; j < BOARD_WIDTH; j++) {
      if (((i == 0 && board.tiles[i][j].color == WHITE)||(i == 7 && board.tiles[i][j].color == BLACK)) && board.tiles[i][j].piece == 0){
        board.tiles[i][j].piece = 2;
        drawBoard();
        drawPieces();
        if (i == 0){
          blackPieces.splice(blackPieces.indexOf(0),1);
          blackPieces.push(2)
        }
        else{
          whitePieces.splice(whitePieces.indexOf(0),1);
          whitePieces.push(2);
        }
      }
    }
  }
}

function rookSwap(){
  for (let i = 0; i < BOARD_HEIGHT; i++) {
    for (let j = 0; j < BOARD_WIDTH; j++) {
      if (((i == 0 && board.tiles[i][j].color == WHITE)||(i == 7 && board.tiles[i][j].color == BLACK)) && board.tiles[i][j].piece == 0){
        board.tiles[i][j].piece = 3;
        drawBoard();
        drawPieces();
        if (i == 0){
          blackPieces.splice(blackPieces.indexOf(0),1);
          blackPieces.push(3)
        }
        else{
          whitePieces.splice(whitePieces.indexOf(0),1);
          whitePieces.push(3);
        }
      }
    }
  }
}

function queenSwap(){
  for (let i = 0; i < BOARD_HEIGHT; i++) {
    for (let j = 0; j < BOARD_WIDTH; j++) {
      if (((i == 0 && board.tiles[i][j].color == WHITE)||(i == 7 && board.tiles[i][j].color == BLACK)) && board.tiles[i][j].piece == 0){
        board.tiles[i][j].piece = 4;
        drawBoard();
        drawPieces();
        if (i == 0){
          blackPieces.splice(blackPieces.indexOf(0),1);
          blackPieces.push(4)
        }
        else{
          whitePieces.splice(whitePieces.indexOf(0),1);
          whitePieces.push(4);
        }
      }
    }
  }
}

function goBack(){
  /*
  This function is for the 'back' button
  */
  if (prevBoard.length > 0){
    let a = prevBoard.pop();
    firstClick = true;
    board = a[0];
    turn = a[1];
    turnCounter = a[2];
    counter = a[3];
    whitePieces = a[4];
    blackPieces = a[5];
    teamSwap = a[6];
    drawBoard();
    drawPieces();
    document.getElementById("turncounter").innerHTML = "Turn: " + turnCounter;
    //document.getElementById("swapcounter").innerHTML = "Impending Doom in: " + (TEAMSWAP - counter); original traitor counter
    document.getElementById("swapcounter").innerHTML = "Impending Doom in: " + (teamSwap - counter + 1);
    if (turn == WHITE){
      turn = BLACK;
      //turnCounter += 1;
      document.getElementById("currentteam").innerHTML = "Current Turn: BLACK"
    }
    else{
      turn = WHITE;
      document.getElementById("currentteam").innerHTML = "Current Turn: WHITE"
      //counter += 1;
      turnCounter -= 1; //an extra turnCounter keeps getting added so i'm subtracting by 1 to counter it
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
