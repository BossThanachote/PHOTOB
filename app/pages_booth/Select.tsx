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


export default function Select() {

  const [isVisible, setIsVisible] = useState(false); 
  const snap = useSnapshot(state);
  const [showModal, setShowModal] = useState(false);

  const getText = (englishText: string, thaiText: string) => {
    return snap.language === "TH" ? thaiText : englishText;
  };

  const handleNext = () => {
    setIsVisible(false); 
    setTimeout(() => {
      state.intro = 7; 
      setIsVisible(true); 
    }, 1200); 
};

  const handleBack = () => {
    setIsVisible(false); 
    setTimeout(() => {
      state.intro = 5; 
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

  const handleCloseModal = () => setShowModal(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence> 
        {snap.intro == 6 && isVisible && (
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
                {getText("PLEASE SELECT PHOTO", "กรุณาเลือกรูปภาพ")}
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
                {getText("PLEASE SELECT PHOTO", "กรุณาเลือกรูปภาพ")}
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
           
            {/* Main Content */}
            <div className="w-full h-full  flex lg:flex-row flex-col items-center justify-center lg:gap-[5rem] gap-5">
              <motion.div className="xl:w-[33rem] xl:h-[44rem] lg:w-[25rem] lg:h-[36rem]  w-[18rem] h-[30rem] border-2 bg-white"
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
              }}>
                <div className="w-full h-[80%]  grid grid-rows-3 grid-cols-2 gap-1 justify-items-center align-items-center pt-[1rem] px-[1rem]">
                  <div className="w-[95%] h-[90%] bg-[#000000CC] flex justify-center items-center select-none">
                    <Image src="/picture.png" alt="" width={10000} height={100000} className="w-5 h-5" />
                  </div> 
                  <div className="w-[95%] h-[90%] bg-[#000000CC] flex justify-center items-center">
                    <Image src="/picture.png" alt="" width={10000} height={100000} className="w-5 h-5" />
                  </div>
                  <div className="w-[95%] h-[90%] bg-[#000000CC] flex justify-center items-center">
                    <Image src="/picture.png" alt="" width={10000} height={100000} className="w-5 h-5" />
                  </div>
                  <div className="w-[95%] h-[90%] bg-[#000000CC] flex justify-center items-center">
                    <Image src="/picture.png" alt="" width={10000} height={100000} className="w-5 h-5" />
                  </div>
                  <div className="w-[95%] h-[90%] bg-[#000000CC] flex justify-center items-center">
                    <Image src="/picture.png" alt="" width={10000} height={100000} className="w-5 h-5" />
                  </div>
                  <div className="w-[95%] h-[90%] bg-[#000000CC] flex justify-center items-center">
                    <Image src="/picture.png" alt="" width={10000} height={100000} className="w-5 h-5" />
                  </div>
                </div>
              </motion.div>
              <motion.div className="xl:w-[53rem] xl:h-[35rem] lg:w-[32rem] lg:h-[28rem] md:w-[32rem] md:h-[18rem] w-[23rem] h-[18rem] grid grid-rows-2 grid-cols-3 gap-1 justify-items-center align-items-center pt-[1.5rem] px-[1rem]"
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
              }}>
                  <div className="w-[95%] h-[90%] bg-[#C7C7CC] flex justify-center items-center select-none">
                    <Image src="/picture.png" alt="" width={10000} height={100000} className="w-5 h-5" />
                  </div>
                  <div className="w-[95%] h-[90%] bg-[#C7C7CC] flex justify-center items-center">
                    <Image src="/picture.png" alt="" width={10000} height={100000} className="w-5 h-5" />
                  </div>
                  <div className="w-[95%] h-[90%] bg-[#C7C7CC] flex justify-center items-center">
                    <Image src="/picture.png" alt="" width={10000} height={100000} className="w-5 h-5" />
                  </div>
                  <div className="w-[95%] h-[90%] bg-[#C7C7CC] flex justify-center items-center">
                    <Image src="/picture.png" alt="" width={10000} height={100000} className="w-5 h-5" />
                  </div>
                  <div className="w-[95%] h-[90%] bg-[#C7C7CC] flex justify-center items-center">
                    <Image src="/picture.png" alt="" width={10000} height={100000} className="w-5 h-5" />
                  </div>
                  <div className="w-[95%] h-[90%] bg-[#C7C7CC] flex justify-center items-center">
                    <Image src="/picture.png" alt="" width={10000} height={100000} className="w-5 h-5" />
                  </div>
              </motion.div>
            </div>
            
        <Modal
          open={showModal}
          onOk={handleCloseModal}
          onCancel={handleCloseModal}
          centered
          footer={null} // ซ่อน Footer เริ่มต้น
          className="custom-modal select-none" // Custom class เพื่อกำหนดสไตล์เพิ่มเติม
        >
          {/* Container สำหรับเนื้อหาทั้งหมด */}
          <div className="flex flex-col justify-center items-center text-center">
          <iframe src="https://lottie.host/embed/ffc20d8a-075d-4548-a3bf-6e32a66c5dd0/Cyhnz0Jxar.json"></iframe>
            <p className="text-lg mb-6">{getText("Please Select A Format","กรุณาเลือกแบบรูปภาพ")}</p>
            <Button onClick={handleCloseModal} className="text-center hover:text-[black]">
              {getText("OK","ตกลง")}
            </Button>
          </div>
        </Modal>
          </div>
        )}
      </AnimatePresence>    

      
    </>
  );
}
