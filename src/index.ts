import { createBoard, initFigures } from "./Board.js";
import { createFigures, FigureTypes } from "./Figure.js";
import { drawBoard, initGraphic, getBoardPos } from "./Graphic.js";
import { Tile } from "./Tile.js";
import pos, { Position } from "./Position.js";

const curPlayer = document.createElement("div");
curPlayer.classList.add("curPlayer");
document.getElementsByTagName("body")[0].append(curPlayer);

const FPSTARGET = 30;

let currentPlayerWhite = false;

const board = createBoard();
initFigures(board);
let figures = createFigures();
initGraphic(board.width, board.height);
let threatenedKings: Position[] = [];

const endGame = () => {
  window.removeEventListener("click", mouseControll);
  curPlayer.style.color = currentPlayerWhite ? "black" : "white";
  curPlayer.innerText = (currentPlayerWhite ? "Black" : "White") + " won!!";
  document
    .getElementsByTagName("body")[0]
    .style.setProperty(
      "--curPlayer-border-color",
      currentPlayerWhite ? "white" : "black"
    );
  console.log("Loser is white: ", currentPlayerWhite);
};

const endTurn = () => {
  const newThreatenedKings = board.setThreat();
  let end = false;
  newThreatenedKings.forEach((p) => {
    if (!threatenedKings.includes(p)) return;
    if (
      figures[board.getTile(p)?.occupied as number].white === currentPlayerWhite
    ) {
      endGame();
      end = true;
    }
  });
  if (end) return;
  threatenedKings = newThreatenedKings;
  currentPlayerWhite = !currentPlayerWhite;
  curPlayer.style.color = currentPlayerWhite ? "white" : "black";
  curPlayer.innerText = currentPlayerWhite ? "Whites turn" : "Blacks turn";
  document
    .getElementsByTagName("body")[0]
    .style.setProperty(
      "--curPlayer-border-color",
      currentPlayerWhite ? "black" : "white"
    );
  board.print();
  console.log(figures);
};
endTurn();

let clickedTile: Tile | null = null;

const mouseControll = (event) => {
  const clickedOn = board.getTile(getBoardPos(event.clientX, event.clientY));
  const setClickedTileState = (state: boolean) => {
    if (!clickedTile) return;
    figures[clickedTile.occupied]
      .getValidMoves(clickedTile.pos, board)
      .forEach((pos) => {
        const tile = board.getTile(pos);
        tile && (tile.highlighted = state);
      });
    clickedTile.clicked = state;
  };
  const capturePiece = (tile: Tile) => {
    if (tile.occupied === -1) return;
    figures = figures.filter((_, i) => i !== tile.occupied);
    board.tiles.forEach((tiles) =>
      tiles.forEach((t) => {
        if (t.occupied > tile.occupied) t.occupied -= 1;
      })
    );
    tile.occupied = -1;
  };
  //Deselect Tile
  if (clickedOn == null || clickedOn === clickedTile) {
    setClickedTileState(false);
    clickedTile = null;
    return;
  }
  //movable tile
  if (clickedOn.highlighted) {
    //validate Player
    if (
      clickedTile == null ||
      figures[clickedTile.occupied].white !== currentPlayerWhite
    )
      return;
    setClickedTileState(false);
    //en passant
    if (
      figures[clickedTile.occupied].type === FigureTypes.PAWN &&
      board.sprintedPawn &&
      Math.abs(pos.x(clickedTile.pos, board.sprintedPawn)) === 1 &&
      pos.dist(clickedTile.pos, board.sprintedPawn) === 1
    ) {
      capturePiece(board.getTile(board.sprintedPawn) as Tile);
    }
    //sprintedPawn
    board.sprintedPawn = null;
    if (
      figures[clickedTile.occupied].type === FigureTypes.PAWN &&
      Math.abs(pos.y(clickedTile.pos, clickedOn.pos)) === 2
    ) {
      board.sprintedPawn = clickedOn.pos;
    }
    //castle
    if (figures[clickedTile.occupied].type === FigureTypes.KING) {
      const dist = pos.x(clickedTile.pos, clickedOn.pos);
      const white = figures[clickedTile.occupied].white;
      if (dist === 2) {
        const left = board.getTile(pos.new(0, white ? board.height - 1 : 0));
        if (left) {
          const rook = left.occupied;
          left.occupied = -1;
          const target = board.getTile(pos.add(clickedOn.pos, pos.new(1, 0)));
          target && (target.occupied = rook);
        }
      } else if (dist === -2) {
        const right = board.getTile(
          pos.new(board.width - 1, white ? board.height - 1 : 0)
        );
        if (right) {
          const rook = right.occupied;
          right.occupied = -1;
          const target = board.getTile(pos.add(clickedOn.pos, pos.new(-1, 0)));
          target && (target.occupied = rook);
        }
      }
    }
    //move
    capturePiece(clickedOn);
    const fig = clickedTile.occupied;
    clickedTile.occupied = -1;
    clickedTile = null;
    clickedOn.occupied = fig;
    figures[clickedOn.occupied].moved = true;
    endTurn();
    return;
  }
  //clicked on piece
  if (clickedOn.occupied >= 0) {
    setClickedTileState(false);
    clickedTile = clickedOn;
    setClickedTileState(true);
  }
};

window.addEventListener("click", mouseControll);

let lastTime = 0;
const gameLoop = (time: number) => {
  const delta = time - lastTime;
  if (delta >= 1000 / FPSTARGET) update();
  window.requestAnimationFrame(gameLoop);
};

const update = () => {
  drawBoard(board.tiles);
};

window.requestAnimationFrame(gameLoop);

export { figures, currentPlayerWhite };
