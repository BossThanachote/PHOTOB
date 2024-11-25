'use client'
import { motion, AnimatePresence } from "framer-motion";
import state from "@/app/valtio_config";
import { useSnapshot } from "valtio";
import { IoIosArrowDropleft } from "react-icons/io";
import Image from "next/image";
import { useState, useEffect } from "react";
import { QRCode } from 'antd';
import { useRouter } from "next/navigation";

export default function Thaiqr(){
    const router = useRouter();
    const [countdown, setCountdown] = useState(120);
    const [isVisible, setIsVisible] = useState(true);
    const [isTimeout, setIsTimeout] = useState(false);
    const [selectedDiv, setSelectedDiv] = useState<string | null>(null); 
    
    const snap = useSnapshot(state);

    const getText = (englishText: string, thaiText: string) => {
      return snap.language === "TH" ? thaiText : englishText;
  };

  useEffect(() => {
    if (window.location.pathname === '/booth/thaiqr') {
      state.intro = 11;
      localStorage.setItem('currentIntro', '11');
    }
   }, []);
   
   // เพิ่ม useEffect สำหรับจัดการการย้อนกลับ
   useEffect(() => {
    const handlePopState = () => {
      const savedIntro = localStorage.getItem('currentIntro');
      if (savedIntro) {
        state.intro = parseInt(savedIntro);
      }
    };
   
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
   }, []);
   
   useEffect(() => {
    let timer: any;
    if (snap.intro === 11) {
      setCountdown(120);
      setIsVisible(true);  
      setIsTimeout(false);
      timer = setInterval(() => {
        setCountdown(prevCount => prevCount - 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
   }, [snap.intro]);
   
   useEffect(() => {
    if (countdown === 0) {
      setIsTimeout(true);
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          state.intro = 3;
          localStorage.setItem('currentIntro', '3');
          router.push('/booth/payment');
        }, 0);
      }, 1000);
    }
   }, [countdown]);
   
   const handleNext = () => {
    setIsVisible(false);
    setTimeout(() => {
      state.intro = 12;
      localStorage.setItem('currentIntro', '12');
      setIsVisible(true);
      setTimeout(() => {
        router.push('/booth/alipay');
      }, 0);
    }, 1000);
   };
   
   const handleBack = () => {
    setIsVisible(false);
    setTimeout(() => {
      state.intro = 3;
      localStorage.setItem('currentIntro', '3');
      setIsVisible(true);
      setTimeout(() => {
        router.push('/booth/payment');
      }, 0);
    }, 1000);
   };

const exitAnimation = {
    scale: [1, 1.2, 0],
    opacity: [1, 0.5, 0],
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    },
};

    return(
        <>
            <AnimatePresence> 
            {(snap.intro === 11 || window.location.pathname === '/booth/thaiqr') && isVisible && (
                <div className="w-screen h-screen flex flex-col justify-between border-transparent  bg-[#F7F7F7] select-none">
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
                            {getText("PAYMENT", "การชำระเงิน")}
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
                            {getText("Back", "กลับ")}
                          </button>
                          <p 
                            className="font-bebas-neue-400 md:text-[1.7rem] sm:text-[1.2rem] hidden md:block lg:text-[2rem] select-none"
                            style={{ letterSpacing: '10px' }}
                          >
                            {getText("PAYMENT", "การชำระเงิน")}
                          </p>
                          <div 
                            className="font-inter-400 lg:text-xl text-transparent bg-transparent py-4 px-4 sm:py-4 sm:px-8 rounded-2xl flex items-center"
                          >
                            NEXT
                          </div>
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
                                        {isTimeout ? getText("Time Out", "หมดเวลา") : countdown > 0 ? countdown : getText("Time Out", "หมดเวลา")}
                                    </p>
                                </div>
                            </div>
                            <div className="w-[30rem] lg:h-[44rem] md:h-[40rem] h-[40rem]  border-[1px] border-[#C6C6C980] flex justify-center items-center bg-white">
                                <div className="w-[95%] h-[95%] border-[1px] border-transparent flex-col flex ">
                                    <div className="flex flex-col border-[1px] border-transparent lg:h-[7rem] h-[7rem]">                 
                                        <div className="w-full h-full border-[1px] border-transparent flex flex-col justify-center items-center font-inter-400">
                                            <div className="text-[#000000]  text-[1.5rem] lg:text-[1.5rem]">{getText("PLEASE SCAN TO PAY", "แสกนเพื่อจ่ายเงิน")}</div>                                        
                                        </div>                                     
                                    </div>
                                    <div className="flex flex-col justify-center items-center border-[1px] gap-4 border-transparent h-[32rem] mb-[1rem]">
                                    <QRCode
                                      value="https://example.com" 
                                      size={300}
                                      style={{ marginTop: '20px' }}                            
                                    />
                                    <div className="w-[80%] text-center font-inter-400 text-base text-[#8E8E93]">
                                        Photo booth CO.,LTD.
                                        <p>{getText("Net price 120 baht", "ราคาสุทธิ 120 บาท")}</p>
                                    </div>
                                    <div className="text-center font-inter-400 text-base text-[#8E8E93]">
                                        {getText("Can be scanned with every bank's app.", "แสกนได้ด้วยแอปของทุกธนาคาร")}
                                    </div>
                                    <div className="w-[13.2rem] h-[4.5rem]">
                                        <Image src="/PromptPay.png" alt="" width={10000} height={10000} className="w-full h-full" />
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