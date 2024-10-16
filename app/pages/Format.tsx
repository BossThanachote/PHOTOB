'use client'
import { motion, AnimatePresence } from "framer-motion";
import state from "../store";
import { useSnapshot } from "valtio";
import { IoIosArrowDropleft } from "react-icons/io";
import { IoIosArrowDropright } from "react-icons/io";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Modal, Button } from 'antd'; 
import 'antd/dist/reset.css'; 
export default function Format() {

  const [isVisible, setIsVisible] = useState(false); 
  const snap = useSnapshot(state);
  const [selectedDiv, setSelectedDiv] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const [isHoveredDiv1, setIsHoveredDiv1] = useState(false);
  const [isTappedDiv1, setIsTappedDiv1] = useState(false);
  const [isHoveredDiv2, setIsHoveredDiv2] = useState(false);
  const [isTappedDiv2, setIsTappedDiv2] = useState(false);

  const [isHoveredDiv3, setIsHoveredDiv3] = useState(false);
  const [isTappedDiv3, setIsTappedDiv3] = useState(false);
  const [isHoveredDiv4, setIsHoveredDiv4] = useState(false);
  const [isTappedDiv4, setIsTappedDiv4] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleNext = () => {
    if (selectedDiv === null) {       
        setShowModal(true);
    } else {       
        setSelectedDiv(null);
        setIsVisible(false); 
        setTimeout(() => {
            state.intro = 3; 
            setIsVisible(true); 
        }, 1200);
    }
};

  const handleBack = () => {
    setSelectedDiv(null);
    setIsVisible(false); 
    setTimeout(() => {
      state.intro = 1; 
      setIsVisible(true); 
    }, 1200); 
  };

  const handleDivClick = (divNumber:any) => {
    if (selectedDiv === divNumber) {
        setSelectedDiv(null); 
    } else {
        setSelectedDiv(divNumber); 
        state.selectedDiv = divNumber;

        // เรียกฟังก์ชันรีเซ็ตเพื่อรีเซ็ตค่าต่าง ๆ ใน Selfie
        state.selfieData.step = 1; // เริ่มต้นที่ขั้นตอน 1
        state.selfieData.countdown = 12; // เริ่มต้นที่การนับถอยหลัง 12
        state.selfieData.doneDelay = false; // รีเซ็ต doneDelay
        state.selfieData.isExiting = false; // รีเซ็ต isExiting
    }
    console.log('Div selected:', divNumber);
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
        {snap.intro == 2 && isVisible && (
          <div className="w-screen h-screen flex flex-col justify-between border-transparent border-2">
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
                PLEASE SELECT FORMAT
              </motion.p>
            </div>
           
            <motion.div className="flex justify-between items-center w-full px-10 py-5 border-b border-transparent"
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
                Back
              </button>
              <p 
                className="font-bebas-neue-400 md:text-[1.7rem] sm:text-[1.2rem] hidden md:block lg:text-[2rem] select-none"
                style={{ letterSpacing: '10px' }}
              >
                PLEASE SELECT FORMAT
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
           
            {/* Main Content */}
            <div
              className="w-full h-full flex justify-center items-center gap-2 sm:gap-[3rem] md:gap-[5rem] lg:gap-[2rem] xl:gap-[10rem] 2xl:gap-[20rem] relative border-2 border-transparent select-none"
            >
                <motion.div className="xl:w-[29.06rem] xl:h-[41.19rem] lg:w-[25rem] lg:h-[37.13rem] md:w-[17rem] md:h-[29.13rem] sm:w-[15rem] sm:h-[24.13rem] w-[12rem] h-[24.13rem] border-2 border-transparent cursor-pointer flex justify-end items-end"
                    initial={{ scale: 0 }}
                    animate={{
                      rotate: selectedDiv === 1 ? shakeAnimation.rotate : 0,
                      scale: selectedDiv === 1 ? 1 : 1,
                    }}
                    transition={selectedDiv === 1 ? shakeAnimation.transition : {}}
                    exit={exitAnimation}
                    onClick={() => handleDivClick(1)} 
                  >
                    {selectedDiv === 1 && <p className="font-bebas-neue-400 lg:text-[3rem] md:text-[2rem] text-[1.5rem] absolute z-20 xl:mb-[43rem] xl:mr-[7rem] lg:mb-[38rem] lg:mr-[5rem] md:mb-[30rem] md:mr-[5rem] sm:mb-[25rem] sm:mr-[4.5rem] mb-[25rem] mr-[1.5rem]" style={{ letterSpacing: '10px' }}>SELECTED</p>} 
                
                    <motion.div className="xl:w-[26.13rem] xl:h-[39.2rem] lg:w-[22.07rem] lg:h-[35.14rem] md:w-[14.07rem] md:h-[27.14rem] sm:h-[22.14rem] sm:w-[12.5rem] h-[22.14rem] w-[10.57rem] border-2 border-black bg-black absolute z-10"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onHoverStart={() => setIsHoveredDiv1(true)} 
                        onHoverEnd={() => setIsHoveredDiv1(false)}
                        onTapStart={() => setIsTappedDiv1(true)} 
                        onTap={() => setIsTappedDiv1(false)} 
                        animate={{                          
                          scale: isHoveredDiv2 ? 1.1 : isTappedDiv2 ? 0.9 : 1,
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 20,
                        }}
                      >
                        <div className="w-full xl:h-[17rem] lg:h-[13rem] md:h-[9rem] sm:h-[8rem] h-[7rem] border-2 border-transparent flex  gap-2 sm:gap-3 lg:gap-4 justify-center items-center">
                            <div className="xl:w-[11.5rem] xl:h-[15.44rem] lg:w-[9.44rem] lg:h-[11.38rem] md:w-[6rem] md:h-[8rem] sm:w-[5rem] sm:h-[7rem] w-[4.5rem] h-[6rem] bg-white">
                              <div className="w-full h-14 border-2 border-transparent flex justify-start pl-2 pt-2">
                                <Image 
                                  src="/cloud.png" 
                                  alt="cloud-black" 
                                  width={1000} height={1000}
                                  className="sm:w-6 sm:h-6 w-4 h-4 absolute">
                                </Image>
                                <Image 
                                  src="/cloud-gray.png" 
                                  alt="cloud-black" 
                                  width={1000} height={1000}
                                  className="sm:w-4 sm:h-4 w-3 h-3 absolute sm:mt-4 sm:ml-5 mt-3 ml-3">
                                </Image>
                              </div>
                            </div>
                            <div className="xl:w-[11.5rem] xl:h-[15.44rem] lg:w-[9.44rem] lg:h-[11.38rem] md:w-[6rem] md:h-[8rem] sm:w-[5rem] sm:h-[7rem] w-[4.5rem] h-[6rem] font-inter-400 text-sm md:text-base text-[#666666] bg-white flex flex-col justify-end items-center pb-3">
                                <p>Photo</p>
                                <p>Size 3 X 4</p>
                            </div>
                        </div>
                        <div className="w-full xl:h-[17rem] lg:h-[13rem] md:h-[9rem] sm:h-[8rem] border-2 border-transparent flex gap-2 sm:gap-3 lg:gap-4 justify-center items-center lg:mt-[-0.5rem]">
                            <div className="xl:w-[11.5rem] xl:h-[15.44rem] lg:w-[9.44rem] lg:h-[11.38rem] md:w-[6rem] md:h-[8rem] sm:w-[5rem] sm:h-[7rem] w-[4.5rem] h-[6rem] bg-white">

                            </div>
                            <div className="xl:w-[11.5rem] xl:h-[15.44rem] lg:w-[9.44rem] lg:h-[11.38rem] md:w-[6rem] md:h-[8rem] sm:w-[5rem] sm:h-[7rem] w-[4.5rem] h-[6rem] bg-black">

                            </div>
                        </div>
                        <div className="w-full xl:h-[5.5rem] border-2 border-transparent flex gap-4 justify-center items-center xl:mt-0 lg:mt-[5.7rem] md:mt-[5.2rem] sm:mt-[2.7rem] mt-[5.4rem]">
                            <div className="xl:w-[11.5rem] lg:w-[9.44rem]  md:w-[6rem] sm:w-[5rem] w-[4.5rem] h-full bg-transparent font-inter-400 text-base text-white flex flex-col justify-end items-start text-center">
                                <div className="flex flex-col text-sm md:text-base text-center justify-center items-center mb-2">
                                <p>Frame A</p>
                                <p>Size 4 X 6</p>
                                </div>
                            </div>
                            <div className="xl:w-[11.5rem] lg:w-[9.44rem]  md:w-[6rem] sm:w-[5rem] w-[4.5rem] h-full bg-black">

                            </div>
                        </div>
                    </motion.div>


                    <motion.div className="xl:w-[26.13rem] xl:h-[39.2rem] lg:w-[22.07rem] lg:h-[35.14rem] md:w-[14.07rem] md:h-[27.14rem] sm:h-[22.14rem] sm:w-[12.5rem] h-[22.14rem] w-[10.57rem] border-2 border-[#222222] bg-[#222222] absolute z-0 sm:mr-[2.3rem] mr-[1.3rem]  md:mr-[2.7rem] mb-[2rem]"
                  
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onHoverStart={() => setIsHoveredDiv2(true)} 
                      onHoverEnd={() => setIsHoveredDiv2(false)}
                      onTapStart={() => setIsTappedDiv2(true)} 
                      onTap={() => setIsTappedDiv2(false)} 
                      animate={{
                        scale: isHoveredDiv1 ? 1.1 : isTappedDiv1 ? 0.9 : 1,
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 20,
                      }}
                    >
                        <div className="w-full xl:h-[17rem] lg:h-[13rem] md:h-[9rem] sm:h-[8rem] h-[7rem] border-2 border-transparent flex  gap-2 sm:gap-3 lg:gap-4 justify-center items-center">
                            <div className="xl:w-[11.5rem] xl:h-[15.44rem] lg:w-[9.44rem] lg:h-[11.38rem] md:w-[6rem] md:h-[8rem] sm:w-[5rem] sm:h-[7rem] w-[4.5rem] h-[6rem] bg-white">

                            </div>
                            <div className="xl:w-[11.5rem] xl:h-[15.44rem] lg:w-[9.44rem] lg:h-[11.38rem] md:w-[6rem] md:h-[8rem] sm:w-[5rem] sm:h-[7rem] w-[4.5rem] h-[6rem] font-inter-400 text-sm md:text-base text-[#666666] bg-white flex flex-col justify-end items-center pb-3">
                                <p>Photo</p>
                                <p>Size 3 X 4</p>
                            </div>
                        </div>
                        <div className="w-full xl:h-[17rem] lg:h-[13rem] md:h-[9rem] sm:h-[8rem] border-2 border-transparent flex gap-2 sm:gap-3 lg:gap-4 justify-center items-center lg:mt-[-0.5rem]">
                            <div className="xl:w-[11.5rem] xl:h-[15.44rem] lg:w-[9.44rem] lg:h-[11.38rem] md:w-[6rem] md:h-[8rem] sm:w-[5rem] sm:h-[7rem] w-[4.5rem] h-[6rem] bg-white">

                            </div>
                            <div className="xl:w-[11.5rem] xl:h-[15.44rem] lg:w-[9.44rem] lg:h-[11.38rem] md:w-[6rem] md:h-[8rem] sm:w-[5rem] sm:h-[7rem] w-[4.5rem] h-[6rem] bg-[#222222]">

                            </div>
                        </div>
                        <div className="w-full xl:h-[5.5rem] border-2 border-transparent flex gap-4 justify-center items-center xl:mt-0 lg:mt-[5.7rem] md:mt-[5.2rem] sm:mt-[2.7rem] mt-[5.4rem]">
                            <div className="xl:w-[11.5rem] lg:w-[9.44rem]  md:w-[6rem] sm:w-[5rem] w-[4.5rem] h-full bg-transparent font-inter-400 text-base text-white flex flex-col justify-end items-start text-center">
                                <div className="flex flex-col text-sm md:text-base text-center justify-center items-center mb-2">
                               
                                </div>
                            </div>
                            <div className="xl:w-[11.5rem] lg:w-[9.44rem]  md:w-[6rem] sm:w-[5rem] w-[4.5rem] h-full bg-[#222222]">

                            </div>
                        </div>
                    </motion.div>
                    
                </motion.div>
                
                <motion.div className="xl:w-[39.2rem] xl:h-[49.2rem] lg:w-[35rem] lg:h-[35rem] md:w-[25rem] md:h-[25rem] sm:w-[19rem] sm:h-[19rem] w-[16rem] h-[16rem] border-2 border-transparent cursor-pointer flex items-center"
                   initial={{ scale: 0 }}
                   animate={{
                     rotate: selectedDiv === 2 ? shakeAnimation.rotate : 0, 
                     scale: selectedDiv === 2 ? 1 : 1,
                   }}
                   transition={selectedDiv === 2 ? shakeAnimation.transition : {}} 
                   exit={exitAnimation}
                   onClick={() => handleDivClick(2)}
                 >
                  {selectedDiv === 2 && <p className="font-bebas-neue-400 lg:text-[3rem] md:text-[2rem] text-[1.5rem] absolute z-20 xl:mb-[45rem] xl:ml-[9rem] lg:mb-[40rem] lg:ml-[8rem] md:mb-[30rem] md:ml-[5rem] sm:mb-[25rem] sm:ml-[5.5rem] mb-[23rem] ml-[4rem]" style={{ letterSpacing: '10px' }}>SELECTED</p>} 
                  <motion.div className="xl:w-[26.13rem] xl:h-[39.2rem] lg:w-[22.07rem] lg:h-[35.14rem] md:w-[14.07rem] md:h-[27.14rem] sm:h-[22.14rem] sm:w-[12.5rem] h-[19.14rem] w-[10.57rem] ml-12 border-2 border-black bg-black absolute z-10 "
                   whileHover={{ scale: 1.1 }}
                   whileTap={{ scale: 0.9 }}
                   onHoverStart={() => setIsHoveredDiv3(true)} 
                   onHoverEnd={() => setIsHoveredDiv3(false)}
                   onTapStart={() => setIsTappedDiv3(true)} 
                   onTap={() => setIsTappedDiv3(false)} 
                   animate={{
                     scale: isHoveredDiv3 ? 1.1 : isTappedDiv4 ? 0.9 : 1,
                   }}
                   transition={{
                     type: 'spring',
                     stiffness: 300,
                     damping: 20,
                   }}
                  >
                        <div className="w-full xl:h-[8.5rem] lg:h-[7.5rem] md:h-[5.5rem] sm:h-[4.5rem] h-[4rem] border-2 border-transparent flex  gap-2 sm:gap-3 lg:gap-4 justify-center items-center">
                            <div className="xl:w-[11.5rem] xl:h-[7rem] lg:w-[9.44rem] lg:h-[6rem] md:w-[6rem] md:h-[4.5rem] sm:w-[5rem] sm:h-[3.5rem] w-[4.5rem] h-[3.5rem] bg-white">
                              <div className="w-full h-14 border-2 border-transparent flex justify-start pl-2 pt-2">
                                
                              </div>
                            </div>
                            <div className="xl:w-[11.5rem] xl:h-[7rem] lg:w-[9.44rem] lg:h-[6rem] md:w-[6rem] md:h-[4.5rem] sm:w-[5rem] sm:h-[3.5rem] w-[4.5rem] h-[3.5rem] font-inter-400 text-sm md:text-base text-[#666666] bg-white flex flex-col justify-start items-end pb-3">
                            <Image 
                                  src="/cloud.png" 
                                  alt="cloud-black" 
                                  width={1000} height={1000}
                                  className="md:w-6 md:h-6 w-4 h-4 mr-4 mt-1 absolute">
                                </Image>
                                <Image 
                                  src="/cloud-gray.png" 
                                  alt="cloud-black" 
                                  width={1000} height={1000}
                                  className="md:w-4 md:h-4 w-3 h-3 absolute md:mt-5  md:mr-2 mt-4  mr-2">
                            </Image>
                            </div>
                        </div>
                        <div className="w-full xl:h-[8.5rem] lg:h-[7.5rem] md:h-[5.5rem] sm:h-[4.2rem] h-[4rem] border-2 border-transparent flex gap-2 sm:gap-3 lg:gap-4 justify-center items-center lg:mt-[-0.5rem]">
                        <div className="xl:w-[11.5rem] xl:h-[7rem] lg:w-[9.44rem] lg:h-[6rem] md:w-[6rem] md:h-[4.5rem] sm:w-[5rem] sm:h-[3.5rem] w-[4.5rem] h-[3.5rem] bg-white font-inter-400 text-[0.6rem] md:text-sm lg:text-base text-[#666666] flex items-center justify-center relative">
                            <p className="absolute md:left-[-1.2rem] left-[-1rem] "style={{ transform: 'rotate(90deg)' }}>Size 2 X 3</p>
                            <p className="absolute md:left-4 left-2 "style={{ transform: 'rotate(90deg)' }}>Photo</p>
                        </div>
                            <div className="xl:w-[11.5rem] xl:h-[7rem] lg:w-[9.44rem] lg:h-[6rem] md:w-[6rem] md:h-[4.5rem] sm:w-[5rem] sm:h-[3.5rem] w-[4.5rem] h-[3.5rem] bg-white">

                            </div>
                        </div>
                        <div className="w-full xl:h-[8.5rem] lg:h-[7.5rem] md:h-[5.5rem] sm:h-[4.2rem] h-[4rem] border-2 border-transparent flex gap-2 sm:gap-3 lg:gap-4 justify-center items-center lg:mt-[-0.5rem]">
                            <div className="xl:w-[11.5rem] xl:h-[7rem] lg:w-[9.44rem] lg:h-[6rem] md:w-[6rem] md:h-[4.5rem] sm:w-[5rem] sm:h-[3.5rem] w-[4.5rem] h-[3.5rem] bg-white">

                            </div>
                            <div className="xl:w-[11.5rem] xl:h-[7rem] lg:w-[9.44rem] lg:h-[6rem] md:w-[6rem] md:h-[4.5rem] sm:w-[5rem] sm:h-[3.5rem] w-[4.5rem] h-[3.5rem] font-inter-400 text-sm md:text-base text-[#666666] bg-white flex flex-col justify-start items-end pb-3">
                            <Image 
                                  src="/cloud.png" 
                                  alt="cloud-black" 
                                  width={1000} height={1000}
                                  className="md:w-6 md:h-6 w-4 h-4 mr-4 mt-1 absolute">
                                </Image>
                                <Image 
                                  src="/cloud-gray.png" 
                                  alt="cloud-black" 
                                  width={1000} height={1000}
                                  className="md:w-4 md:h-4 w-3 h-3 absolute md:mt-5  md:mr-2 mt-4  mr-2">
                            </Image>
                            </div>
                        </div>
                        <div className="w-full xl:h-[8.5rem] lg:h-[7.5rem] md:h-[5.5rem] sm:h-[4.2rem] h-[4rem] border-2 border-transparent flex gap-2 sm:gap-3 lg:gap-4 justify-center items-center lg:mt-[-0.5rem]">
                            <div className="xl:w-[11.5rem] xl:h-[7rem] lg:w-[9.44rem] lg:h-[6rem] md:w-[6rem] md:h-[4.5rem] sm:w-[5rem] sm:h-[3.5rem] w-[4.5rem] h-[3.5rem] bg-white">
                              
                            </div>
                            <div className="xl:w-[11.5rem] xl:h-[7rem] lg:w-[9.44rem] lg:h-[6rem] md:w-[6rem] md:h-[4.5rem] sm:w-[5rem] sm:h-[3.5rem] w-[4.5rem] h-[3.5rem] bg-white">

                            </div>
                        </div>
                        <div className="w-full xl:h-[6rem] border-2 border-transparent flex gap-4 justify-center items-center xl:mt-2 lg:mt-[2.7rem] md:mt-[1.2rem] sm:mt-[1rem] mt-0">
                            <div className="xl:w-[11.5rem] lg:w-[9.44rem]  md:w-[6rem] sm:w-[5rem] w-[4.5rem] h-full bg-transparent font-inter-400 text-base text-white flex flex-col justify-end items-start text-center">
                                <div className="flex flex-col text-sm md:text-base text-center justify-center items-center mb-2">
                                <p>Frame B</p>
                                <p>Size 4 X 6</p>
                                </div>
                            </div>
                            <div className="xl:w-[11.5rem] lg:w-[9.44rem]  md:w-[6rem] sm:w-[5rem] w-[4.5rem] h-full bg-black">

                            </div>
                        </div>
                    </motion.div>


                    <motion.div className="xl:w-[26.13rem] xl:h-[39.2rem] lg:w-[22.07rem] lg:h-[35.14rem] md:w-[14.07rem] md:h-[25.14rem] sm:h-[20.14rem] sm:w-[12.5rem] h-[16.14rem] w-[10.57rem] border-2 border-[#222222] bg-[#222222]  absolute z-0 xl:mt-[3rem] lg:mt-[3rem] md:mt-[3rem] sm:mt-[3rem] mt-[3rem] xl:ml-[6rem] lg:ml-[6.3rem] md:ml-[5rem] sm:ml-[3.5rem] ml-[2.5rem]" 
                        initial={{ rotate: -90 }}
                       whileHover={{ scale: 1.1 }}
                       whileTap={{ scale: 0.9 }}
                       onHoverStart={() => setIsHoveredDiv4(true)} 
                       onHoverEnd={() => setIsHoveredDiv4(false)}
                       onTapStart={() => setIsTappedDiv4(true)} 
                       onTap={() => setIsTappedDiv4(false)} 
                       animate={{
                         scale: isHoveredDiv3 ? 1.1 : isTappedDiv4 ? 0.9 : 1,
                       }}
                       transition={{
                         type: 'spring',
                         stiffness: 300,
                         damping: 20,
                       }}
                    >
                        <div className="w-full xl:h-[8.5rem] lg:h-[7.5rem] md:h-[5.5rem] sm:h-[4.5rem] h-[3rem] border-2 border-transparent flex  gap-2 sm:gap-3 lg:gap-4 justify-center items-center">
                            <div className="xl:w-[11.5rem] xl:h-[7rem] lg:w-[9.44rem] lg:h-[6rem] md:w-[6rem] md:h-[4.5rem] sm:w-[5rem] sm:h-[3.5rem] w-[4.5rem] h-[2.5rem] bg-white">
                              <div className="w-full h-14 border-2 border-transparent flex justify-start pl-2 pt-2">
                                
                              </div>
                            </div>
                            <div className="xl:w-[11.5rem] xl:h-[7rem] lg:w-[9.44rem] lg:h-[6rem] md:w-[6rem] md:h-[4.5rem] sm:w-[5rem] sm:h-[3.5rem] w-[4.5rem] h-[2.5rem] font-inter-400 text-sm md:text-base text-[#666666] bg-white flex flex-col justify-start items-end pb-3">
                            
                            </div>
                        </div>
                        <div className="w-full xl:h-[8.5rem] lg:h-[7.5rem] md:h-[5.5rem] sm:h-[4.2rem] h-[4rem] border-2 border-transparent flex gap-2 sm:gap-3 lg:gap-4 justify-center items-center lg:mt-[-0.5rem]">
                        <div className="xl:w-[11.5rem] xl:h-[7rem] lg:w-[9.44rem] lg:h-[6rem] md:w-[6rem] md:h-[4.5rem] sm:w-[5rem] sm:h-[3.5rem] w-[4.5rem] h-[2.5rem] bg-white font-inter-400 text-[0.6rem] md:text-sm lg:text-base text-[#666666] flex items-center justify-center relative">
                            
                        </div>
                            <div className="xl:w-[11.5rem] xl:h-[7rem] lg:w-[9.44rem] lg:h-[6rem] md:w-[6rem] md:h-[4.5rem] sm:w-[5rem] sm:h-[3.5rem] w-[4.5rem] h-[2.5rem] bg-white">

                            </div>
                        </div>
                        <div className="w-full xl:h-[8.5rem] lg:h-[7.5rem] md:h-[5.5rem] sm:h-[4.2rem] h-[4rem] border-2 border-transparent flex gap-2 sm:gap-3 lg:gap-4 justify-center items-center lg:mt-[-0.5rem]">
                            <div className="xl:w-[11.5rem] xl:h-[7rem] lg:w-[9.44rem] lg:h-[6rem] md:w-[6rem] md:h-[4.5rem] sm:w-[5rem] sm:h-[3.5rem] w-[4.5rem] h-[2.5rem] bg-white">

                            </div>
                            <div className="xl:w-[11.5rem] xl:h-[7rem] lg:w-[9.44rem] lg:h-[6rem] md:w-[6rem] md:h-[4.5rem] sm:w-[5rem] sm:h-[3.5rem] w-[4.5rem] h-[2.5rem] font-inter-400 text-sm md:text-base text-[#666666] bg-white flex flex-col justify-start items-end pb-3">
                            
                            </div>
                        </div>
                        <div className="w-full xl:h-[8.5rem] lg:h-[7.5rem] md:h-[5.5rem] sm:h-[4.2rem] h-[4rem] border-2 border-transparent flex gap-2 sm:gap-3 lg:gap-4 justify-center items-center lg:mt-[-0.5rem]">
                            <div className="xl:w-[11.5rem] xl:h-[7rem] lg:w-[9.44rem] lg:h-[6rem] md:w-[6rem] md:h-[4.5rem] sm:w-[5rem] sm:h-[3.5rem] w-[4.5rem] h-[2.5rem] bg-white">
                              
                            </div>
                            <div className="xl:w-[11.5rem] xl:h-[7rem] lg:w-[9.44rem] lg:h-[6rem] md:w-[6rem] md:h-[4.5rem] sm:w-[5rem] sm:h-[3.5rem] w-[4.5rem] h-[2.5rem] bg-white">

                            </div>
                        </div>
                        <div className="w-full xl:h-[6rem] border-2 border-transparent flex gap-4 justify-center items-center xl:mt-2 lg:mt-[2.7rem] md:mt-[1.2rem] sm:mt-[1rem] mt-0">
                            <div className="xl:w-[11.5rem] lg:w-[9.44rem]  md:w-[6rem] sm:w-[5rem] w-[4.5rem] h-full bg-transparent font-inter-400 text-base text-white flex flex-col justify-end items-start text-center">
                                <div className="flex flex-col text-sm md:text-base text-center justify-center items-center mb-2">
                                
                                </div>
                            </div>
                            <div className="xl:w-[11.5rem] lg:w-[9.44rem]  md:w-[6rem] sm:w-[5rem] w-[4.5rem] h-full bg-[#222222]">

                            </div>
                        </div>
                    </motion.div>
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
            <p className="text-lg mb-6">Please Select A Format</p>
            <Button  onClick={handleCloseModal} className="text-center hover:text-[black]">
              OK
            </Button>
          </div>
        </Modal>
          </div>
        )}
      </AnimatePresence>    

      
    </>
  );
}
