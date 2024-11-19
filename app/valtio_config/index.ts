import { proxy } from "valtio";
import Quantity from "../pages_event/Quantity";
import { colors as mockColors } from '../MockAPI/MockFrameColor';
import { colorsBorder as mockColorsBorder } from "../MockAPI/MockBorderColor";
import { filter } from "framer-motion/client";
import { colorsBorder } from "../MockAPI/MockBorderColor";

interface DropItem {
    id: number;
    src: string;
    alt: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }

const state = proxy({
    intro: 1,
    color: "#EFBD48",
    editedImageUrl: '',
    selectedDiv: 1,
    quantity : 1,
    language: "EN",
    currentColorIndex: 0,  // เพิ่มค่า currentColorIndex
    currentColorIndexBorder: 0,
    colors: mockColors,
    colorsBorder: mockColorsBorder,
    selectedImages: [] as string[],
    bgColorColor: "#DD6287",  // เพิ่มค่า bgColorColor
    bgColorGray: "#C7C7CC",
    filterColor: `opacity(0.7) drop-shadow(0 0 0 #C7C7CC)`,
    imageSrcs: [] as string[],
    selectedColorFilter: "rgba(0,0,0,0)",
    droppedImages: [] as DropItem[],
    savedDropAreaImage: null as string | null,
    shortenedURL: '',
    selfieData: {
        step: 1,
        countdown: 12,
        doneDelay: false,
        isExiting: false
    },

    updateFilterColor(newColor: string) {
        state.bgColorGray = newColor; // เปลี่ยนค่า bgColorGray
        state.filterColor = `opacity(0.7) drop-shadow(0 0 0 ${newColor})`; // อัพเดท filterColor ด้วยสีใหม่
    },

    resetSelfieData: () => {
        state.selfieData.step = 1; // รีเซ็ต step
        state.selfieData.countdown = 12; // รีเซ็ต countdown
        state.selfieData.doneDelay = false; // รีเซ็ต doneDelay
        state.selfieData.isExiting = false; // รีเซ็ต isExiting
        state.shortenedURL = '';
        state.quantity = 1;
    }
});

export default state;
