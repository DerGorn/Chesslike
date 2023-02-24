import { createBoard, initFigures } from "./Board.js";
import { createFigures, FigureTypes } from "./Figure.js";
import { drawBoard, initGraphic, getBoardPos } from "./Graphic.js";
import { Tile } from "./Tile.js";
import { Position } from "./Position.js";

const curPlayer = document.createElement("div");
curPlayer.classList.add("curPlayer");
const setCurPlayerStyle = (white: boolean) => {
  curPlayer.style.color = white ? "white" : "black";
  document
    .getElementsByTagName("body")[0]
    .style.setProperty("--curPlayer-border-color", white ? "black" : "white");
};
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
  setCurPlayerStyle(!currentPlayerWhite);
  curPlayer.innerText = (currentPlayerWhite ? "Black" : "White") + " won!!";
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
  setCurPlayerStyle(currentPlayerWhite);
  curPlayer.innerText = currentPlayerWhite ? "Whites turn" : "Blacks turn";
  board.print();
  console.log(figures);
};
endTurn();

let clickedTile: Tile | null = null;

const mouseControll = (event: MouseEvent) => {
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
    const special = figures[clickedTile.occupied].special;
    if (special != null) {
      switch (figures[clickedTile.occupied].type) {
        case FigureTypes.PAWN:
          special(board, clickedTile, clickedOn, capturePiece);
          break;
        case FigureTypes.KING:
          special(board, clickedTile, clickedOn);
          break;
        default:
          throw new Error("Forgot to call 'special' in 'mouseControll'.");
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
