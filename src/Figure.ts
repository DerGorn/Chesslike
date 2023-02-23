import { Board } from "./Board.js";
import pos, { Position } from "./Position.js";
import { figures } from "./index.js";

enum FigureTypes {
  PAWN,
  ROOCK,
  KNIGHT,
  BISHOP,
  KING,
  QUEEN,
}

type Figure = {
  getValidMoves: (pos: Position, board: Board) => Position[];
  type: FigureTypes;
  white: boolean;
  moved: boolean;
};

const createFigure = (type: FigureTypes, white: boolean): Figure => {
  let getValidMoves = (pos: Position, board: Board): Position[] => {
    console.log(pos, board);
    return [];
  };
  switch (type) {
    case FigureTypes.PAWN:
      getValidMoves = function (p: Position, board: Board) {
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
        if (
          pieceLeft &&
          pieceLeft.occupied !== -1 &&
          figures[pieceLeft.occupied].white !== this.white
        )
          validMoves.push(left);
        const right = pos.moveDiagonal(p, this.white, 1, true, false);
        const pieceRight = board.getTile(right);
        if (
          pieceRight &&
          pieceRight.occupied !== -1 &&
          figures[pieceRight.occupied].white !== this.white
        )
          validMoves.push(right);
        if (
          board.sprintedPawn &&
          Math.abs(pos.x(board.sprintedPawn, p)) === 1 &&
          pos.dist(board.sprintedPawn, p) === 1
        )
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

const createFigures = (): Figure[] => {
  return [
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
  ].map((x) => createFigure(x[0], x[1]));
};

export { createFigure, createFigures, FigureTypes };
