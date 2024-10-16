import { proxy } from "valtio";

const state = proxy({
    intro: 1,
    color: "#EFBD48",
    selectedDiv: 1,
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
    }
});

export default state;
