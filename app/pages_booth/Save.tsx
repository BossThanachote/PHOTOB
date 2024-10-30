'use client'
import { motion, AnimatePresence } from "framer-motion";
import state from "../valtio_config";
import { useSnapshot } from "valtio";
import { IoIosArrowDropleft } from "react-icons/io";
import { IoIosArrowDropright } from "react-icons/io";
import Image from "next/image";
import { useState, useEffect } from "react";
import { div } from "framer-motion/client";
import { QRCode } from 'antd';

const getCurrentTime = () => {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export default function Save(){

    const [isVisible, setIsVisible] = useState(false);
    const [isTimeout, setIsTimeout] = useState(false); 
    const [currentTime, setCurrentTime] = useState(getCurrentTime());
    const snap = useSnapshot(state);

    useEffect(() => {
      const timer = setInterval(() => {
          setCurrentTime(getCurrentTime()); // อัปเดตเวลาทุกวินาที
      }, 1000);

      return () => clearInterval(timer); // ล้าง interval เมื่อ component ถูก unmount
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    // เมื่อ state.intro = 5 ให้เริ่มการนับถอยหลัง
    if (snap.intro === 9) {
        setIsVisible(true); 
        timer = setInterval(() => {
        }, 1000);
    } else {
        if (timer) clearInterval(timer); 
    }
    return () => {
        if (timer) clearInterval(timer);
    };
}, [snap.intro]);

    const handleBack = () => {
        state.resetSelfieData(); // เรียกฟังก์ชันรีเซ็ตสถานะ
    
        setIsVisible(false); 
     
        setIsTimeout(false); // ซ่อน Timeout หากมีการกดปุ่ม
        setTimeout(() => {
            state.intro = 9; // กลับไปที่หน้าก่อนหน้า
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


    
    const handleSavePhoto = () => {
        if (snap.savedDropAreaImage) {
            const link = document.createElement('a'); // สร้าง element ลิงก์
            link.href = snap.savedDropAreaImage; // ตั้งค่า href เป็น URL ของภาพ
            link.download = 'saved-photo.png'; // ตั้งชื่อไฟล์ที่ต้องการดาวน์โหลด
            link.click(); // จำลองการคลิกเพื่อลดาวน์โหลด
        } else {
            console.log("No saved image available to download.");
        }
    };
    return(
        <>
            <AnimatePresence> 
            {snap.intro == 10 &&  isVisible && (
                <div className="w-[100%]  flex flex-col justify-between border-red-500 bg-[#F7F7F7] select-none">
                     <div className="flex justify-center items-center w-full px-10 md:hidden pt-4 border-b border-transparent">
                        
                        </div>
                      
                        <motion.div className="flex justify-between abosolute z-10 items-center w-full px-10 py-3 border-b border-transparent"
                            initial={{ y: -100, opacity: 0 }} 
                            animate={{ y: 0, opacity: 1 }} 
                            transition={{
                              type: 'spring',
                              stiffness: 300,
                              damping: 20,
                              delay:1,
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
                           
                          <div 
                            className="font-inter-400 lg:text-xl bg-transparent py-4 px-4 sm:py-4 sm:px-8 rounded-2xl flex items-center"
                            
                          >
                            
    
                          </div>
                        </motion.div>

                        <motion.div
                            className="w-full h-full flex flex-col lg:flex-row absolute lg:justify-center items-center lg:gap-[2rem] border-2 border-transparent select-none"
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
                                    
                                </div>
                            </div>
                            <div className="w-[30rem] h-[8rem] border-4 mb-10 border-transparent lg:hidden flex justify-center items-center ">
                               
                            </div>
                            <div className="lg:w-[25rem] lg:h-[50.5rem] md:h-[40rem] lg:mt-0 mt-[8rem] h-[40rem] absolute border-[1px] z-0 border-transparent flex justify-center items-center">
                                <div className="lg:w-[19rem] w-[17rem] h-10 border-2 border-transparent absolute flex justify-between mb-[35rem] lg:mb-[44rem] z-10">
                                  <div className="w-[6rem] h-full border-2 border-transparent flex justify-center items-center gap-2 font-sf-400 text-sm font-extralight">
                                    {currentTime}
                                  </div>
                                  <div className="w-[6rem] h-full border-2 border-transparent flex justify-center items-center gap-2">
                                    <Image src="/MobileSignal.png" alt="" width={10000} height={10000} className="h-3 w-[1.125rem]"/>
                                    <Image src="/Wifi.png" alt="" width={10000} height={10000} className="h-3 w-[1.125rem]"/>
                                    <Image src="/battery.png" alt="" width={10000} height={10000} className="h-3 w-[1.125rem]"/>
                                  </div>
                                </div>
                                <Image src="/iPhone15.png" alt="" width={10000} height={10000} className="w-full h-full abosolute z-10" />
                                {snap.savedDropAreaImage ? (
                                // แสดงภาพที่บันทึกไว้
                                <img src={snap.savedDropAreaImage} alt="Saved DropArea" className="lg:w-[20rem] w-[15rem] absolute z-20 h-auto" />
                            ) : (
                                // ถ้าไม่มีภาพที่บันทึกไว้ ก็จะไม่แสดง DropArea อีก
                                <p className="text-center text-gray-500">No saved image available.</p>
                            )}
                                <div className="lg:w-[10rem] w-[5rem] h-[0.3rem] bg-black rounded-full absolute z-30 mt-[36.5rem] lg:mt-[46rem]"></div>
                                <div className="lg:w-[18rem] w-[15rem] h-[3.2rem] rounded-xl bg-[#8E8E93] absolute z-20 mt-[30rem] lg:mt-[40rem] flex justify-center items-center gap-2 font-inter-400 text-white cursor-pointer text-xs lg:text-base"
                                onClick={handleSavePhoto}
                                >
                                  <Image src="/savephoto.png" alt="" width={10000} height={10000} className="lg:w-5 lg:h-5 w-3 h-3"/> Save Photo
                                </div> 
                            </div>
                            <div className="xl:w-[30rem] xl:h-[44rem] lg:w-[20rem] lg:h-[44rem] w-[30rem] h-[5rem]  border-2 border-transparent">
                            <div className="w-full h-full justify-end items-end border-2 border-transparent flex flex-col hidden lg:block">
                                    <div className="border-2 border-transparent flex justify-end items-center gap-5">

                                    </div>
                                </div>
                            </div>
                        </motion.div>
                </div>
            )}
            </AnimatePresence>
        </>
    )
}