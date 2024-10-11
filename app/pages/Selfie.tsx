'use client'
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi";
import state from "../store";
import { useSnapshot } from "valtio";
import Image from "next/image";

export default function Selfie() {
    const snap = useSnapshot(state);
    const [isExiting, setIsExiting] = useState(false); 
    const [countdown, setCountdown] = useState(12); // เริ่มที่เลข 12
    const [currentStep, setCurrentStep] = useState(1); // เริ่มที่ 1/6
    const [doneDelay, setDoneDelay] = useState(false); // ใช้สำหรับหน่วงเวลาเมื่อ DONE!

    // useEffect สำหรับการนับถอยหลัง
    useEffect(() => {
        // ตรวจสอบว่า snap.intro เท่ากับ 3 แล้วเริ่มการนับถอยหลัง
        if (snap.intro === 3) {
            if (currentStep <= 6) {
                if (countdown > 0) {
                    const timer = setTimeout(() => setCountdown(countdown - 1), 1000); // นับถอยหลังทีละวินาที
                    return () => clearTimeout(timer);
                } else {
                    // ถ้านับถึง 0 แล้ว ให้รีเซ็ต countdown กลับเป็น 12 และเพิ่มขั้นตอน
                    setCountdown(12);
                    setCurrentStep(prev => prev + 1);
                }
            } else if (currentStep > 6 && !doneDelay) {
                // ถ้า currentStep เกิน 6 และยังไม่ได้เริ่มหน่วงเวลา
                setDoneDelay(true);
                setTimeout(() => {
                    // หน่วงเวลา 2 วินาทีแล้วเปลี่ยนเป็น snap.intro = 4
                    state.intro = 4;
                }, 2000);
            }
        }
    }, [snap.intro, countdown, currentStep, doneDelay]); // ทำงานทุกครั้งที่ snap.intro, countdown หรือ currentStep เปลี่ยน
    
    const exitAnimation = {
        scale: [1, 1.2, 0],
        opacity: [1, 0.5, 0],
        transition: {
          duration: 0.5,
          ease: "easeInOut"
        },
    };

    return (
        <>
            <AnimatePresence>
                {snap.intro == 3 && (
                    <motion.div 
                        className="w-screen h-screen border-transparent border-2 flex flex-col lg:flex-row justify-center items-center relative select-none"
                        animate={{ backgroundColor: "#222222" }} 
                        initial={{ backgroundColor: "#F7F7F7" }} 
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        exit={exitAnimation} 
                    >
                        {/* ส่วนของเลข 12 และสัดส่วน */}
                        <div className="md:w-[27rem] md:h-[10rem] sm:w-[24rem] sm:h-[10rem] w-[20rem] h-[10rem] flex justify-center items-center border-2 border-transparent lg:hidden">
                            <div className="md:w-[8.5rem] md:h-[8.5rem] sm:w-[8rem] sm:h-[8rem] w-[8rem] h-[8rem] bg-[#8E8E93] rounded-full flex justify-center items-center">
                                <p className="font-bebas-neue-400 text-white md:text-[3.5rem] text-[2.5rem] ">
                                    {currentStep > 6 ? "DONE!" : countdown}
                                </p>
                            </div>
                        </div>
                        
                        <div className="xl:w-[30rem] lg:w-[20rem] hidden lg:block"></div>
                        
                        <div className="flex justify-center items-center xl:w-[36rem] xl:h-[48rem] lg:w-[27rem] lg:h-[39rem] md:w-[27rem] md:h-[39rem] sm:w-[24rem] sm:h-[36rem] w-[20rem] h-[32rem] bg-[#F7F7F7] select-none">
                            <Image src="/capture.png" alt="capture" width={1000} height={1000}
                                className="w-[5rem] h-[5rem]"
                            >
                            </Image>
                        </div>
                        
                        {/* แสดง countdown และ currentStep */}
                        <div className="md:w-[27rem] md:h-[10rem] sm:w-[24rem] sm:h-[10rem] w-[20rem] h-[10rem] border-2 md:text-[3.5rem] text-[2.5rem] flex flex-col items-center justify-center border-transparent lg:hidden">
                            <p className="font-bebas-neue-400 text-white">
                                {currentStep > 6 ? "DONE!" : `${currentStep}/6`}
                            </p>
                            <p className="font-inter-400 md:text-[1.1rem] text-[1rem] text-center text-white">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
                        </div>
                        
                        <div className="xl:w-[30rem] xl:h-[48rem] lg:w-[20rem] lg:h-[39rem] hidden lg:block border-2 border-transparent flex flex-col">
                            <div className="w-full flex">
                                <div className="w-[50%] h-[15rem] border-transparent border-2 xl:text-[5.5rem] lg:text-[4rem] pl-10">
                                    <p className="font-bebas-neue-400 text-white">
                                        {currentStep > 6 ? "DONE!" : `${currentStep}/6`}
                                    </p>
                                </div>
                                <div className="w-[50%] h-[15rem] border-transparent border-2 flex justify-center">
                                    <div className="xl:w-[12.5rem] xl:h-[12.5rem] lg:w-[8rem] lg:h-[8rem] bg-[#8E8E93] rounded-full flex justify-center items-center">
                                        <p className="font-bebas-neue-400 text-white xl:text-[3.5rem] lg:text-[2.5rem]">
                                            {currentStep > 6 ? "DONE!" : countdown}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="w-[80%] xl:h-[25rem] lg:h-[18rem] border-transparent border-2 flex items-end xl:mb-[10rem] lg:mb-[7rem] lg:ml-[2rem] xl:ml-[2rem] text-start text-white font-inter-400">
                                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
