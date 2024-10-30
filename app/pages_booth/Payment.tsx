'use client'
import { motion, AnimatePresence } from "framer-motion";
import state from "../valtio_config";
import { useSnapshot } from "valtio";
import { IoIosArrowDropleft } from "react-icons/io";
import { IoIosArrowDropright } from "react-icons/io";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Modal, Button } from 'antd'; 
import 'antd/dist/reset.css'; 
export default function Payment() {

  const [isVisible, setIsVisible] = useState(false); 
  const snap = useSnapshot(state);
  const [selectedDiv, setSelectedDiv] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (snap.intro === 3) {
      setSelectedDiv(null);  // รีเซ็ตการเลือกเมื่อกลับมาหน้า snap.intro == 3
    }
  }, [snap.intro]);

  const getText = (englishText: string, thaiText: string) => {
    return snap.language === "TH" ? thaiText : englishText;
  };

  const handleImageClick = (type: any) => {
    if (selectedDiv === type) {
      setSelectedDiv(null); // หากคลิกซ้ำ จะยกเลิกการเลือก
    } else {
      setSelectedDiv(type); // กำหนดการเลือกใหม่
      console.log('state.intro = ', state.intro) 
    }
  };

  const handleNext = () => {
    if (selectedDiv === null) {       
        setShowModal(true); // หากไม่มีการเลือก จะแสดง modal
    } else {
        // เปลี่ยนค่า snap.intro ตามที่เลือก
        switch (selectedDiv) {
          case 'THAIQR':
            state.intro = 11; // กด THAIQR -> intro = 11
            console.log('state.intro = ', state.intro);
            break;
          case 'ALIPAY':
            state.intro = 12; // กด ALIPAY -> intro = 12
            console.log('state.intro = ', state.intro);          
            break;
          case 'COUPON':
            state.intro = 13; // กด COUPON -> intro = 13
            console.log('state.intro = ', state.intro);
            break;
          default:
            break;
        }
        setIsVisible(false);
        setTimeout(() => {
          setIsVisible(true); 
        }, 1200);
    }
  };

  const handleBack = () => {
    setSelectedDiv(null); // รีเซ็ตการเลือกภาพ
    setIsVisible(false); 
    setTimeout(() => {
      state.intro = 2;  // เปลี่ยนกลับไปหน้า intro = 2 หรือหน้าอื่นที่ต้องการ
      setIsVisible(true); 
    }, 1200); 
  };

  const shakeAnimation = {
    rotate: [0, -5, 5, -5, 5, 0], 
    transition: {
      duration: 0.5, 
      repeat: Infinity, 
      ease: "easeInOut",
      repeatDelay: 2,
    },
  };

  const exitAnimation = {
    scale: [1, 1.2, 0],
    opacity: [1, 0.5, 0],
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    },
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence> 
        {snap.intro == 3 && isVisible && (
          <div className="w-screen h-screen flex flex-col justify-between border-transparent ">
            {/* Navbar */}
            <div className="flex justify-center items-center w-full px-10 md:hidden py-5 border-b border-transparent">
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
                {getText("PAYMENT GATEWAY", "เส้นทางการชำระเงิน")}
              </motion.p>
            </div>
           
            <motion.div className="flex justify-between items-center w-full px-10 py-1 border-b border-transparent"
              initial={{ y: -100, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{
                type: "spring",
                damping: 5,
                stiffness: 30,
                duration: 0.1,
                ease: "easeInOut",
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
                className="font-bebas-neue-400 md:text-[1.7rem] sm:text-[1.2rem] hidden md:block lg:text-[2rem] pt-[1.2rem] select-none"
                style={{ letterSpacing: '10px' }}
              >
                {getText("PAYMENT GATEWAY", "เส้นทางการชำระเงิน")}
              </p>                  
              <button 
                className="font-inter-400 lg:text-xl text-white bg-[#222222] py-4 px-4 sm:py-4 sm:px-8 rounded-2xl flex items-center"
                onClick={handleNext}
              >
                {getText("Next", "ถัดไป")}                
                <IoIosArrowDropright 
                className="w-[1.5rem] h-[1.5rem] ml-4 text-white"
                />
              </button>
            </motion.div>
            
            {/* Main */}
            <div
              className="w-full h-full flex flex-col md:flex-row justify-center items-center gap-[3rem] sm:gap-[3rem] md:gap-[3rem] lg:gap-[2rem] xl:gap-[5rem] 2xl:gap-[5rem] border-2 border-transparent pb-[4rem]  select-none"
            >
                <motion.div className="md:w-[16rem] md:h-[16rem] w-[12rem] h-[12rem] rounded-[3rem] cursor-pointer"
                    onClick={() => handleImageClick('THAIQR')}
                    initial={selectedDiv === 'THAIQR' ? { scale: 1 } : { scale: 0 }}
                    animate={{
                        rotate: selectedDiv === 'THAIQR' ? shakeAnimation.rotate : 0,
                        scale: selectedDiv === 'THAIQR' ? 1 : 1,
                      }}
                      transition={selectedDiv === 'THAIQR' ? shakeAnimation.transition : {}}
                      exit={exitAnimation} 

            
                >
                    
                    <Image src="/THAIQR.png" alt="" width={10000} height={10000} className="w-full h-full"/>
                </motion.div>
                <motion.div className="md:w-[16rem] md:h-[16rem] w-[12rem] h-[12rem] rounded-[3rem] cursor-pointer"
                    onClick={() => handleImageClick('ALIPAY')}
                    initial={selectedDiv === 'ALIPAY' ? { scale: 1 } : { scale: 0 }}
                    animate={{
                        rotate: selectedDiv === 'ALIPAY' ? shakeAnimation.rotate : 0,
                        scale: selectedDiv === 'ALIPAY' ? 1 : 1,
                      }}
                      transition={selectedDiv === 'ALIPAY' ? shakeAnimation.transition : {}}
                      exit={exitAnimation}
                >
                    <Image src="/ALIPAY.png" alt="" width={10000} height={10000} className="w-full h-full"/>
                </motion.div>
                <motion.div className="md:w-[16rem] md:h-[16rem] w-[12rem] h-[12rem] rounded-[3rem] cursor-pointer flex justify-center items-center bg-white"
                    onClick={() => handleImageClick('COUPON')}
                    initial={selectedDiv === 'COUPON' ? { scale: 1 } : { scale: 0 }}
                    animate={{
                        rotate: selectedDiv === 'COUPON' ? shakeAnimation.rotate : 0,
                        scale: selectedDiv === 'COUPON' ? 1 : 1,
                      }}
                      transition={selectedDiv === 'COUPON' ? shakeAnimation.transition : {}}
                      exit={exitAnimation}
                >
                    <Image src="/Coupon.png" alt="" width={10000} height={10000} className="w-[70%] h-[40%]"/>
                </motion.div>
            </div>

          </div>)}
      </AnimatePresence>
      </>
   )}