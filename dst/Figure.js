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
const TypesWithSpecialMovement = [FigureTypes.PAWN, FigureTypes.KING];
const newRule = ({ distance = null, forward = null, left = null, distanceX = null, capture = null, safe = false, } = {}) => {
    return [distance, forward, left, distanceX, capture, safe];
};
const getMoveFunction = (forward, left) => {
    if (forward != null) {
        if (left != null) {
            return (p, white, distance) => pos.moveDiagonal(p, white, distance, forward, left);
        }
        else
            return (p, white, distance) => pos.moveVertical(p, white, distance, forward);
    }
    else {
        if (left != null) {
            return (p, white, distance) => pos.moveHorizontal(p, white, distance, left);
        }
        else
            throw new Error("Tried running in circles. Tried moving with 'forward = null' and 'left = null', resulting in no logical step to take.");
    }
};
const getTiles = (p, white, board, distance = null, forward = true, left = null, distanceX = null, capture = null, safe = false) => {
    let validPositions = [];
    if (distanceX != null) {
        if (distance == null)
            throw new Error("Tried jumping of the board. Tried jumping on the target tile, because 'distanceX' was set, but located the tile at infinity, because no 'distance' was provided.");
        let target = p;
        if (forward != null)
            target = pos.moveVertical(target, white, distance, forward);
        if (left != null)
            target = pos.moveHorizontal(target, white, distanceX, left);
        if (pos.dist(target, p) === 0)
            throw new Error("Tried jumping nowhere. No distances where provided, so the jump landed on the starting tile.");
        const tile = board.getTile(target);
        if (!tile || (safe && tile.threat.includes(white ? "b" : "w")))
            return validPositions;
        if (tile.occupied === -1 || figures[tile.occupied].white !== white)
            validPositions.push(target);
        return validPositions;
    }
    const move = getMoveFunction(forward, left);
    let target = p;
    while (distance == null ? true : distance > 0) {
        target = move(target, white, 1);
        const tile = board.getTile(target);
        if (tile == null || (safe && tile.threat.includes(white ? "b" : "w")))
            break;
        validPositions.push(target);
        if (tile.occupied !== -1) {
            if (capture === false || figures[tile.occupied].white === white)
                validPositions.pop();
            break;
        }
        if (capture === true) {
            if (tile.occupied === -1)
                validPositions.pop();
            else {
                if (figures[tile.occupied].white === white) {
                    validPositions.pop();
                    break;
                }
            }
        }
        distance = distance == null ? null : distance - 1;
    }
    return validPositions;
};
const createFigure = (type, white) => {
    let getValidMoves = (pos, board) => {
        console.log(pos, board);
        return [];
    };
    let movementRules = [];
    let special = null;
    switch (type) {
        case FigureTypes.PAWN:
            getValidMoves = function (p, board) {
                movementRules = [
                    { distance: this.moved ? 1 : 2, forward: true, capture: false },
                    { distance: 1, forward: true, left: true, capture: true },
                    { distance: 1, forward: true, left: false, capture: true },
                ];
                let validMoves = [];
                movementRules.forEach((rule) => {
                    validMoves.push(...getTiles(p, this.white, board, ...newRule(rule)));
                });
                if (board.sprintedPawn &&
                    Math.abs(pos.x(board.sprintedPawn, p)) === 1 &&
                    pos.dist(board.sprintedPawn, p) === 1)
                    validMoves.push(pos.moveVertical(board.sprintedPawn, white));
                return validMoves;
            };
            special = (board, clickedTile, clickedOn, capturePiece) => {
                if (board.sprintedPawn &&
                    Math.abs(pos.x(clickedTile.pos, board.sprintedPawn)) === 1 &&
                    pos.dist(clickedTile.pos, board.sprintedPawn) === 1) {
                    capturePiece(board.getTile(board.sprintedPawn));
                }
                board.sprintedPawn = null;
                if (Math.abs(pos.y(clickedTile.pos, clickedOn.pos)) === 2) {
                    board.sprintedPawn = clickedOn.pos;
                }
            };
            break;
        case FigureTypes.ROOCK:
            movementRules = [
                { forward: true },
                { forward: false },
                { left: true },
                { left: false },
            ];
            break;
        case FigureTypes.KNIGHT:
            movementRules = [
                { distance: 2, forward: true, left: true, distanceX: 1 },
                { distance: 2, forward: true, left: false, distanceX: 1 },
                { distance: 2, forward: false, left: true, distanceX: 1 },
                { distance: 2, forward: false, left: false, distanceX: 1 },
                { distance: 1, forward: true, left: true, distanceX: 2 },
                { distance: 1, forward: true, left: false, distanceX: 2 },
                { distance: 1, forward: false, left: true, distanceX: 2 },
                { distance: 1, forward: false, left: false, distanceX: 2 },
            ];
            break;
        case FigureTypes.BISHOP:
            movementRules = [
                { forward: true, left: true },
                { forward: false, left: true },
                { forward: true, left: false },
                { forward: false, left: false },
            ];
            break;
        case FigureTypes.KING:
            getValidMoves = function (p, board) {
                movementRules = [
                    { distance: 1, forward: true, safe: true },
                    { distance: 1, forward: false, safe: true },
                    { distance: 1, left: true, safe: true },
                    { distance: 1, left: false, safe: true },
                    { distance: 1, forward: true, left: true, safe: true },
                    { distance: 1, forward: true, left: false, safe: true },
                    { distance: 1, forward: false, left: true, safe: true },
                    { distance: 1, forward: false, left: false, safe: true },
                ];
                let validMoves = [];
                movementRules.forEach((rule) => {
                    validMoves.push(...getTiles(p, this.white, board, ...newRule(rule)));
                });
                const castle = (left) => {
                    const tile = board.getTile(pos.new(left ? 0 : board.width - 1, white ? board.height - 1 : 0));
                    if (tile && tile.occupied !== -1) {
                        const roock = figures[tile.occupied];
                        if (!roock.moved &&
                            !this.moved &&
                            getTiles(p, white, board, ...newRule({
                                left: this.white === left,
                                capture: false,
                                safe: true,
                            })).length === (left ? 3 : 2))
                            validMoves.push(pos.moveHorizontal(p, white, 2, this.white === left));
                    }
                };
                castle(true);
                castle(false);
                return validMoves;
            };
            special = (board, clickedTile, clickedOn) => {
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
            };
            break;
        case FigureTypes.QUEEN:
            movementRules = [
                { forward: true },
                { forward: false },
                { left: true },
                { left: false },
                { forward: true, left: true },
                { forward: true, left: false },
                { forward: false, left: true },
                { forward: false, left: false },
            ];
            break;
    }
    if (!TypesWithSpecialMovement.includes(type))
        getValidMoves = function (p, board) {
            let validMoves = [];
            movementRules.forEach((rule) => {
                validMoves.push(...getTiles(p, this.white, board, ...newRule(rule)));
            });
            return validMoves;
        };
    return { getValidMoves, type, white, moved: false, special };
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
