'use client'
import { motion,AnimatePresence } from "framer-motion";
import { BiSolidLeftArrow } from "react-icons/bi";
import { BiSolidRightArrow } from "react-icons/bi";
import state from "../store";
import { useSnapshot } from "valtio";
import { useState } from "react";
import { div } from "framer-motion/client";

export default function Selfie(){
    const snap = useSnapshot(state);
    const [isExiting, setIsExiting] = useState(false); 

    return(
    <>
        <AnimatePresence>
        {snap.intro == 3 &&(
          <div 
          className="w-screen h-screen border-red-500 bg-[#222222] border-2 flex justify-center items-center cursor-pointer relative"
          >
                hello
          </div>
        )}
        </AnimatePresence>
    </>
    )
}