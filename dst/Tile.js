import pos from "./Position.js";
const tile = {
    new: (x, y, white) => {
        return {
            pos: pos.new(x, y),
            white,
            highlighted: false,
            threatened: false,
            clicked: false,
            occupied: -1,
        };
    },
};
export default tile;
