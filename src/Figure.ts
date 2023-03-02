import { Board } from "./Board.js";
import pos, { Position } from "./Position.js";
import { archiveTurn, figures, kingPositions } from "./Game.js";
import { Tile } from "./Tile.js";
import { createConfirm } from "./index.js";

enum FigureTypes {
  PAWN,
  ROOCK,
  KNIGHT,
  BISHOP,
  KING,
  QUEEN,
}

const TypesWithSpecialMovement = [FigureTypes.PAWN, FigureTypes.KING];

type Figure = {
  getValidMoves: (
    pos: Position,
    board: Board,
    findThreatened?: boolean
  ) => Position[];
  type: FigureTypes;
  white: boolean;
  moved: boolean;
  special: Function | null;
};

type Rule = {
  distance?: number | null;
  forward?: boolean | null;
  left?: boolean | null;
  distanceX?: number | null;
  capture?: boolean | null;
  safe?: boolean;
};

const newRule = ({
  distance = null,
  forward = null,
  left = null,
  distanceX = null,
  capture = null,
  safe = false,
}: Rule = {}): [
  number | null,
  boolean | null,
  boolean | null,
  number | null,
  boolean | null,
  boolean
] => {
  return [distance, forward, left, distanceX, capture, safe];
};

const getMoveFunction = (
  forward: boolean | null,
  left: boolean | null
): ((p: Position, white: boolean, distance: number) => Position) => {
  if (forward != null) {
    if (left != null) {
      return (p: Position, white: boolean, distance: number) =>
        pos.moveDiagonal(p, white, distance, forward, left);
    } else
      return (p: Position, white: boolean, distance: number) =>
        pos.moveVertical(p, white, distance, forward);
  } else {
    if (left != null) {
      return (p: Position, white: boolean, distance: number) =>
        pos.moveHorizontal(p, white, distance, left);
    } else
      throw new Error(
        "Tried running in circles. Tried moving with 'forward = null' and 'left = null', resulting in no logical step to take."
      );
  }
};

const checkThreat = (tile: Tile, white: boolean, pos: Position): boolean => {
  return (
    tile.threat.includes(white ? "b" : "w") ||
    tile.threat.includes(white ? `p${pos.str()}` : `v${pos.str()}`)
  );
};

const checkKingProtection = (
  p: Position,
  white: boolean,
  board: Board,
  target: Position,
  protectingKingFrom: string[]
): boolean => {
  let protect = true;
  const targetThreat = board.getTile(target)?.threat as string;
  protectingKingFrom.forEach((protectFrom) => {
    if (!protect) return;
    if (
      !targetThreat.includes(`${white ? "p" : "v"}${p.str()}${protectFrom}`) &&
      !targetThreat.includes(`${white ? "b" : "w"}${protectFrom}`)
    )
      protect = false;
  });
  return protect;
};

/**
 * Get all possible Moves from a starting position with some defined rules.
 * Normally all tiles in a straight line from the start to the target are valid, until either a other piece or the end of the board are reached.
 * By setting a 'distanceX' the behaviour changes to a single jump unto the target.
 *
 *
 * @param p Position of the figure
 * @param white Color of the figure
 * @param board The board
 * @param distance The max distance to travel, if 'null' distance is infinite
 * @param forward Toggles vertical movement, if 'null' the figure may only move horizontal
 * @param left Toggles hotizontal movement, if 'null' the figure may only move vertical. If left and forward are set, the movement will be in both directions
 * @param distanceX Defines behaviour for a combination of vertical and horizontal movement. If 'null' both use dstance, so the movement is diagonal. If it is a number, horizopntal movement uses this value. In addition only the specified tile will be checked, with no regard for pieces inbetween.
 * @param capture Defines the capture mode. Standard is 'null', which is the normal behaviour, that allows capture. 'false' forbids captures, for example the forward movement of a pawn. 'true' only allows moves that capture, for example diagonal movement of a pawn.
 * @param safe Activates safe Movement. If 'true' tiles that are threatened by the opponent are not valid. This is the normal movement of the king.
 * @param findThreatened Sets the mode to finding the threatened tiles. Some moves that may be illegal, will become valid with this. For example: Moves that threaten own pieces, or tiles next to the king, that are threatened by the other player
 */
