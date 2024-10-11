import { proxy } from "valtio";

const state = proxy ({
    intro: 1,
    color: "#EFBD48",
});

export default state;