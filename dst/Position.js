const posToString = (pos, direction = null) => {
    return `(${pos.x},${pos.y}${direction ? `/${direction}` : ""})`;
};
const pos = {
    new: (x, y) => {
        return {
            x,
            y,
            str: function (direction = null) {
                return posToString(this, direction);
            },
        };
    },
    add: (a, b) => {
        return {
            x: a.x + b.x,
            y: a.y + b.y,
            str: function (direction = null) {
                return posToString(this, direction);
            },
        };
    },
    scale: (a, b) => {
        return {
            x: a * b.x,
            y: a * b.y,
            str: function (direction = null) {
                return posToString(this, direction);
            },
        };
    },
    dist: (a, b) => {
        return Math.abs(pos.y(a, b)) + Math.abs(pos.x(a, b));
    },
    y: (...positions) => {
        return positions.reduce((last, cur, i) => last + (i % 2 === 0 ? 1 : -1) * cur.y, 0);
    },
    x: (...positions) => {
        return positions.reduce((last, cur, i) => last + (i % 2 === 0 ? 1 : -1) * cur.x, 0);
    },
    moveVertical: (p, white, distance = 1, forward = true) => {
        return pos.add(p, pos.scale(white === forward ? -1 : 1, pos.new(0, distance)));
    },
    moveHorizontal: (p, white, distance = 1, left = true) => {
        return pos.add(p, pos.scale(white === left ? -1 : 1, pos.new(distance, 0)));
    },
    moveDiagonal: (p, white, distance = 1, forward = true, left = true) => {
        return pos.moveHorizontal(pos.moveVertical(p, white, distance, forward), white, distance, left);
    },
};
export default pos;
