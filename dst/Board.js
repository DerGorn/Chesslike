import { FigureTypes } from "./Figure.js";
import { figures } from "./Game.js";
import pos from "./Position.js";
import tile from "./Tile.js";
const createBoard = (width = 8, height = 8) => {
    return {
        width,
        height,
        tiles: Array(width)
            .fill(0)
            .map((_, x) => {
            return Array(height)
                .fill(0)
                .map((_, y) => {
                return tile.new(x, y, x % 2 === y % 2);
            });
        }),
        getTile: function (pos) {
            return pos.x < width && pos.x >= 0 && pos.y < height && pos.y >= 0
                ? this.tiles[pos.x][pos.y]
                : null;
        },
        setThreat: function () {
            this.tiles.forEach((tiles) => tiles.forEach((tile) => {
                tile.threat = "";
                tile.threatened = false;
            }));
            let kingPos = { white: [], black: [] };
            this.tiles.forEach((tiles) => tiles.forEach((tile) => {
                if (tile.occupied === -1)
                    return;
                const fig = figures[tile.occupied];
                if (fig.type === FigureTypes.KING)
                    kingPos[fig.white ? "white" : "black"].push({
                        pos: tile.pos,
                        threat: false,
                    });
                const ts = fig.getValidMoves(tile.pos, this, true);
                ts.forEach((p) => {
                    const t = this.getTile(p);
                    if (!t)
                        return;
                    t.threat += p.condition
                        ? p.condition
                        : (fig.white ? "w" : "b") + tile.pos.str();
                    if (t.occupied === -1 ||
                        figures[t.occupied].type !== FigureTypes.KING)
                        return;
                    t.threatened = t.threat.includes(figures[t.occupied].white ? "b" : "w");
                });
            }));
            Object.entries(kingPos).forEach(([color, ps]) => {
                ps.forEach((kingP, i) => {
                    if (this.getTile(kingP.pos).threatened) {
                        kingPos[color][i].threat = true;
                    }
                });
            });
            console.log("setThreat End:", kingPos);
            return kingPos;
        },
        print: function () {
            console.log(this.tiles.reduce((str, tiles) => str + tiles.reduce((s, tile) => s + tile.occupied + " ", "") + "\n", "\n"));
            console.log(this.tiles.reduce((str, tiles) => str +
                tiles.reduce((s, tile) => s + (tile.threat === "" ? "_" : tile.threat) + " ", "") +
                "\n", "\n"));
        },
        sprintedPawn: null,
    };
};
const initFigures = (board, setup = [
    pos.new(0, 6),
    pos.new(1, 6),
    pos.new(2, 6),
    pos.new(3, 6),
    pos.new(4, 6),
    pos.new(5, 6),
    pos.new(6, 6),
    pos.new(7, 6),
    pos.new(0, 7),
    pos.new(1, 7),
    pos.new(2, 7),
    pos.new(3, 7),
    pos.new(4, 7),
    pos.new(5, 7),
    pos.new(6, 7),
    pos.new(7, 7),
    pos.new(0, 1),
    pos.new(1, 1),
    pos.new(2, 1),
    pos.new(3, 1),
    pos.new(4, 1),
    pos.new(5, 1),
    pos.new(6, 1),
    pos.new(7, 1),
    pos.new(0, 0),
    pos.new(1, 0),
    pos.new(2, 0),
    pos.new(3, 0),
    pos.new(4, 0),
    pos.new(5, 0),
    pos.new(6, 0),
    pos.new(7, 0),
]) => {
    setup.forEach((pos, i) => {
        const tile = board.getTile(pos);
        tile && (tile.occupied = i);
    });
};
export { createBoard, initFigures };
