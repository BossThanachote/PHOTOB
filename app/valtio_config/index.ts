import { proxy } from "valtio";
import Quantity from "../pages_event/Quantity";

const state = proxy({
    intro: 1,
    color: "#EFBD48",
    selectedDiv: 1,
    quantity : 1,
    language: "EN",
    selfieData: {
        step: 1,
        countdown: 12,
        doneDelay: false,
        isExiting: false
    },
    resetSelfieData: () => {
        state.selfieData.step = 1; // รีเซ็ต step
        state.selfieData.countdown = 12; // รีเซ็ต countdown
        state.selfieData.doneDelay = false; // รีเซ็ต doneDelay
        state.selfieData.isExiting = false; // รีเซ็ต isExiting
        state.quantity = 1;
    }
});

export default state;