const getTiles = (
  p: Position,
  white: boolean,
  board: Board,
  distance: number | null = null,
  forward: boolean | null = true,
  left: boolean | null = null,
  distanceX: number | null = null,
  capture: boolean | null = null,
  safe: boolean = false,
  findThreatened: boolean = false
): Position[] => {
  let validPositions: Position[] = [];
  let block = "";
  let protectingKingFrom: string[] = [];
  kingPositions[white ? "white" : "black"].forEach((pk) => {
    const threat = board.getTile(pk.pos)?.threat as string;
    const search = `${white ? "p" : "v"}${p.str()}`;
    if (threat.includes(search)) {
      threat.split(search).forEach((text, i) => {
        if (i === 0) return;
        const pStr = text.slice(0, threat.indexOf(")"));
        if (!protectingKingFrom.includes(pStr)) protectingKingFrom.push(pStr);
      });
    }
  });
  if (capture === false && findThreatened) return validPositions;
  if (distanceX != null) {
    if (distance == null)
      throw new Error(
        "Tried jumping of the board. Tried jumping on the target tile, because 'distanceX' was set, but located the tile at infinity, because no 'distance' was provided."
      );
    let target: Position = p;
    if (forward != null)
      target = pos.moveVertical(target, white, distance, forward);
    if (left != null)
      target = pos.moveHorizontal(target, white, distanceX, left);
    if (pos.dist(target, p) === 0)
      throw new Error(
        "Tried jumping nowhere. No distances where provided, so the jump landed on the starting tile."
      );
    const tile = board.getTile(target);
    if (!tile || (!findThreatened && safe && checkThreat(tile, white, p)))
      return validPositions;
    if (
      checkKingProtection(p, white, board, target, protectingKingFrom) &&
      (findThreatened ||
        tile.occupied === -1 ||
        figures[tile.occupied].white !== white)
    )
      validPositions.push(target);

    return validPositions;
  }
  const move = getMoveFunction(forward, left);
  let target = p;
  while (distance == null ? true : distance > 0) {
    target = move(target, white, 1);
    if (block) target.condition = block;
    const tile = board.getTile(target);
    if (!tile || (safe && checkThreat(tile, white, p))) {
      if (tile && findThreatened) validPositions.push(target);
      break;
    }
    if (!checkKingProtection(p, white, board, target, protectingKingFrom))
      break;
    validPositions.push(target);
    if (tile.occupied !== -1) {
      if (
        capture === false ||
        (!findThreatened && figures[tile.occupied].white === white)
      )
        validPositions.pop();
      if (findThreatened && block === "")
        block = `${white ? "v" : "p"}${tile.pos.str()}${p.str()}`;
      else break;
    }
    if (!findThreatened && capture === true) {
      if (tile.occupied === -1) validPositions.pop();
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

const createFigure = (type: FigureTypes, white: boolean): Figure => {
  let getValidMoves = (
    pos: Position,
    board: Board,
    findThreatened = false
  ): Position[] => {
    console.log(pos, board, findThreatened);
    return [];
  };
  let movementRules: Rule[] = [];
  let special: Function | null = null;
  switch (type) {
    case FigureTypes.PAWN:
      getValidMoves = function (
        p: Position,
        board: Board,
        findThreatened = false
      ) {
        movementRules = [
          { distance: this.moved ? 1 : 2, forward: true, capture: false },
          { distance: 1, forward: true, left: true, capture: true },
          { distance: 1, forward: true, left: false, capture: true },
        ];
        let validMoves: Position[] = [];
        movementRules.forEach((rule) => {
          validMoves.push(
            ...getTiles(p, this.white, board, ...newRule(rule), findThreatened)
          );
        });
        if (
          board.sprintedPawn &&
          Math.abs(pos.x(board.sprintedPawn, p)) === 1 &&
          pos.dist(board.sprintedPawn, p) === 1
        )
          validMoves.push(pos.moveVertical(board.sprintedPawn, white));
        return validMoves;
      };
      special = async (
        board: Board,
        clickedTile: Tile,
        clickedOn: Tile,
        capturePiece: Function,
        event: MouseEvent
      ) => {
        //en passant
        if (
          board.sprintedPawn &&
          Math.abs(pos.x(clickedTile.pos, clickedOn.pos)) === 1 &&
          pos.dist(clickedTile.pos, board.sprintedPawn) === 1
        ) {
          capturePiece(board.getTile(board.sprintedPawn) as Tile);
        }
        //sprintedPawn
        capturePiece(clickedOn);
        board.sprintedPawn = null;
        if (Math.abs(pos.y(clickedTile.pos, clickedOn.pos)) === 2) {
          board.sprintedPawn = clickedOn.pos;
        }
        //promotion
        if (clickedOn.pos.y === (white ? 0 : board.height - 1)) {
          const options = [
            FigureTypes.QUEEN,
            FigureTypes.BISHOP,
            FigureTypes.KNIGHT,
            FigureTypes.ROOCK,
          ];
          const res = await createConfirm(
            "promotion",
            pos.new(event.clientX, event.clientY),
            ...options.map((type) => FigureTypes[type])
          );
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
      getValidMoves = function (
        p: Position,
        board: Board,
        findThreatened = false
      ) {
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
        let validMoves: Position[] = [];
        movementRules.forEach((rule) => {
          validMoves.push(
            ...getTiles(p, this.white, board, ...newRule(rule), findThreatened)
          );
        });
        const castle = (left: boolean) => {
          if (board.getTile(p)?.threat.includes(white ? "b" : "w")) return;
          const tile = board.getTile(
            pos.new(left ? 0 : board.width - 1, white ? board.height - 1 : 0)
          );
          if (tile && tile.occupied !== -1) {
            const roock = figures[tile.occupied];
            if (
              !roock.moved &&
              !this.moved &&
              getTiles(
                p,
                white,
                board,
                ...newRule({
                  left: this.white === left,
                  capture: false,
                  safe: true,
                })
              ).length === (left ? 3 : 2)
            )
              validMoves.push(
                pos.moveHorizontal(p, white, 2, this.white === left)
              );
          }
        };
        castle(true);
        castle(false);
        return validMoves;
      };
      special = (board: Board, clickedTile: Tile, clickedOn: Tile) => {
        const dist = pos.x(clickedTile.pos, clickedOn.pos) / 2;
        const white = figures[clickedTile.occupied].white;
        if (dist !== 1 && dist !== -1) return;
        const left = dist > 0 ? true : false;
        const target = board.getTile(
          pos.new(left ? 0 : board.width - 1, white ? board.height - 1 : 0)
        );
        if (!target) return;
        const rook = target.occupied;
        target.occupied = -1;
        const t = board.getTile(pos.add(clickedOn.pos, pos.new(dist, 0)));
        if (!t) return;
        t.occupied = rook;
        archiveTurn(
          { ...figures[clickedTile.occupied] },
          clickedTile.pos,
          clickedOn.pos,
          null,
          board.sprintedPawn,
          {
            figure: { ...figures[rook] },
            from: target.pos,
            to: t.pos,
            capture: null,
            sprintedPawn: null,
            castle: null,
          }
        );
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
    getValidMoves = function (
      p: Position,
      board: Board,
      findThreatened = false
    ) {
      let validMoves: Position[] = [];
      movementRules.forEach((rule) => {
        validMoves.push(
          ...getTiles(p, this.white, board, ...newRule(rule), findThreatened)
        );
      });
      return validMoves;
    };
  return { getValidMoves, type, white, moved: false, special };
};

const createFigures = (
  setup: [FigureTypes, boolean][] = [
    [FigureTypes.PAWN, true] as [FigureTypes, boolean],
    [FigureTypes.PAWN, true] as [FigureTypes, boolean],
    [FigureTypes.PAWN, true] as [FigureTypes, boolean],
    [FigureTypes.PAWN, true] as [FigureTypes, boolean],
    [FigureTypes.PAWN, true] as [FigureTypes, boolean],
    [FigureTypes.PAWN, true] as [FigureTypes, boolean],
    [FigureTypes.PAWN, true] as [FigureTypes, boolean],
    [FigureTypes.PAWN, true] as [FigureTypes, boolean],
    [FigureTypes.ROOCK, true] as [FigureTypes, boolean],
    [FigureTypes.KNIGHT, true] as [FigureTypes, boolean],
    [FigureTypes.BISHOP, true] as [FigureTypes, boolean],
    [FigureTypes.QUEEN, true] as [FigureTypes, boolean],
    [FigureTypes.KING, true] as [FigureTypes, boolean],
    [FigureTypes.BISHOP, true] as [FigureTypes, boolean],
    [FigureTypes.KNIGHT, true] as [FigureTypes, boolean],
    [FigureTypes.ROOCK, true] as [FigureTypes, boolean],
    [FigureTypes.PAWN, false] as [FigureTypes, boolean],
    [FigureTypes.PAWN, false] as [FigureTypes, boolean],
    [FigureTypes.PAWN, false] as [FigureTypes, boolean],
    [FigureTypes.PAWN, false] as [FigureTypes, boolean],
    [FigureTypes.PAWN, false] as [FigureTypes, boolean],
    [FigureTypes.PAWN, false] as [FigureTypes, boolean],
    [FigureTypes.PAWN, false] as [FigureTypes, boolean],
    [FigureTypes.PAWN, false] as [FigureTypes, boolean],
    [FigureTypes.ROOCK, false] as [FigureTypes, boolean],
    [FigureTypes.KNIGHT, false] as [FigureTypes, boolean],
    [FigureTypes.BISHOP, false] as [FigureTypes, boolean],
    [FigureTypes.QUEEN, false] as [FigureTypes, boolean],
    [FigureTypes.KING, false] as [FigureTypes, boolean],
    [FigureTypes.BISHOP, false] as [FigureTypes, boolean],
    [FigureTypes.KNIGHT, false] as [FigureTypes, boolean],
    [FigureTypes.ROOCK, false] as [FigureTypes, boolean],
  ]
): Figure[] => {
  return setup.map((x) => createFigure(x[0], x[1]));
};

export { createFigure, createFigures, FigureTypes, Figure };
