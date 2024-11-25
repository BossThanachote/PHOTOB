import { proxy, subscribe } from "valtio";  
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
   intro: typeof window !== 'undefined' ? Number(localStorage.getItem('currentIntro')) || 1 : 1,
   color: "#EFBD48",
   editedImageUrl: '',
   selectedDiv: 1,
   quantity: 1,
   language: "EN", 
   currentColorIndex: 0,
   currentColorIndexBorder: 0,
   colors: mockColors,
   colorsBorder: mockColorsBorder,
   selectedImages: [] as string[],
   bgColorColor: "#DD6287",
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
       state.bgColorGray = newColor;
       state.filterColor = `opacity(0.7) drop-shadow(0 0 0 ${newColor})`;
   },

   resetSelfieData: () => {
       state.selfieData.step = 1;
       state.selfieData.countdown = 12;
       state.selfieData.doneDelay = false;
       state.selfieData.isExiting = false;
       state.shortenedURL = '';
       state.quantity = 1;
   }
});

if (typeof window !== 'undefined') {
   subscribe(state, () => {
       localStorage.setItem('currentIntro', state.intro.toString());
   });
}

export default state;