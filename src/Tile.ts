import pos, { Position } from "./Position.js";

type Tile = {
  pos: Position;
  white: boolean;
  highlighted: boolean;
  threatened: boolean;
  clicked: boolean;
  occupied: number;
  threat: string;
};

const tile = {
  new: (x: number, y: number, white: boolean): Tile => {
    return {
      pos: pos.new(x, y),
      white,
      highlighted: false,
      threatened: false,
      clicked: false,
      occupied: -1,
      threat: "",
    };
  },
};

export default tile;
export { Tile };
