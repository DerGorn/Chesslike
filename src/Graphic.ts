import { FigureTypes } from "./Figure.js";
import { figures } from "./index.js";
import pos from "./Position.js";
import { Tile } from "./Tile.js";


const c = document.createElement("canvas");
const context = c.getContext("2d") as CanvasRenderingContext2D;

const g = {
  origin: pos.new(15, 100),
  scale: 100,
  setOrigin: (x: number, y: number) => (g.origin = pos.new(x, y)),
  setScale: (scale: number) => (g.scale = scale),
  getCoordinates: (xBoard: number, yBoard: number) =>
    pos.add(g.origin, pos.scale(g.scale, pos.new(xBoard, yBoard))),
  getTileRect: (
    xBoard: number,
    yBoard: number
  ): [number, number, number, number] => {
    const pos = g.getCoordinates(xBoard, yBoard);
    return [pos.x, pos.y, g.scale, g.scale];
  },
};

const getBoardPos = (x: number, y: number) => {
  return pos.new(
    ...(Object.values(
      pos.scale(1 / g.scale, pos.add(pos.new(x, y), pos.scale(-1, g.origin)))
    ).map((x) => Math.floor(x)) as [number, number])
  );
};

const initGraphic = (width: number, height: number) => {
  document.getElementsByTagName("body")[0].append(c);
  const sizeC = () => {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    c.style.width = `${c.width}px`;
    c.style.height = `${c.height}px`;
  };
  const scaleG = () => {
    g.setOrigin(15, 100);
    g.setScale(
      Math.min(
        (c.width - g.origin.x * 2) / width,
        (c.height - g.origin.y * 2) / height
      )
    );
    g.setOrigin(
      (c.width - g.scale * width) / 2,
      (c.height - g.scale * height) / 2
    );
  };
  sizeC();
  scaleG();
  window.addEventListener("resize", () => {
    sizeC();
    scaleG();
  });
};

const drawTile = (tile: Tile) => {
  context.fillStyle = tile.white ? "white" : "black";
  const rect = g.getTileRect(tile.pos.x, tile.pos.y);
  context.fillRect(...rect);
  if (tile.occupied >= 0) {
    context.strokeStyle = "red";
    context.lineWidth = 1;
    context.strokeText(
      FigureTypes[figures[tile.occupied].type],
      rect[0] + 20,
      rect[1] + 30
    );
    context.strokeText(
      `${figures[tile.occupied].white}`,
      rect[0] + 20,
      rect[1] + 50
    );
  }
};

const highlightTile = (tile: Tile, lineWidth = 10) => {
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
    context.strokeRect(
      rect[0] + lineWidth / 2,
      rect[1] + lineWidth / 2,
      rect[2] - lineWidth,
      rect[3] - lineWidth
    );
  }
};

const drawBoard = (tiles: Tile[][]) => {
  tiles.forEach((tiles) => tiles.forEach((tile) => drawTile(tile)));
  tiles.forEach((tiles) => tiles.forEach((tile) => highlightTile(tile)));
};

export { initGraphic, drawBoard, getBoardPos };
