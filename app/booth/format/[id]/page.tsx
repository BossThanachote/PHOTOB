'use client'
import { motion, AnimatePresence } from "framer-motion";
import state from "@/app/valtio_config";
import { useSnapshot } from "valtio";
import { IoIosArrowDropleft } from "react-icons/io";
import { IoIosArrowDropright } from "react-icons/io";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Modal, Button } from 'antd';
import 'antd/dist/reset.css';
import { useRouter } from "next/navigation";
import { useParams } from 'next/navigation';
import machineService from '@/app/services/machineService';
import { StatusType } from '@/types/types';

interface MachineFrame {
  id: string;
  frame?: string;
  image?: string;
  frameName?: string;
  shot: number;
}

export default function Format() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const snap = useSnapshot(state);
  const [selectedDiv, setSelectedDiv] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const params = useParams();
  const machineId = params.machineId as string;
  
  // State สำหรับ hover และ tap animations
  const [isHoveredDiv1, setIsHoveredDiv1] = useState(false);
  const [isTappedDiv1, setIsTappedDiv1] = useState(false);
  const [isHoveredDiv2, setIsHoveredDiv2] = useState(false);
  const [isTappedDiv2, setIsTappedDiv2] = useState(false);
  const [isHoveredDiv3, setIsHoveredDiv3] = useState(false);
  const [isTappedDiv3, setIsTappedDiv3] = useState(false);
  const [isHoveredDiv4, setIsHoveredDiv4] = useState(false);
  const [isTappedDiv4, setIsTappedDiv4] = useState(false);

  // State สำหรับเก็บข้อมูล frames
  const [machineFrames, setMachineFrames] = useState<MachineFrame[]>([]);

  const getMachineFramesFromStorage = (machineId: string): MachineFrame[] => {
    if (typeof window === 'undefined') return [];
    const storedFrames = localStorage.getItem(`machine_frames_${machineId}`);
    return storedFrames ? JSON.parse(storedFrames) : [];
  };

  // ตั้งค่าเริ่มต้นและดึงข้อมูล frames
  useEffect(() => {
    console.log('Machine ID:', machineId);
    console.log('Current intro state:', snap.intro);

    if (machineId) {
      state.intro = 2;
      localStorage.setItem('currentIntro', '2');
      console.log('Set intro to 2');
    }

    const fetchMachineFrames = async () => {
      try {
        const storedMachineId = machineId || localStorage.getItem('selectedMachineId');
        
        if (!storedMachineId) {
          console.error("No machine ID found");
          router.push('/dashboard');
          return;
        }

        // ลองดึงจาก localStorage ก่อน
        const storedFrames = getMachineFramesFromStorage(storedMachineId);
        if (storedFrames.length > 0) {
          setMachineFrames(storedFrames);
          return;
        }

        // ถ้าไม่มีใน localStorage ดึงจาก API
        const response = await machineService.getTransactions();
        const targetMachine = response.find(machine => machine.id === storedMachineId);
        
        if (targetMachine?.frames) {
          setMachineFrames(targetMachine.frames);
          localStorage.setItem(
            `machine_frames_${storedMachineId}`,
            JSON.stringify(targetMachine.frames)
          );
        }
      } catch (error) {
        console.error('Error fetching machine frames:', error);
      }
    };

    fetchMachineFrames();
  }, [machineId]);

  // จัดการการย้อนกลับของเบราว์เซอร์
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

  // Animation delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const getText = (englishText: string, thaiText: string) => {
    return snap.language === "TH" ? thaiText : englishText;
  };

  const handleNext = () => {
    const storedMachineId = localStorage.getItem('selectedMachineId');
  
    if (!storedMachineId) {
      console.error("No machine ID found");
      router.push('/dashboard');
      return;
    }
  
    if (selectedDiv === null) {
      setShowModal(true);
    } else {
      // เก็บข้อมูล frame ที่เลือก
      const selectedFrame = machineFrames[selectedDiv - 1];
      if (selectedFrame) {
        // เก็บข้อมูล frame ลง localStorage
        localStorage.setItem('selectedFrameId', selectedFrame.id);
        localStorage.setItem('selectedFrame', JSON.stringify(selectedFrame));
        
        // เก็บค่า shot
        const shotValue = localStorage.getItem(`frame_shot_${selectedFrame.id}`);
        if (shotValue) {
          localStorage.setItem('selectedFrameShot', shotValue);
        }
  
        // Trigger storage event เพื่อให้ components อื่นรับรู้การเปลี่ยนแปลง
        window.dispatchEvent(new Event('storage'));
      }
  
      // Reset states และ navigate
      setSelectedDiv(null);
      setIsVisible(false);
  
      setTimeout(() => {
        state.intro = 3;
        localStorage.setItem('currentIntro', '3');
        setIsVisible(true);
  
        // เก็บข้อมูลเพิ่มเติมที่อาจจำเป็น
        localStorage.setItem('lastSelectedTime', Date.now().toString());
  
        setTimeout(() => {
          router.push(`/booth/payment/${storedMachineId}`);
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

    setSelectedDiv(null);
    setIsVisible(false);
    setTimeout(() => {
      state.intro = 1;
      localStorage.setItem('currentIntro', '1');
      setIsVisible(true);
      setTimeout(() => {
        router.push(`/booth/${storedMachineId}`);
      }, 0);
    }, 1000);
  };

  const handleDivClick = (divNumber: number) => {
    if (selectedDiv === divNumber) {
      setSelectedDiv(null);
    } else {
      setSelectedDiv(divNumber);
      state.selectedDiv = divNumber;
  
      // ดึงค่า shot จาก localStorage ของ frame ที่เลือก
      const selectedFrame = machineFrames[divNumber - 1];
      if (selectedFrame) {
        const shotValue = getShotFromStorage(selectedFrame.id);
        console.log("Selected frame shot:", shotValue);
        
        // เก็บค่า shot ลง localStorage สำหรับหน้า Selfie
        localStorage.setItem('selectedFrameShot', shotValue.toString());
      }
  
      // รีเซ็ตค่าต่างๆ ใน Selfie
      state.selfieData = {
        step: 1,
        countdown: 12,
        doneDelay: false,
        isExiting: false
      };
    }
  };
  
  // เพิ่มฟังก์ชัน getShotFromStorage เหมือนกับในหน้า FrameManagement
  const getShotFromStorage = (frameId: string): number => {
    if (typeof window === 'undefined') return 3;
    const storedShot = localStorage.getItem(`frame_shot_${frameId}`);
    const shotValue = storedShot ? parseInt(storedShot) : 3;
    console.log('Getting shot from storage:', {
      frameId,
      storedShot,
      shotValue
    });
    return shotValue;
  };

  const handleCloseModal = () => setShowModal(false);

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

  return (
    <>
      <AnimatePresence>
        {(snap.intro === 2 || window.location.pathname === `/booth/format/${machineId}`) && isVisible && (
          <div className="w-screen h-screen flex flex-col justify-between border-transparent">
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
                {getText("PLEASE SELECT FORMAT", "กรุณาเลือกแบบรูปภาพ")}
              </motion.p>
            </div>

            <motion.div 
              className="flex justify-between items-center w-full px-10 py-1 border-b border-transparent"
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
                <IoIosArrowDropleft className="w-[1.5rem] h-[1.5rem] mr-4 text-black" />
                {getText("Back", "กลับ")}
              </button>
              <p
                className="font-bebas-neue-400 md:text-[1.7rem] sm:text-[1.2rem] hidden md:block lg:text-[2rem] pt-[1.2rem] select-none"
                style={{ letterSpacing: '10px' }}
              >
                {getText("PLEASE SELECT FORMAT", "กรุณาเลือกแบบรูปภาพ")}
              </p>
              <button
                className="font-inter-400 lg:text-xl text-white bg-[#222222] py-4 px-4 sm:py-4 sm:px-8 rounded-2xl flex items-center"
                onClick={handleNext}
              >
                {getText("Next", "ถัดไป")}
                <IoIosArrowDropright className="w-[1.5rem] h-[1.5rem] ml-4 text-white" />
              </button>
            </motion.div>

            {/* Main Content */}
            <div className="w-full h-full flex justify-center items-center gap-2 sm:gap-[3rem] md:gap-[5rem] lg:gap-[2rem] xl:gap-[10rem] 2xl:gap-[20rem] border-2 border-transparent pb-[4rem] select-none">
              {machineFrames.map((frame, index) => (
                <div key={frame.id}>
                  <motion.div
                    className="relative xl:w-[29.06rem] xl:h-[41.19rem] lg:w-[25rem] lg:h-[37.13rem] md:w-[17rem] md:h-[29.13rem] sm:w-[15rem] sm:h-[24.13rem] w-[12rem] h-[24.13rem] border-2 border-transparent cursor-pointer"
                    initial={{ scale: 0 }}
                    animate={{
                      rotate: selectedDiv === (index + 1) ? shakeAnimation.rotate : 0,
                      scale: selectedDiv === (index + 1) ? 1 : 1,
                    }}
                    transition={selectedDiv === (index + 1) ? shakeAnimation.transition : {}}
                    exit={exitAnimation}
                    onClick={() => handleDivClick(index + 1)}
                  >
                    {selectedDiv === (index + 1) && (
                      <p className="font-bebas-neue-400 lg:text-[3rem] md:text-[2rem] text-[1.5rem] absolute z-20 text-center w-full">
                        SELECTED
                      </p>
                    )}
                    <Image
                      src={frame.frame || frame.image || ''}
                      alt={frame.frameName || `Frame ${index + 1}`}
                      layout="fill"
                      objectFit="contain"
                      className={`transition-transform duration-300 ${
                        selectedDiv === (index + 1) ? 'scale-105' : ''
                      }`}
                    />
                  </motion.div>
                  <div className="text-center mt-4">
                    <motion.div
                      className="w-[18rem] h-[5rem] border-[1px] flex justify-center items-center font-bebas-neue-400 text-[2rem]"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 20,
                      }}
                    >
                      {getText("120 BAHT", "120 บาท")}
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal */}
           {/* Modal */}
           <Modal
              open={showModal}
              onOk={handleCloseModal}
              onCancel={handleCloseModal}
              centered
              footer={null}
              className="custom-modal select-none"
            >
              <div className="flex flex-col justify-center items-center text-center">
                <iframe src="https://lottie.host/embed/ffc20d8a-075d-4548-a3bf-6e32a66c5dd0/Cyhnz0Jxar.json"></iframe>
                <p className="text-lg mb-6">{getText("Please Select A Format", "กรุณาเลือกแบบรูปภาพ")}</p>
                <Button onClick={handleCloseModal} className="text-center hover:text-[black]">
                  {getText("OK", "ตกลง")}
                </Button>
              </div>
            </Modal>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}