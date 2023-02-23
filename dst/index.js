import { createBoard, initFigures } from "./Board.js";
import { createFigures, FigureTypes } from "./Figure.js";
import { drawBoard, initGraphic, getBoardPos } from "./Graphic.js";
import pos from "./Position.js";
const curPlayer = document.createElement("div");
curPlayer.classList.add("curPlayer");
document.getElementsByTagName("body")[0].append(curPlayer);
const FPSTARGET = 30;
let currentPlayerWhite = false;
const board = createBoard();
initFigures(board);
let figures = createFigures();
initGraphic(board.width, board.height);
const endTurn = () => {
    currentPlayerWhite = !currentPlayerWhite;
    curPlayer.style.color = currentPlayerWhite ? "white" : "black";
    curPlayer.innerText = currentPlayerWhite ? "Whites turn" : "Blacks turn";
    document
        .getElementsByTagName("body")[0]
        .style.setProperty("--curPlayer-border-color", currentPlayerWhite ? "black" : "white");
    console.log(currentPlayerWhite);
    board.print();
    console.log(figures);
};
endTurn();
let clickedTile = null;
window.addEventListener("click", (event) => {
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
        if (figures[clickedTile.occupied].type === FigureTypes.PAWN &&
            board.sprintedPawn &&
            Math.abs(pos.x(clickedTile.pos, board.sprintedPawn)) === 1 &&
            pos.dist(clickedTile.pos, board.sprintedPawn) === 1) {
            capturePiece(board.getTile(board.sprintedPawn));
        }
        board.sprintedPawn = null;
        if (figures[clickedTile.occupied].type === FigureTypes.PAWN &&
            Math.abs(pos.y(clickedTile.pos, clickedOn.pos)) === 2) {
            board.sprintedPawn = clickedOn.pos;
        }
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
            }
            else if (dist === -2) {
                const right = board.getTile(pos.new(board.width - 1, white ? board.height - 1 : 0));
                if (right) {
                    const rook = right.occupied;
                    right.occupied = -1;
                    const target = board.getTile(pos.add(clickedOn.pos, pos.new(-1, 0)));
                    target && (target.occupied = rook);
                }
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
});
let lastTime = 0;
const gameLoop = (time) => {
    const delta = time - lastTime;
    if (delta >= 1000 / FPSTARGET)
        update();
    window.requestAnimationFrame(gameLoop);
};
const update = () => {
    drawBoard(board.tiles);
};
window.requestAnimationFrame(gameLoop);
export { figures, currentPlayerWhite };
