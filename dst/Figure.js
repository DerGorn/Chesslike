import pos from "./Position.js";
import { figures } from "./index.js";
var FigureTypes;
(function (FigureTypes) {
    FigureTypes[FigureTypes["PAWN"] = 0] = "PAWN";
    FigureTypes[FigureTypes["ROOCK"] = 1] = "ROOCK";
    FigureTypes[FigureTypes["KNIGHT"] = 2] = "KNIGHT";
    FigureTypes[FigureTypes["BISHOP"] = 3] = "BISHOP";
    FigureTypes[FigureTypes["KING"] = 4] = "KING";
    FigureTypes[FigureTypes["QUEEN"] = 5] = "QUEEN";
})(FigureTypes || (FigureTypes = {}));
const createFigure = (type, white) => {
    let getValidMoves = (pos, board) => {
        console.log(pos, board);
        return [];
    };
    switch (type) {
        case FigureTypes.PAWN:
            getValidMoves = function (p, board) {
                let validMoves = [];
                const forward = pos.moveVertical(p, this.white);
                if (board.getTile(forward)?.occupied === -1) {
                    validMoves.push(forward);
                    if (!this.moved) {
                        const twoForward = pos.moveVertical(p, this.white, 2);
                        if (board.getTile(twoForward)?.occupied === -1)
                            validMoves.push(twoForward);
                    }
                }
                const left = pos.moveDiagonal(p, this.white, 1);
                const pieceLeft = board.getTile(left);
                if (pieceLeft &&
                    pieceLeft.occupied !== -1 &&
                    figures[pieceLeft.occupied].white !== this.white)
                    validMoves.push(left);
                const right = pos.moveDiagonal(p, this.white, 1, true, false);
                const pieceRight = board.getTile(right);
                if (pieceRight &&
                    pieceRight.occupied !== -1 &&
                    figures[pieceRight.occupied].white !== this.white)
                    validMoves.push(right);
                if (board.sprintedPawn &&
                    Math.abs(pos.x(board.sprintedPawn, p)) === 1 &&
                    pos.dist(board.sprintedPawn, p) === 1)
                    validMoves.push(pos.moveVertical(board.sprintedPawn, white));
                return validMoves;
            };
            break;
        case FigureTypes.ROOCK:
            getValidMoves = (pos) => {
                console.log(pos);
                return [];
            };
            break;
        case FigureTypes.KNIGHT:
            getValidMoves = (pos) => {
                console.log(pos);
                return [];
            };
            break;
        case FigureTypes.BISHOP:
            getValidMoves = (pos) => {
                console.log(pos);
                return [];
            };
            break;
        case FigureTypes.KING:
            getValidMoves = (pos) => {
                console.log(pos);
                return [];
            };
            break;
        case FigureTypes.QUEEN:
            getValidMoves = (pos) => {
                console.log(pos);
                return [];
            };
            break;
    }
    return { getValidMoves, type, white, moved: false };
};
const createFigures = () => {
    return [
        [FigureTypes.PAWN, true],
        [FigureTypes.PAWN, true],
        [FigureTypes.PAWN, true],
        [FigureTypes.PAWN, true],
        [FigureTypes.PAWN, true],
        [FigureTypes.PAWN, true],
        [FigureTypes.PAWN, true],
        [FigureTypes.PAWN, true],
        [FigureTypes.ROOCK, true],
        [FigureTypes.KNIGHT, true],
        [FigureTypes.BISHOP, true],
        [FigureTypes.QUEEN, true],
        [FigureTypes.KING, true],
        [FigureTypes.BISHOP, true],
        [FigureTypes.KNIGHT, true],
        [FigureTypes.ROOCK, true],
        [FigureTypes.PAWN, false],
        [FigureTypes.PAWN, false],
        [FigureTypes.PAWN, false],
        [FigureTypes.PAWN, false],
        [FigureTypes.PAWN, false],
        [FigureTypes.PAWN, false],
        [FigureTypes.PAWN, false],
        [FigureTypes.PAWN, false],
        [FigureTypes.ROOCK, false],
        [FigureTypes.KNIGHT, false],
        [FigureTypes.BISHOP, false],
        [FigureTypes.QUEEN, false],
        [FigureTypes.KING, false],
        [FigureTypes.BISHOP, false],
        [FigureTypes.KNIGHT, false],
        [FigureTypes.ROOCK, false],
    ].map((x) => createFigure(x[0], x[1]));
};
export { createFigure, createFigures, FigureTypes };
