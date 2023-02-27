import { createBoard, initFigures } from "./Board.js";
import { createFigures, FigureTypes } from "./Figure.js";
import { drawBoard, initGraphic, getBoardPos, closeGraphics, } from "./Graphic.js";
import { body, createEl } from "./index.js";
const history = [];
const archiveTurn = (figure, from, to, capture = null, sprintedPawn = board.sprintedPawn, castle = null) => {
    const last = history[history.length - 1];
    if (last && last.from === from && last.to === to)
        return;
    history.push({ figure, from, to, capture, sprintedPawn, castle });
};
const revertTurn = () => {
    const last = history.pop();
    if (!last)
        return;
    const from = board.getTile(last.to);
    const fig = from.occupied;
    from.occupied = -1;
    board.getTile(last.from).occupied = fig;
    figures[fig] = last.figure;
    board.sprintedPawn = last.sprintedPawn;
    if (last.capture) {
        figures.push(last.capture[0]);
        board.getTile(last.capture[1]).occupied = figures.length - 1;
    }
    if (last.castle) {
        const l = last.castle;
        const from = board.getTile(l.to);
        const fig = from.occupied;
        from.occupied = -1;
        board.getTile(l.from).occupied = fig;
        figures[fig] = l.figure;
    }
    endTurn(true);
};
const FPSTARGET = 30;
let end = false;
const curPlayer = document.createElement("div");
curPlayer.classList.add("curPlayer");
curPlayer.append(document.createElement("p"));
const setCurPlayerStyle = (white) => {
    curPlayer.style.color = white ? "white" : "black";
    document
        .getElementsByTagName("body")[0]
        .style.setProperty("--curPlayer-border-color", white ? "black" : "white");
};
const setCurPlayerText = (text) => {
    curPlayer.firstChild.innerText = text;
};
let currentPlayerWhite = false;
let board = createBoard();
let figures = createFigures();
let threatenedKings = [];
const endGame = () => {
    if (confirm("Are you sure that was your best move? Because you lost. Would you love to revert time and try again?")) {
        currentPlayerWhite = !currentPlayerWhite;
        revertTurn();
        return;
    }
    window.removeEventListener("click", mouseControll, true);
    setCurPlayerStyle(!currentPlayerWhite);
    setCurPlayerText((currentPlayerWhite ? "Black" : "White") + " won!!");
    curPlayer.lastChild?.remove();
};
const endTurn = (revert = false) => {
    threatenedKings = board.setThreat();
    let end = false;
    threatenedKings.forEach((p) => {
        if (!revert &&
            figures[board.getTile(p)?.occupied].white === currentPlayerWhite) {
            endGame();
            end = true;
        }
    });
    if (end)
        return;
    currentPlayerWhite = !currentPlayerWhite;
    setCurPlayerStyle(currentPlayerWhite);
    setCurPlayerText(currentPlayerWhite ? "White's turn" : "Black's turn");
};
let clickedTile = null;
const mouseControll = async (event) => {
    const clickedOn = board.getTile(getBoardPos(event.clientX, event.clientY));
    const setClickedTileState = (state) => {
        if (!clickedTile)
            return;
        figures[clickedTile.occupied]
            .getValidMoves(clickedTile.pos, board)
            .forEach((pos) => {
            const tile = board.getTile(pos);
            tile && (tile.highlighted = state);
        });
        clickedTile.clicked = state;
    };
    const capturePiece = (tile) => {
        archiveTurn({ ...figures[clickedTile?.occupied] }, clickedTile?.pos, clickedOn?.pos, tile.occupied === -1 ? null : [{ ...figures[tile.occupied] }, tile.pos]);
        if (tile.occupied === -1)
            return;
        figures = figures.filter((_, i) => i !== tile.occupied);
        board.tiles.forEach((tiles) => tiles.forEach((t) => {
            if (t.occupied > tile.occupied)
                t.occupied -= 1;
        }));
        tile.occupied = -1;
    };
    if (clickedOn == null || clickedOn === clickedTile) {
        setClickedTileState(false);
        clickedTile = null;
        return;
    }
    if (clickedOn.highlighted) {
        if (clickedTile == null ||
            figures[clickedTile.occupied].white !== currentPlayerWhite)
            return;
        setClickedTileState(false);
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
        capturePiece(clickedOn);
        const fig = clickedTile.occupied;
        clickedTile.occupied = -1;
        clickedTile = null;
        clickedOn.occupied = fig;
        figures[clickedOn.occupied].moved = true;
        endTurn();
        return;
    }
    if (clickedOn.occupied >= 0) {
        setClickedTileState(false);
        clickedTile = clickedOn;
        setClickedTileState(true);
    }
};
let lastTime = 0;
const gameLoop = (time) => {
    const delta = time - lastTime;
    if (delta >= 1000 / FPSTARGET)
        update();
    if (!end)
        window.requestAnimationFrame(gameLoop);
};
const update = () => {
    drawBoard(board.tiles);
};
const startGame = () => {
    end = false;
    const back = createEl("", "div", "menuButton", "outline", "outlineHover");
    back.innerText = "back";
    back.addEventListener("click", revertTurn);
    back.style.fontSize = "24px";
    curPlayer.append(back);
    body.append(curPlayer);
    currentPlayerWhite = false;
    board = createBoard();
    initFigures(board);
    figures = createFigures();
    initGraphic(board.width, board.height);
    threatenedKings = [];
    endTurn();
    window.addEventListener("click", mouseControll, true);
    window.requestAnimationFrame(gameLoop);
};
const closeGame = () => {
    curPlayer.remove();
    closeGraphics();
};
export { figures, currentPlayerWhite, startGame, closeGame, revertTurn, mouseControll, archiveTurn, };
