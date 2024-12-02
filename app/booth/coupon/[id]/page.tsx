'use client'
import { motion, AnimatePresence } from "framer-motion";
import state from "@/app/valtio_config";
import { useSnapshot } from "valtio";
import { IoIosArrowDropleft } from "react-icons/io";
import { IoIosArrowDropright } from "react-icons/io";
import Image from "next/image";
import { useState, useEffect } from "react";
import { QRCode } from 'antd';
import { Modal, Button } from 'antd'; 
import { useRouter } from "next/navigation";
import { useParams } from 'next/navigation'; // เพิ่ม useParams

export default function Coupon(){
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(true);
    const [isTimeout, setIsTimeout] = useState(false);
    const [selectedDiv, setSelectedDiv] = useState<string | null>(null); 
    const [showModal, setShowModal] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const handleCloseModal = () => setShowModal(false);
    const snap = useSnapshot(state);
    const params = useParams();
    const machineId = params.machineId as string; 



    const getText = (englishText: string, thaiText: string) => {
      return snap.language === "TH" ? thaiText : englishText;
    };

    const handleInput = (char: string) => {
      if (inputValue.length < 8) {
        setInputValue((prev) => prev + char); // เพิ่มตัวอักษรทีละตัวจนกว่าจะครบ 8 ตัว
      }
    };

    const handleDelete = () => {
      setInputValue((prev) => prev.slice(0, -1)); // ลบตัวอักษรตัวสุดท้ายออก
    };

    useEffect(() => {
      console.log('Machine ID:', machineId);
      console.log('Current intro state:', snap.intro);
      
      if (machineId) {
        state.intro = 11;
        localStorage.setItem('currentIntro', '11');
        console.log('Set intro to 11');
      }
    }, [machineId]);
     
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
     
     const handleNext = () => {
      const storedMachineId = localStorage.getItem('selectedMachineId');
     
      if (!storedMachineId) {
        console.error("No machine ID found");
        router.push('/dashboard');
        return;
      }
     
      if (inputValue.length !== 8) {
        setShowModal(true);
      } else {
        setIsVisible(false);
        setTimeout(() => {
          state.intro = 5;
          localStorage.setItem('currentIntro', '5');
          setIsVisible(true);
          setTimeout(() => {
            router.push(`/booth/selfie/${storedMachineId}`);
          }, 0);
        }, 1000);
      }
     };
     
     const handleBack = () => {
      const storedMachineId = localStorage.getItem('selectedMachineId');
     
      if (!storedMachineId) {
        console.error("No machine ID found");
        router.push('/dashboard');
        return;
      }
     
      setIsVisible(false);
      setTimeout(() => {
        state.intro = 3;
        localStorage.setItem('currentIntro', '3');
        setIsVisible(true);
        setTimeout(() => {
          router.push(`/booth/payment/${storedMachineId}`);
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
            {(snap.intro === 13 || window.location.pathname === '/booth/coupon') && isVisible && (
                <div className="w-screen h-screen flex flex-col justify-between border-transparent bg-[#F7F7F7] select-none">
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
                            {getText("COUPON", "คูปอง")}
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
                            {getText("COUPON", "คูปอง")}
                          </p>
                          <button 
                            className="font-inter-400 lg:text-xl text-white bg-[#222222] py-4 px-4 sm:py-4 sm:px-8 rounded-2xl flex items-center"
                            onClick={handleNext}
                          >
                            {getText("Confirm", "ยืนยัน")}
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
                                
                            </div>
                            <div className="w-[28rem] lg:w-[40rem] lg:h-[44rem] md:h-[40rem] h-[40rem]  border-[1px] border-transparent flex flex-col justify-start items-center bg-transparent">
                                <div className="w-full border-transparent mb-10 text-[#8E8E93] border-2 flex justify-center items-center font-ibm-thai-400 text-lg lg:text-2xl">
                                   {getText("Please enter the 8 digit code to use the coupon.","กรุณาใส่รหัส 8 หลัก เพื่อใช้คูปอง")}
                                </div>
                                <div className="w-[90%] h-[5rem] border-2 border-[#35353F] bg-white rounded-xl mb-10 flex justify-center items-center font-dream-sparks-400 lg:text-[3rem]">
                                  {inputValue}
                                </div>
                                <div className="w-[80%] border-2 border-transparent grid gap-4 grid-cols-4 grid-row-4">
                                <motion.button className="lg:w-[6.25rem] lg:h-[6.25rem] w-[5rem] h-[5rem] bg-[#16161F] flex justify-center items-center rounded-full shadow-lg font-dream-sparks-400 text-[3rem] lg:text-[3.5rem] "
                                  style={{ boxShadow: "0px 0px 15px 5px rgba(0, 0, 0, 0.15), 0px 0px 30px 15px rgba(0, 0, 0, 0.05)" }}
                                  whileTap={{scale : 0.8}}
                                  onClick={() => handleInput('1')}>
                                  <div className="absolute z-0 mr-[0.6rem] mb-[0.4rem]">
                                    1
                                  </div>
                                  <div className="absolute z-10 text-white">
                                    1
                                  </div>
                                </motion.button>
                               <motion.button className="lg:w-[6.25rem] lg:h-[6.25rem] w-[5rem] h-[5rem] bg-[#16161F] flex justify-center items-center rounded-full shadow-lg font-dream-sparks-400 text-[3rem] lg:text-[3.5rem] "
                                  style={{ boxShadow: "0px 0px 15px 5px rgba(0, 0, 0, 0.15), 0px 0px 30px 15px rgba(0, 0, 0, 0.05)" }}
                                  whileTap={{scale : 0.8}}
                                  onClick={() => handleInput('2')}>
                                  <div className="absolute z-0 mr-[0.6rem] mb-[0.4rem]">
                                    2
                                  </div>
                                  <div className="absolute z-10 text-white">
                                    2
                                  </div>
                                </motion.button>
                                <motion.button className="lg:w-[6.25rem] lg:h-[6.25rem] w-[5rem] h-[5rem] bg-[#16161F] flex justify-center items-center rounded-full shadow-lg font-dream-sparks-400 text-[3rem] lg:text-[3.5rem] "
                                  style={{ boxShadow: "0px 0px 15px 5px rgba(0, 0, 0, 0.15), 0px 0px 30px 15px rgba(0, 0, 0, 0.05)" }}
                                  whileTap={{scale : 0.8}}
                                  onClick={() => handleInput('3')}>
                                  <div className="absolute z-0 mr-[0.6rem] mb-[0.4rem]">
                                    3
                                  </div>
                                  <div className="absolute z-10 text-white">
                                    3
                                  </div>
                                </motion.button>
                                <motion.button className="lg:w-[6.25rem] lg:h-[6.25rem] w-[5rem] h-[5rem] bg-[#8E8E93] flex justify-center items-center rounded-full shadow-lg font-dream-sparks-400 text-[3rem] lg:text-[3.5rem] "
                                  style={{ boxShadow: "0px 0px 15px 5px rgba(0, 0, 0, 0.15), 0px 0px 30px 15px rgba(0, 0, 0, 0.05)" }}
                                  whileTap={{scale : 0.8}}
                                  onClick={() => handleInput('A')}>
                                  <div className="absolute z-0 mr-[0.6rem] mb-[0.4rem]">
                                    A
                                  </div>
                                  <div className="absolute z-10 text-white">
                                    A
                                  </div>
                                </motion.button>
                                <motion.button className="lg:w-[6.25rem] lg:h-[6.25rem] w-[5rem] h-[5rem] bg-[#16161F] flex justify-center items-center rounded-full shadow-lg font-dream-sparks-400 text-[3rem] lg:text-[3.5rem] "
                                  style={{ boxShadow: "0px 0px 15px 5px rgba(0, 0, 0, 0.15), 0px 0px 30px 15px rgba(0, 0, 0, 0.05)" }}
                                  whileTap={{scale : 0.8}}
                                  onClick={() => handleInput('4')}>
                                  <div className="absolute z-0 mr-[0.6rem] mb-[0.4rem]">
                                    4
                                  </div>
                                  <div className="absolute z-10 text-white">
                                    4
                                  </div>
                                </motion.button>
                                <motion.button className="lg:w-[6.25rem] lg:h-[6.25rem] w-[5rem] h-[5rem] bg-[#16161F] flex justify-center items-center rounded-full shadow-lg font-dream-sparks-400 text-[3rem] lg:text-[3.5rem] "
                                  style={{ boxShadow: "0px 0px 15px 5px rgba(0, 0, 0, 0.15), 0px 0px 30px 15px rgba(0, 0, 0, 0.05)" }}
                                  whileTap={{scale : 0.8}}
                                  onClick={() => handleInput('5')}>
                                  <div className="absolute z-0 mr-[0.6rem] mb-[0.4rem]">
                                    5
                                  </div>
                                  <div className="absolute z-10 text-white">
                                    5
                                  </div>
                                </motion.button>
                                <motion.button className="lg:w-[6.25rem] lg:h-[6.25rem] w-[5rem] h-[5rem] bg-[#16161F] flex justify-center items-center rounded-full shadow-lg font-dream-sparks-400 text-[3rem] lg:text-[3.5rem] "
                                  style={{ boxShadow: "0px 0px 15px 5px rgba(0, 0, 0, 0.15), 0px 0px 30px 15px rgba(0, 0, 0, 0.05)" }}
                                  whileTap={{scale : 0.8}}
                                  onClick={() => handleInput('6')}>
                                  <div className="absolute z-0 mr-[0.6rem] mb-[0.4rem]">
                                    6
                                  </div>
                                  <div className="absolute z-10 text-white">
                                    6
                                  </div>
                                </motion.button>
                                <motion.button className="lg:w-[6.25rem] lg:h-[6.25rem] w-[5rem] h-[5rem] bg-[#8E8E93] flex justify-center items-center rounded-full shadow-lg font-dream-sparks-400 text-[3rem] lg:text-[3.5rem] "
                                  style={{ boxShadow: "0px 0px 15px 5px rgba(0, 0, 0, 0.15), 0px 0px 30px 15px rgba(0, 0, 0, 0.05)" }}
                                  whileTap={{scale : 0.8}}
                                  onClick={() => handleInput('B')}>
                                  <div className="absolute z-0 mr-[0.6rem] mb-[0.4rem]">
                                    B
                                  </div>
                                  <div className="absolute z-10 text-white">
                                    B
                                  </div>
                                </motion.button>
                                <motion.button className="lg:w-[6.25rem] lg:h-[6.25rem] w-[5rem] h-[5rem] bg-[#16161F] flex justify-center items-center rounded-full shadow-lg font-dream-sparks-400 text-[3rem] lg:text-[3.5rem] "
                                  style={{ boxShadow: "0px 0px 15px 5px rgba(0, 0, 0, 0.15), 0px 0px 30px 15px rgba(0, 0, 0, 0.05)" }}
                                  whileTap={{scale : 0.8}}
                                  onClick={() => handleInput('7')}>
                                  <div className="absolute z-0 mr-[0.6rem] mb-[0.4rem]">
                                    7
                                  </div>
                                  <div className="absolute z-10 text-white">
                                    7
                                  </div>
                                </motion.button>
                                <motion.button className="lg:w-[6.25rem] lg:h-[6.25rem] w-[5rem] h-[5rem] bg-[#16161F] flex justify-center items-center rounded-full shadow-lg font-dream-sparks-400 text-[3rem] lg:text-[3.5rem] "
                                  style={{ boxShadow: "0px 0px 15px 5px rgba(0, 0, 0, 0.15), 0px 0px 30px 15px rgba(0, 0, 0, 0.05)" }}
                                  whileTap={{scale : 0.8}}
                                  onClick={() => handleInput('8')}>
                                  <div className="absolute z-0 mr-[0.6rem] mb-[0.4rem]">
                                    8
                                  </div>
                                  <div className="absolute z-10 text-white">
                                    8
                                  </div>
                                </motion.button>
                                <motion.button className="lg:w-[6.25rem] lg:h-[6.25rem] w-[5rem] h-[5rem] bg-[#16161F] flex justify-center items-center rounded-full shadow-lg font-dream-sparks-400 text-[3rem] lg:text-[3.5rem] "
                                  style={{ boxShadow: "0px 0px 15px 5px rgba(0, 0, 0, 0.15), 0px 0px 30px 15px rgba(0, 0, 0, 0.05)" }}
                                  whileTap={{scale : 0.8}}
                                  onClick={() => handleInput('9')}>
                                  <div className="absolute z-0 mr-[0.6rem] mb-[0.4rem]">
                                    9
                                  </div>
                                  <div className="absolute z-10 text-white">
                                    9
                                  </div>
                                </motion.button>
                                <motion.button className="lg:w-[6.25rem] lg:h-[6.25rem] w-[5rem] h-[5rem] bg-[#8E8E93] flex justify-center items-center rounded-full shadow-lg font-dream-sparks-400 text-[3rem] lg:text-[3.5rem] "
                                  style={{ boxShadow: "0px 0px 15px 5px rgba(0, 0, 0, 0.15), 0px 0px 30px 15px rgba(0, 0, 0, 0.05)" }}
                                  whileTap={{scale : 0.8}}
                                  onClick={() => handleInput('C')}>
                                  <div className="absolute z-0 mr-[0.6rem] mb-[0.4rem]">
                                    C
                                  </div>
                                  <div className="absolute z-10 text-white">
                                    C
                                  </div>
                                </motion.button>
                                <motion.button className="lg:w-[6.25rem] lg:h-[6.25rem] w-[5rem] h-[5rem] bg-[#16161F] flex justify-center items-center rounded-full shadow-lg font-dream-sparks-400 text-[3rem] lg:text-[3.5rem] "
                                  style={{ boxShadow: "0px 0px 15px 5px rgba(0, 0, 0, 0.15), 0px 0px 30px 15px rgba(0, 0, 0, 0.05)" }}
                                  whileTap={{scale : 0.8}}
                                  onClick={() => handleInput('#')}>
                                  <div className="absolute z-0 mr-[0.6rem] mt-2">
                                    #
                                  </div>
                                  <div className="absolute z-10 text-white mt-4">
                                    #
                                  </div>
                                </motion.button>
                                <motion.button className="lg:w-[6.25rem] lg:h-[6.25rem] w-[5rem] h-[5rem] bg-[#16161F] flex justify-center items-center rounded-full shadow-lg font-dream-sparks-400 text-[3rem] lg:text-[3.5rem] "
                                  style={{ boxShadow: "0px 0px 15px 5px rgba(0, 0, 0, 0.15), 0px 0px 30px 15px rgba(0, 0, 0, 0.05)" }}
                                  whileTap={{scale : 0.8}}
                                  onClick={() => handleInput('0')}>
                                  <div className="absolute z-0 mr-[0.6rem] mb-[0.4rem]">
                                    0
                                  </div>
                                  <div className="absolute z-10 text-white">
                                    0
                                  </div>
                                </motion.button>
                                <motion.div className="lg:w-[6.25rem] lg:h-[6.25rem] w-[5rem] h-[5rem] bg-[#16161F] cursor-pointer flex justify-center items-center rounded-full shadow-lg font-dream-sparks-400 text-[3rem] lg:text-[3.5rem] "
                                  style={{ boxShadow: "0px 0px 15px 5px rgba(0, 0, 0, 0.15), 0px 0px 30px 15px rgba(0, 0, 0, 0.05)" }}
                                  whileTap={{scale : 0.8}}
                                  onClick={handleDelete}>
                                    
                                  <div className="absolute z-10 text-white">
                                  <Image src="/del.png" alt="" width={10000} height={10000} className="w-[3rem] h-[2rem]"/>
                                  </div>
                                </motion.div>
                                
                                </div>
                            </div>
                            <div className="xl:w-[30rem] xl:h-[44rem] lg:w-[20rem] lg:h-[44rem] w-[30rem] h-[5rem]  border-2 border-transparent">
                            <div className="w-full h-full justify-end items-end border-2 border-transparent flex flex-col hidden lg:block ">
                                    <div className="border-2 border-transparent flex justify-end items-center gap-5">
                                   
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                        <Modal
                          open={showModal}
                          onOk={handleCloseModal}
                          onCancel={handleCloseModal}
                          centered
                          footer={null} // ซ่อน Footer เริ่มต้น
                          className="custom-modal select-none" // Custom class เพื่อกำหนดสไตล์เพิ่มเติม
                        >
                          <div className="flex flex-col justify-center items-center text-center">
                            <iframe src="https://lottie.host/embed/ffc20d8a-075d-4548-a3bf-6e32a66c5dd0/Cyhnz0Jxar.json"></iframe>
                            <p className="text-lg mb-6">{getText("Please fill in the coupon number completely.", "กรุณากรอกเลขคูปองให้ครบถ้วน")}</p>
                            <Button onClick={handleCloseModal} className="text-center hover:text-[black]">
                              {getText("OK", "ตกลง")}
                            </Button>
                          </div>
                        </Modal>
                </div>
            )}
            </AnimatePresence>
        </>
    )
}