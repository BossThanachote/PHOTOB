'use client'
import { motion, AnimatePresence, useTime } from "framer-motion";
import state from "../valtio_config";
import { useSnapshot } from "valtio";
import { IoIosArrowDropleft } from "react-icons/io";
import { IoIosArrowDropright } from "react-icons/io";
import Image from "next/image";
import { useState, useEffect } from "react";
import { div } from "framer-motion/client";
import { QRCode } from 'antd';
import { DiSmashingMagazine } from "react-icons/di";

const formatDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }; 
    return today.toLocaleDateString('en-US', options); // ได้ฟอร์แมตที่เป็น "Feb 22, 2024"
    }
  

export default function Download(){

    const [countdown, setCountdown] = useState(120);
    const [isVisible, setIsVisible] = useState(false);
    const [isTimeout, setIsTimeout] = useState(false); 
    const snap = useSnapshot(state);

    useEffect(() => {
        let timer:any;

        // เมื่อ state.intro = 5 ให้เริ่มการนับถอยหลัง
        if (snap.intro === 9) {
            setCountdown(120); // รีเซ็ต countdown ทุกครั้งที่เข้า intro = 5
            setIsVisible(true); // ตั้งค่าให้เห็นหน้าจอ

            // เริ่มการนับถอยหลัง
            timer = setInterval(() => {
                setCountdown(prevCount => prevCount - 1);
            }, 1000);
        } else {
            clearInterval(timer); // หยุดการนับถอยหลังหาก intro ไม่ใช่ 5
        }

        // ล้าง timer เมื่อ component ถูก unmount หรือเมื่อ snap.intro เปลี่ยน
        return () => clearInterval(timer);
    }, [snap.intro]);

    
    useEffect(() => {
        // เมื่อ countdown ถึง 0 ให้แสดง Timeout 2 วินาที จากนั้นเปลี่ยนเป็น intro = 6
        if (countdown === 0) {
            setIsTimeout(true); // แสดงข้อความ Timeout
            setTimeout(() => {
                state.intro = 6; // หลังจาก 2 วินาทีเปลี่ยนไปที่ intro = 6
            }, 2000);
        }
    }, [countdown]);

    const handleNext = () => {
        setIsVisible(false); 
        setCountdown(120);
        setIsTimeout(false); // ซ่อน Timeout หากมีการกดปุ่ม
        setTimeout(() => {
            state.intro = 10; 
            setIsVisible(true); 
        }, 1200); 
    };

    const handleBack = () => {
        state.resetSelfieData(); // เรียกฟังก์ชันรีเซ็ตสถานะ
    
        setIsVisible(false); 
        setCountdown(120);
        setIsTimeout(false); // ซ่อน Timeout หากมีการกดปุ่ม
        setTimeout(() => {
            state.intro = 8; // กลับไปที่หน้าก่อนหน้า
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

    return(
        <>
            <AnimatePresence> 
            {snap.intro == 9 &&  isVisible && (
                <div className="w-screen h-screen flex flex-col justify-between border-transparent border-2 bg-[#F7F7F7] select-none">
                     <div className="flex justify-center items-center w-full px-10 md:hidden pt-4 border-b border-transparent">
                        <motion.p 
                            className="font-bebas-neue-400 md:text-[1.7rem] text-[1.3rem] lg:text-[2rem] select-none text-center"
                            style={{ letterSpacing: '10px' }}
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
                            SCAN FOR DOWNLOAD
                          </motion.p>
                        </div>
                      
                        <motion.div className="flex justify-between items-center w-full px-10 py-3 border-b border-transparent"
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
                          <p 
                            className="font-bebas-neue-400 md:text-[1.7rem] sm:text-[1.2rem] hidden md:block lg:text-[2rem] select-none"
                            style={{ letterSpacing: '10px' }}
                          >
                            SCAN FOR DOWNLOAD
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
                                    
                                </div>
                            </div>
                            <div className="w-[30rem] h-[8rem] border-4 mb-10 border-transparent lg:hidden flex justify-center items-center ">
                                <div className="xl:w-[12.5rem] xl:h-[12.5rem] lg:w-[10rem] lg:h-[10rem] h-[7rem] w-[7rem] bg-[#222222] rounded-full flex justify-center items-center ">
                                    <p className="font-bebas-neue-400 text-white xl:text-[3.5rem] lg:text-[2.5rem] text-[2rem] xl:mt-[3.8rem]  lg:mt-[2.8rem]  sm:pb-2 pt-[2.5rem]">
                                        {isTimeout ? "Timeout" : countdown > 0 ? countdown : "Time Out"}
                                    </p>
                                </div>
                            </div>
                            <div className="w-[30rem] lg:h-[44rem] md:h-[40rem] h-[40rem]  border-[1px] border-[#C6C6C980] flex justify-center items-center bg-white">
                                <div className="w-[95%] h-[95%] border-[1px] border-transparent flex-col flex ">
                                    <div className="flex flex-col border-[1px] border-transparent lg:h-[10rem] h-[7rem]">                 
                                        <div className="w-full h-full border-[1px] border-transparent flex flex-col justify-center items-center font-inter-400">
                                            <div className="text-[#000000]  text-[1.5rem] lg:text-[1.5rem]" style={{ letterSpacing: '10px' }}>PLEASE SCAN</div>
                                            <div className="text-[#61616A] text-base flex justify-center items-center gap-2 mt-2"><Image 
                                                src="/picture.png" 
                                                alt="picture icon" 
                                                width={10000} 
                                                height={10000} 
                                                className="w-5 h-5 " 
                                              />
                                              For download file
                                            </div>
                                        </div>
                                        
                                    </div>
                                    <div className="flex flex-col justify-center items-center border-[1px] gap-4 border-transparent h-[32rem] mb-[1rem]">
                                    <QRCode
                                      value="https://watt-photo-booth.s3.ap-southeast-1.amazonaws.com/sticker/teKYjfejrTGbObl16367875001106882..png"
                                      size={300} // กำหนดขนาดของ QR code
                                      style={{ marginTop: '20px' }} // ใช้เพิ่ม styling ถ้าต้องการ                                    
                                    />
                                    <div className="w-[80%] text-center font-inter-400 text-base text-[#8E8E93]">
                                        Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
                                    </div>
                                    <div className="text-center font-inter-400 text-base text-[#8E8E93]">
                                        {formatDate()}
                                    </div>
                                    </div>
                                </div>
                            </div>
                            <div className="xl:w-[30rem] xl:h-[44rem] lg:w-[20rem] lg:h-[44rem] w-[30rem] h-[5rem]  border-2 border-transparent">
                            <div className="w-full h-full justify-end items-end border-2 border-transparent flex flex-col hidden lg:block ">
                                    <div className="border-2 border-transparent flex justify-end items-center gap-5">
                                    <div className="xl:w-[12.5rem] xl:h-[12.5rem] lg:w-[10rem] lg:h-[10rem] bg-[#222222] rounded-full flex justify-center items-center mr-10">
                                        <p className="font-bebas-neue-400 text-white xl:text-[3.5rem] lg:text-[2.5rem] xl:mt-[3.8rem] lg:mt-[2.8rem] md:mt-[3.7rem] mt-10">
                                            {isTimeout ? "Timeout" : countdown > 0 ? countdown : "Time Out"}
                                        </p>
                                    </div>
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