import { createBoard, initFigures } from "./Board.js";
import { createFigures, Figure, FigureTypes } from "./Figure.js";
import {
  drawBoard,
  initGraphic,
  getBoardPos,
  closeGraphics,
} from "./Graphic.js";
import { Tile } from "./Tile.js";
import { Position } from "./Position.js";
import { body, createEl } from "./index.js";

type Turn = {
  figure: Figure;
  from: Position;
  to: Position;
  capture: [Figure, Position] | null;
  sprintedPawn: Position | null;
  castle: Turn | null;
};

const history: Turn[] = [];

const archiveTurn = (
  figure: Figure,
  from: Position,
  to: Position,
  capture: [Figure, Position] | null = null,
  sprintedPawn = board.sprintedPawn,
  castle: Turn | null = null
) => {
  const last = history[history.length - 1];
  if (last && last.from === from && last.to === to) return;
  history.push({ figure, from, to, capture, sprintedPawn, castle });
};

const revertTurn = () => {
  const last = history.pop();
  if (!last) return;
  const from = board.getTile(last.to) as Tile;
  const fig = from.occupied;
  from.occupied = -1;
  (board.getTile(last.from) as Tile).occupied = fig;
  figures[fig] = last.figure;
  board.sprintedPawn = last.sprintedPawn;
  if (last.capture) {
    figures.push(last.capture[0]);
    (board.getTile(last.capture[1]) as Tile).occupied = figures.length - 1;
  }
  if (last.castle) {
    const l = last.castle;
    const from = board.getTile(l.to) as Tile;
    const fig = from.occupied;
    from.occupied = -1;
    (board.getTile(l.from) as Tile).occupied = fig;
    figures[fig] = l.figure;
  }
  endTurn(true);
};

const FPSTARGET = 30;

let end = false;
const curPlayer = document.createElement("div");
curPlayer.classList.add("curPlayer");
curPlayer.append(document.createElement("p"));
const setCurPlayerStyle = (white: boolean) => {
  curPlayer.style.color = white ? "white" : "black";
  document
    .getElementsByTagName("body")[0]
    .style.setProperty("--curPlayer-border-color", white ? "black" : "white");
};
const setCurPlayerText = (text: string) => {
  (curPlayer.firstChild as HTMLParagraphElement).innerText = text;
};

let currentPlayerWhite = false;

let board = createBoard();
let figures: Figure[] = [];
let kingPositions: {
  white: { pos: Position; threat: boolean }[];
  black: { pos: Position; threat: boolean }[];
} = { white: [], black: [] };

const endGame = () => {
  window.removeEventListener("click", mouseControll, true);
  setCurPlayerText(
    "Checkmate!\n" + (!currentPlayerWhite ? "Black" : "White") + " wins!!"
  );
  curPlayer.lastChild?.remove();
};

const checkMate = () => {
  const mate = !board.tiles.some((tiles) =>
    tiles.some((tile) => {
      if (tile.occupied === -1) return;
      const fig = figures[tile.occupied];
      if (fig.white === currentPlayerWhite) return;
      const moves = fig.getValidMoves(tile.pos, board);
      return moves.length > 0;
    })
  );
  return mate;
};

const endTurn = (revert = false) => {
  kingPositions = board.setThreat();
  let end = false;
  if (!revert) end = checkMate();
  if (end) {
    endGame();
    return;
  }
  currentPlayerWhite = !currentPlayerWhite;
  setCurPlayerStyle(currentPlayerWhite);
  setCurPlayerText(currentPlayerWhite ? "White's turn" : "Black's turn");
  board.print();
  console.log("Figures", figures);
  console.log("History", history);
  console.log("Kings", kingPositions);
};

let clickedTile: Tile | null = null;

const mouseControll = async (event: MouseEvent) => {
  //Define Stuff
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
    archiveTurn(
      { ...figures[clickedTile?.occupied as number] },
      clickedTile?.pos as Position,
      clickedOn?.pos as Position,
      tile.occupied === -1 ? null : [{ ...figures[tile.occupied] }, tile.pos]
    );
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
    //Special
    const special = figures[clickedTile.occupied].special;
    if (special != null) {
      switch (figures[clickedTile.occupied].type) {
        case FigureTypes.PAWN:
          await special(board, clickedTile, clickedOn, capturePiece, event);
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

let lastTime = 0;
const gameLoop = (time: number) => {
  const delta = time - lastTime;
  if (delta >= 1000 / FPSTARGET) update();
  if (!end) window.requestAnimationFrame(gameLoop);
};

const update = () => {
  drawBoard(board.tiles);
};

const startGame = (
  setup: {
    figures: [FigureTypes, boolean][];
    board: Position[];
  } | null = null
) => {
  end = false;
  const back = createEl("", "div", "menuButton", "outline", "outlineHover");
  back.innerText = "back";
  back.addEventListener("click", revertTurn);
  back.style.fontSize = "24px";
  curPlayer.append(back);
  body.append(curPlayer);

  currentPlayerWhite = false;

  board = createBoard();
  if (setup) initFigures(board, setup.board);
  else initFigures(board);
  if (setup) figures = createFigures(setup.figures);
  else figures = createFigures();
  initGraphic(board.width, board.height);
  kingPositions = { white: [], black: [] };

  endTurn(true);
  window.addEventListener("click", mouseControll, true);

  window.requestAnimationFrame(gameLoop);
};

const closeGame = () => {
  curPlayer.remove();
  closeGraphics();
};

export {
  figures,
  currentPlayerWhite,
  startGame,
  closeGame,
  revertTurn,
  mouseControll,
  archiveTurn,
  kingPositions,
};
