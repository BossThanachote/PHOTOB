'use client'
import { motion, AnimatePresence } from "framer-motion";
import state from "../valtio_config";
import { useSnapshot } from "valtio";
import { IoIosArrowDropleft } from "react-icons/io";
import { IoIosArrowDropright } from "react-icons/io";
import Image from "next/image";
import { useState, useEffect } from "react";
import { div } from "framer-motion/client";
import { DropArea } from "./Custom";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from 'react-dnd-html5-backend';

export default function Quantity(){
    
    const [isVisible, setIsVisible] = useState(false); 
    const snap = useSnapshot(state);

    const [quantity, setQuantity] = useState(1); // เริ่มต้นที่ 1

    const handleDecrease = () => {
      if (snap.quantity > 1) {
          state.quantity -= 1;
      }
  };

  const handleIncrease = () => {
      state.quantity += 1;
  };

    const handleNext = () => {
        setIsVisible(false); 
        
        setTimeout(() => {
            state.intro = 9; 
            setIsVisible(true); 
        }, 1200); 
    };

    const handleBack = () => {
        
    
        setIsVisible(false); 
    
        setTimeout(() => {
            state.intro = 7; // กลับไปที่หน้าก่อนหน้า
            setIsVisible(true); 
        }, 1200);
        
    const exitAnimation = {
        scale: [1, 1.2, 0],
        opacity: [1, 0.5, 0],
        transition: {
          duration: 0.5,
          ease: "easeInOut"
        },
      };

    };
    useEffect(() => {
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1500);
        return () => clearTimeout(timer);
      }, []);
      console.log("Colors in Quantity.tsx:", snap.colors);
    return(
        <>
        <DndProvider backend={HTML5Backend}>
            <AnimatePresence> 
            {snap.intro == 8 &&  isVisible && (
                <div className="w-screen h-screen flex flex-col justify-between border-transparent border-2 bg-[#F7F7F7] select-none">
                     <div className="flex justify-center items-center w-full px-10 md:hidden pt-4 border-b border-transparent">
                        <motion.p 
                            className="font-bebas-neue-400 md:text-[1.7rem] text-[1.3rem] lg:text-[2rem] select-none text-center"
                            style={{ letterSpacing: '10px' }}
                            initial={{ y: -100, opacity: 0 }} 
                          animate={{ y: 0, opacity: 1 }} 
                          transition={{
                            type: "spring",
                            damping: 5,
                            stiffness: 30,
                            duration: 0.1,
                            ease: "easeInOut",
                            delay: 1
                          }}
                          exit={{
                            y: -200, 
                            opacity: 0, 
                            transition: {
                              opacity: { duration: 1, ease: "easeOut" },
                              duration: 0.3,
                              ease: "backIn", 
                            },
                          }}
                          >
                            QUANTITY
                          </motion.p>
                        </div>
                      
                        <motion.div className="flex justify-between items-center w-full px-10 py-3 border-b border-transparent"
                          initial={{ y: -100, opacity: 0 }} 
                          animate={{ y: 0, opacity: 1 }} 
                          transition={{
                            type: "spring",
                            damping: 5,
                            stiffness: 30,
                            duration: 0.1,
                            ease: "easeInOut",
                            delay: 1
                          }}
                          exit={{
                            y: -200, 
                            opacity: 0, 
                            transition: {
                              opacity: { duration: 1, ease: "easeOut" },
                              duration: 0.3,
                              ease: "backIn", 
                            },
                          }}
                        >
                          <button 
                            className="font-inter-400 lg:text-xl text-[#666666] bg-white py-4 px-4 sm:py-4 sm:px-8 rounded-2xl flex items-center"
                            onClick={handleBack}
                          >
                            <IoIosArrowDropleft 
                            className="w-[1.5rem] h-[1.5rem] mr-4 text-black"
                            />
                            Back
                          </button>
                          <p 
                            className="font-bebas-neue-400 md:text-[1.7rem] sm:text-[1.2rem] hidden md:block lg:text-[2rem] select-none"
                            style={{ letterSpacing: '10px' }}
                          >
                            QUANTITY
                          </p>
                          <button 
                            className="font-inter-400 lg:text-xl text-white bg-[#222222] py-4 px-4 sm:py-4 sm:px-8 rounded-2xl flex items-center"
                            onClick={handleNext}
                          >
                            Next
                            <IoIosArrowDropright 
                            className="w-[1.5rem] h-[1.5rem] ml-4 text-white"
                            />
                          </button>
                        </motion.div>

                        <motion.div
                            className="w-full h-full flex flex-col lg:flex-row  lg:justify-center items-center lg:gap-[2rem] relative border-2 border-transparent select-none"
                            initial={{ scale: 0, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            transition={{
                              type: 'spring',
                              stiffness: 300,
                              damping: 20,
                              delay:1,
                            }}
                            exit={{
                              scale: 0, 
                              opacity: 0, 
                              transition: {
                                opacity: { duration: 0.3, ease: "easeOut" },
                                duration: 0.3,
                                ease: "easeInOut", 
                              },
                            }}
                        >
                            <div className="xl:w-[30rem] xl:h-[44rem] lg:w-[20rem] lg:h-[44rem] hidden lg:block border-2 border-transparent flex justify-center items-center">
                                <div className="w-full h-full justify-center items-center border-2 border-transparent flex flex-col gap-5">
                                    <div className="border-2 border-transparent w-[21rem] flex gap-2 items-center font-inter-400 text-2xl">
                                        <Image src="/quan.png" alt="" width={10000} height={10000} className="w-7 h-7 bg-white"></Image>
                                        <div>Quantity</div>
                                    </div>
                                    <div className="border-2 border-transparent flex items-center gap-5">
                                        <div 
                                            className="w-24 h-24 bg-white rounded-full shadow-md flex justify-center items-center" 
                                            onClick={handleDecrease}
                                            >
                                                <div className="w-[2rem] h-[5px] bg-black rounded-full"></div>
                                        </div>

                                        <div className="w-[7rem] h-[4.5rem] bg-gray-300 rounded-2xl flex justify-center items-center text-2xl font-inter-400 text-white">
                                            {snap.quantity}
                                        </div>

                                        <div 
                                            className="w-24 h-24 bg-[#222222] rounded-full shadow-md flex justify-center text-center items-center text-white" 
                                            onClick={handleIncrease}
                                            >
                                            <div className="w-[2rem] h-[4px] bg-white rounded-full"></div>
                                            <div className="w-[2rem] h-[4px] bg-white rounded-full absolute" style={{ transform: 'rotate(90deg)' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>                         
                                <DropArea 
                                    currentColorIndex={snap.currentColorIndex} 
                                    colors={[...snap.colors]}
                                    bgColorColor={snap.bgColorColor} 
                                    bgColorGray={snap.bgColorGray}
                                    droppedImages={[...(snap.droppedImages || [])]}
                                />
                            {/* <div className="w-[30rem] lg:h-[44rem] md:h-[40rem] h-[40rem]  border-[1px] border-[#C6C6C980] flex justify-center items-center bg-white">
                                <div className="w-[95%] h-[95%] border-[1px] border-transparent flex-col flex ">
                                    <div className="flex flex-col border-[1px] border-transparent lg:h-[10rem] h-[7rem]">
                                        <div className="w-full h-[10%] border-[1px] border-transparent flex justify-end pt-2 pr-2">
                                            <Image src="/sun.png" alt="sun" width={1000} height={1000} className="w-[2rem] h-[2rem]"></Image>
                                        </div>
                                        <div className="w-full h-[80%] border-[1px] border-transparent flex justify-center items-center pt-[3rem] lg:pt-[3rem] font-dream-sparks-400 text-[3rem] lg:text-[3rem]">
                                            <Image src="/moon.png" alt="" width={1000} height={1000} className="w-[2rem] h-[2.2rem] absolute mr-[18rem] mb-[8rem]"></Image>
                                            <p className="text-black absolute z-0">HAPPY DAY</p>
                                            <p className="text-white absolute z-10 ml-[0.3rem] mt-[0.2rem] text-shadow-black-2">HAPPY DAY</p>
                                        </div>
                                        <div className="w-full h-[10%] border-[1px] border-transparent flex justify-end pb-[1.8rem] pr-2">
                                            <Image src="/cloud-q.png" alt="cloud" width={1000} height={1000} className="w-[1.5rem] h-[1rem] absolute"></Image>
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-center items-center border-[1px] gap-4 border-transparent h-[32rem] mb-[1rem]">
                                        <div className="w-full lg:h-[20rem] h-[15rem] border-[1px] border-transparent flex gap-4 justify-center items-center">
                                            <div className="bg-[#C7C7CC] lg:w-[13rem] lg:h-[16rem] w-[13rem] h-[15rem] flex justify-center items-center">
                                                <Image src="/picture.png" alt="" width={1000} height={1000} className="w-[1.5rem] h-[1.5rem]"></Image>
                                            </div>
                                            <div className="bg-[#C7C7CC] lg:w-[13rem] lg:h-[16rem] w-[13rem] h-[15rem] flex justify-center items-center">
                                                <Image src="/picture.png" alt="" width={1000} height={1000} className="w-[1.5rem] h-[1.5rem]"></Image>
                                            </div>
                                        </div>
                                        <div className="w-full lg:h-[20rem] h-[15rem] border-[1px] border-transparent flex gap-4 justify-center items-center">
                                            <div className="bg-[#C7C7CC] lg:w-[13rem] lg:h-[16rem] w-[13rem] h-[15rem] flex justify-center items-center">
                                                <Image src="/picture.png" alt="" width={1000} height={1000} className="w-[1.5rem] h-[1.5rem]"></Image>
                                            </div>
                                            <div className="bg-[#C7C7CC] lg:w-[13rem] lg:h-[16rem] w-[13rem] h-[15rem] flex justify-center items-center">
                                                <Image src="/picture.png" alt="" width={1000} height={1000} className="w-[1.5rem] h-[1.5rem]"></Image>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div> */}
                            <div className="xl:w-[30rem] xl:h-[44rem] lg:w-[20rem] lg:h-[44rem] w-[30rem] h-[5rem]  border-2 border-transparent">
                            <div className="w-full h-full justify-center items-center border-2 border-transparent flex flex-col lg:hidden ">
                                    <div className="border-2 border-transparent flex items-center gap-5">
                                        <Image src="/quan.png" alt="" width={10000} height={10000} className="w-6 h-6 bg-white"></Image>
                                        <div className="text-lg font-inter-400">Quantity</div>
                                        <div 
                                            className="w-12 h-12 bg-white rounded-full shadow-md flex justify-center items-center" 
                                            onClick={handleDecrease}
                                            >
                                                <div className="w-[1rem] h-[5px] bg-black rounded-full"></div>
                                        </div>

                                        <div className="w-[5rem] h-[2.5rem] bg-gray-300 rounded-2xl flex justify-center items-center text-2xl font-inter-400 text-white">
                                            {quantity}
                                        </div>

                                        <div 
                                            className="w-12 h-12 bg-[#222222] rounded-full shadow-md flex justify-center text-center items-center text-white" 
                                            onClick={handleIncrease}
                                            >
                                            <div className="w-[1.5rem] h-[4px] bg-white rounded-full"></div>
                                            <div className="w-[1.5rem] h-[4px] bg-white rounded-full absolute" style={{ transform: 'rotate(90deg)' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                </div>
            )}
            </AnimatePresence>
            </DndProvider>
        </>
    )
}