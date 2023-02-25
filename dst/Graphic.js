import { FigureTypes } from "./Figure.js";
import { figures } from "./Game.js";
import { body } from "./index.js";
import pos from "./Position.js";
const c = document.createElement("canvas");
const context = c.getContext("2d");
const g = {
    origin: pos.new(15, 100),
    scale: 100,
    setOrigin: (x, y) => (g.origin = pos.new(x, y)),
    setScale: (scale) => (g.scale = scale),
    getCoordinates: (xBoard, yBoard) => pos.add(g.origin, pos.scale(g.scale, pos.new(xBoard, yBoard))),
    getTileRect: (xBoard, yBoard) => {
        const pos = g.getCoordinates(xBoard, yBoard);
        return [pos.x, pos.y, g.scale, g.scale];
    },
};
const getBoardPos = (x, y) => {
    return pos.new(...Object.values(pos.scale(1 / g.scale, pos.add(pos.new(x, y), pos.scale(-1, g.origin)))).map((x) => Math.floor(x)));
};
const initGraphic = (width, height) => {
    body.append(c);
    const sizeC = () => {
        c.width = window.innerWidth;
        c.height = window.innerHeight;
        c.style.width = `${c.width}px`;
        c.style.height = `${c.height}px`;
    };
    const scaleG = () => {
        g.setOrigin(15, 100);
        g.setScale(Math.min((c.width - g.origin.x * 2) / width, (c.height - g.origin.y * 2) / height));
        g.setOrigin((c.width - g.scale * width) / 2, (c.height - g.scale * height) / 2);
        context.font = `${g.scale / 2}px serif`;
    };
    sizeC();
    scaleG();
    window.addEventListener("resize", () => {
        sizeC();
        scaleG();
    });
};
const drawFigure = (rect, occupied) => {
    const fig = figures[occupied];
    context.strokeStyle = fig.white ? "black" : "white";
    context.fillStyle = fig.white ? "white" : "black";
    context.lineWidth = 1;
    context.beginPath();
    const r = rect[2] / 2;
    const x = rect[0] + r;
    const y = rect[1] + r;
    context.arc(x, y, r / 1.5, 0, 2 * Math.PI);
    context.fill();
    context.stroke();
    context.fillStyle = fig.white ? "black" : "white";
    context.fillText(fig.type === FigureTypes.KNIGHT
        ? "H"
        : FigureTypes[fig.type][0].toUpperCase(), x - g.scale / 6, y + g.scale / 7);
};
const drawTile = (tile) => {
    context.fillStyle = tile.white ? "white" : "black";
    const rect = g.getTileRect(tile.pos.x, tile.pos.y);
    context.fillRect(...rect);
    if (tile.occupied >= 0) {
        drawFigure(rect, tile.occupied);
    }
};
const highlightTile = (tile, lineWidth = 10) => {
    context.strokeStyle = tile.clicked
        ? "#3ad11b"
        : tile.threatened
            ? "red"
            : tile.highlighted
                ? "#1cc0ed"
                : "black";
    if (context.strokeStyle !== "#000000") {
        context.lineWidth = lineWidth;
        const rect = g.getTileRect(tile.pos.x, tile.pos.y);
        context.strokeRect(rect[0] + lineWidth / 2, rect[1] + lineWidth / 2, rect[2] - lineWidth, rect[3] - lineWidth);
    }
};
const drawBoard = (tiles) => {
    tiles.forEach((tiles) => tiles.forEach((tile) => drawTile(tile)));
    tiles.forEach((tiles) => tiles.forEach((tile) => highlightTile(tile)));
};
const closeGraphics = () => {
    c.remove();
};
export { initGraphic, drawBoard, getBoardPos, closeGraphics };
