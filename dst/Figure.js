import pos from "./Position.js";
import { archiveTurn, figures, kingPositions } from "./Game.js";
import { createConfirm } from "./index.js";
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
const checkThreat = (tile, white, pos) => {
    return (tile.threat.includes(white ? "b" : "w") ||
        tile.threat.includes(white ? `p${pos.str()}` : `v${pos.str()}`));
};
const checkKingProtection = (p, white, board, target, protectingKingFrom, check) => {
    let protect = true;
    const targetThreat = board.getTile(target)?.threat;
    protectingKingFrom.forEach((protectFrom) => {
        if (!protect ||
            target.str() ===
                protectFrom.split("/").reduce((str, part, i) => {
                    if (i !== 0) {
                        part = part.slice(1);
                    }
                    return str + part;
                }, ""))
            return;
        if ((check && !targetThreat.includes(`${white ? "b" : "w"}${protectFrom}`)) ||
            (!targetThreat.includes(`${white ? "p" : "v"}${p.str()}${protectFrom}`) &&
                !targetThreat.includes(`${white ? "b" : "w"}${protectFrom}`)))
            protect = false;
    });
    return protect;
};
const getTiles = (p, white, board, distance = null, forward = true, left = null, distanceX = null, capture = null, safe = false, findThreatened = false) => {
    let validPositions = [];
    let block = "";
    let protectingKingFrom = [];
    let check = false;
    const searchThreat = (threat, search) => {
        if (threat.includes(search)) {
            threat.split(search).forEach((text, i) => {
                if (i === 0)
                    return;
                const pStr = text.slice(0, threat.indexOf(")"));
                if (!protectingKingFrom.includes(pStr))
                    protectingKingFrom.push(pStr);
            });
        }
    };
    if (figures[board.getTile(p)?.occupied].type !== FigureTypes.KING)
        kingPositions[white ? "white" : "black"].forEach((pk) => {
            const kingTile = board.getTile(pk.pos);
            const threat = kingTile.threat;
            searchThreat(threat, `${white ? "p" : "v"}${p.str()}`);
            if (pk.threat) {
                check = true;
                searchThreat(threat, `${white ? "b" : "w"}`);
            }
        });
    console.log(check, protectingKingFrom);
    if (capture === false && findThreatened)
        return validPositions;
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
        if (!tile || (!findThreatened && safe && checkThreat(tile, white, p)))
            return validPositions;
        if (checkKingProtection(p, white, board, target, protectingKingFrom, check) &&
            (findThreatened ||
                tile.occupied === -1 ||
                figures[tile.occupied].white !== white))
            validPositions.push(target);
        return validPositions;
    }
    const move = getMoveFunction(forward, left);
    const direction = forward === null
        ? left === null
            ? null
            : left
                ? 0
                : 1
        : forward
            ? left === null
                ? 2
                : left
                    ? 3
                    : 4
            : left === null
                ? 5
                : left
                    ? 6
                    : 7;
    let target = p;
    while (distance == null ? true : distance > 0) {
        target = move(target, white, 1);
        if (block)
            target.condition = block;
        if (direction)
            target.direction = `${direction}`;
        const tile = board.getTile(target);
        if (!tile || (safe && checkThreat(tile, white, p))) {
            if (tile && findThreatened)
                validPositions.push(target);
            break;
        }
        const protectKing = checkKingProtection(p, white, board, target, protectingKingFrom, check);
        if (protectKing)
            validPositions.push(target);
        if (tile.occupied !== -1) {
            if (capture === false ||
                (!findThreatened && figures[tile.occupied].white === white))
                if (protectKing)
                    validPositions.pop();
            if (findThreatened && block === "")
                block = `${white ? "v" : "p"}${tile.pos.str()}${p.str()}`;
            else
                break;
        }
        if (!findThreatened && capture === true) {
            if (tile.occupied === -1) {
                if (protectKing)
                    validPositions.pop();
            }
            else {
                if (figures[tile.occupied].white === white) {
                    if (protectKing)
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
    let getValidMoves = (pos, board, findThreatened = false) => {
        console.log(pos, board, findThreatened);
        return [];
    };
    let movementRules = [];
    let special = null;
    switch (type) {
        case FigureTypes.PAWN:
            getValidMoves = function (p, board, findThreatened = false) {
                movementRules = [
                    { distance: this.moved ? 1 : 2, forward: true, capture: false },
                    { distance: 1, forward: true, left: true, capture: true },
                    { distance: 1, forward: true, left: false, capture: true },
                ];
                let validMoves = [];
                movementRules.forEach((rule) => {
                    validMoves.push(...getTiles(p, this.white, board, ...newRule(rule), findThreatened));
                });
                if (board.sprintedPawn &&
                    Math.abs(pos.x(board.sprintedPawn, p)) === 1 &&
                    pos.dist(board.sprintedPawn, p) === 1)
                    validMoves.push(pos.moveVertical(board.sprintedPawn, white));
                return validMoves;
            };
            special = async (board, clickedTile, clickedOn, capturePiece, event) => {
                if (board.sprintedPawn &&
                    Math.abs(pos.x(clickedTile.pos, clickedOn.pos)) === 1 &&
                    pos.dist(clickedTile.pos, board.sprintedPawn) === 1) {
                    capturePiece(board.getTile(board.sprintedPawn));
                }
                capturePiece(clickedOn);
                board.sprintedPawn = null;
                if (Math.abs(pos.y(clickedTile.pos, clickedOn.pos)) === 2) {
                    board.sprintedPawn = clickedOn.pos;
                }
                if (clickedOn.pos.y === (white ? 0 : board.height - 1)) {
                    const options = [
                        FigureTypes.QUEEN,
                        FigureTypes.BISHOP,
                        FigureTypes.KNIGHT,
                        FigureTypes.ROOCK,
                    ];
                    const res = await createConfirm("promotion", pos.new(event.clientX, event.clientY), ...options.map((type) => FigureTypes[type]));
                    figures[clickedTile.occupied] = createFigure(options[res], white);
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
            getValidMoves = function (p, board, findThreatened = false) {
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
                    validMoves.push(...getTiles(p, this.white, board, ...newRule(rule), findThreatened));
                });
                const castle = (left) => {
                    if (board.getTile(p)?.threat.includes(white ? "b" : "w"))
                        return;
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
                const dist = pos.x(clickedTile.pos, clickedOn.pos) / 2;
                const white = figures[clickedTile.occupied].white;
                if (dist !== 1 && dist !== -1)
                    return;
                const left = dist > 0 ? true : false;
                const target = board.getTile(pos.new(left ? 0 : board.width - 1, white ? board.height - 1 : 0));
                if (!target)
                    return;
                const rook = target.occupied;
                target.occupied = -1;
                const t = board.getTile(pos.add(clickedOn.pos, pos.new(dist, 0)));
                if (!t)
                    return;
                t.occupied = rook;
                archiveTurn({ ...figures[clickedTile.occupied] }, clickedTile.pos, clickedOn.pos, null, board.sprintedPawn, {
                    figure: { ...figures[rook] },
                    from: target.pos,
                    to: t.pos,
                    capture: null,
                    sprintedPawn: null,
                    castle: null,
                });
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
        getValidMoves = function (p, board, findThreatened = false) {
            let validMoves = [];
            movementRules.forEach((rule) => {
                validMoves.push(...getTiles(p, this.white, board, ...newRule(rule), findThreatened));
            });
            return validMoves;
        };
    return { getValidMoves, type, white, moved: false, special };
};
const createFigures = (setup = [
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
]) => {
    return setup.map((x) => createFigure(x[0], x[1]));
};
export { createFigure, createFigures, FigureTypes };
