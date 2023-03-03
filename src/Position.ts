type Position = {
  x: number;
  y: number;
  str: (direction?: string | null) => string;
  condition?: string;
  direction?: string;
};

const posToString = (
  pos: Position,
  direction: string | null = null
): string => {
  return `(${pos.x},${pos.y}${direction ? `/${direction}` : ""})`;
};

const pos = {
  new: (x: number, y: number): Position => {
    return {
      x,
      y,
      str: function (direction: string | null = null) {
        return posToString(this, direction);
      },
    };
  },
  add: (a: Position, b: Position): Position => {
    return {
      x: a.x + b.x,
      y: a.y + b.y,
      str: function (direction: string | null = null) {
        return posToString(this, direction);
      },
    };
  },
  scale: (a: number, b: Position): Position => {
    return {
      x: a * b.x,
      y: a * b.y,
      str: function (direction: string | null = null) {
        return posToString(this, direction);
      },
    };
  },
  dist: (a: Position, b: Position): number => {
    return Math.abs(pos.y(a, b)) + Math.abs(pos.x(a, b));
  },
  y: (...positions: Position[]): number => {
    return positions.reduce(
      (last, cur, i) => last + (i % 2 === 0 ? 1 : -1) * cur.y,
      0
    );
  },
  x: (...positions: Position[]): number => {
    return positions.reduce(
      (last, cur, i) => last + (i % 2 === 0 ? 1 : -1) * cur.x,
      0
    );
  },
  moveVertical: (
    p: Position,
    white: boolean,
    distance: number = 1,
    forward: boolean = true
  ): Position => {
    return pos.add(
      p,
      pos.scale(white === forward ? -1 : 1, pos.new(0, distance))
    );
  },
  moveHorizontal: (
    p: Position,
    white: boolean,
    distance: number = 1,
    left: boolean = true
  ): Position => {
    return pos.add(p, pos.scale(white === left ? -1 : 1, pos.new(distance, 0)));
  },
  moveDiagonal: (
    p: Position,
    white: boolean,
    distance: number = 1,
    forward: boolean = true,
    left: boolean = true
  ) => {
    return pos.moveHorizontal(
      pos.moveVertical(p, white, distance, forward),
      white,
      distance,
      left
    );
  },
};

export default pos;
export { Position };
