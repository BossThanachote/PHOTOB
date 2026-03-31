'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { IoIosArrowDropleft, IoIosArrowDropright } from "react-icons/io";
import { Modal, Button } from 'antd';
import { useSnapshot } from "valtio";
import state from "@/app/valtio_config";
import 'antd/dist/reset.css';

interface MachineFrame {
  id: string;
  frame?: string;
  image?: string;
  frameName?: string;
  shot: number;
  price: number; // แนะนำให้เพิ่ม price เข้ามาใน Schema เผื่ออนาคตราคาแต่ละเฟรมไม่เท่ากัน
}

// แยก Animation ออกมาด้านนอก
const shakeAnimation = {
  rotate: [0, -5, 5, -5, 5, 0],
  transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 },
};

const fadeUpVariant = {
  initial: { y: -100, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { type: "spring", damping: 5, stiffness: 30 } },
  exit: { y: -200, opacity: 0, transition: { duration: 0.3 } }
};

export default function Format() {
  const router = useRouter();
  const snap = useSnapshot(state);
  
  const [isClient, setIsClient] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // เปลี่ยนจากเก็บ Index (1,2,3) มาเก็บ ID ของเฟรมแทน (เตรียมรับ Database)
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // 🚀 [TODO: Database] จุดนี้ในอนาคตเราจะเปลี่ยนไปใช้ useEffect fetch('/api/frames') หรือ Server Action ของ Prisma
  const [machineFrames] = useState<MachineFrame[]>([
    { id: "frame-001", frameName: "Frame 1", shot: 3, price: 120, frame: "https://via.placeholder.com/300x400?text=Frame+1" },
    { id: "frame-002", frameName: "Frame 2", shot: 4, price: 120, frame: "https://via.placeholder.com/300x400?text=Frame+2" },
    { id: "frame-003", frameName: "Frame 3", shot: 3, price: 120, frame: "https://via.placeholder.com/300x400?text=Frame+3" }
  ]);

  useEffect(() => {
    setIsClient(true);
    state.intro = 2; // อัปเดต State ปัจจุบัน
    
    const timer = setTimeout(() => setIsVisible(true), 500); // ลดเวลาหน่วงลงหน่อยเพื่อให้ UI ตอบสนองเร็วขึ้น
    return () => clearTimeout(timer);
  }, []);

  const getText = (en: string, th: string) => snap.language === "TH" ? th : en;

  // จัดการเมื่อคลิกเลือกเฟรม
  const handleFrameClick = (frame: MachineFrame) => {
    if (selectedFrameId === frame.id) {
      setSelectedFrameId(null); // ยกเลิกการเลือก
    } else {
      setSelectedFrameId(frame.id);
      
      // อัปเดตเข้า Valtio State ทันที
      state.selfieData = {
        step: 1,
        countdown: 12,
        doneDelay: false,
        isExiting: false
      };
    }
  };

  const handleNext = () => {
    if (!selectedFrameId) {
      setShowModal(true);
      return;
    }

    const selectedFrame = machineFrames.find(f => f.id === selectedFrameId);
    if (selectedFrame) {
      // แนะนำว่าถ้าใช้ Valtio โยนข้อมูลเข้า Valtio จะดีที่สุด แต่คง localStorage ไว้ให้ก่อน
      localStorage.setItem('selectedFrameId', selectedFrame.id);
      localStorage.setItem('selectedFrame', JSON.stringify(selectedFrame));
      localStorage.setItem('selectedFrameShot', selectedFrame.shot.toString());
      localStorage.setItem('lastSelectedTime', Date.now().toString());
      
      setIsVisible(false);
      setTimeout(() => {
        router.push(`/booth/payment`);
      }, 500);
    }
  };

  const handleBack = () => {
    setIsVisible(false);
    setTimeout(() => {
      router.push(`/booth`);
    }, 500);
  };

  if (!isClient) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="w-screen h-screen flex flex-col justify-between bg-[#F7F7F7]">
          
          {/* Navbar */}
          <motion.div 
            className="flex justify-between items-center w-full px-10 py-5"
            variants={fadeUpVariant}
            initial="initial" animate="animate" exit="exit"
          >
            <button
              className="font-inter-400 lg:text-xl text-[#666666] bg-white py-4 px-4 sm:px-8 rounded-2xl flex items-center shadow-sm hover:bg-gray-50"
              onClick={handleBack}
            >
              <IoIosArrowDropleft className="w-[1.5rem] h-[1.5rem] mr-4 text-black" />
              {getText("Back", "กลับ")}
            </button>
            
            <p className="font-bebas-neue-400 md:text-[1.7rem] sm:text-[1.2rem] hidden md:block lg:text-[2rem] text-center" style={{ letterSpacing: '10px' }}>
              {getText("PLEASE SELECT FORMAT", "กรุณาเลือกแบบรูปภาพ")}
            </p>
            
            <button
              className="font-inter-400 lg:text-xl text-white bg-[#222222] py-4 px-4 sm:px-8 rounded-2xl flex items-center shadow-md hover:bg-black"
              onClick={handleNext}
            >
              {getText("Next", "ถัดไป")}
              <IoIosArrowDropright className="w-[1.5rem] h-[1.5rem] ml-4 text-white" />
            </button>
          </motion.div>

          {/* Title สำหรับ Mobile (แสดงเมื่อจอเล็ก) */}
          <div className="flex justify-center md:hidden pb-4">
             <p className="font-bebas-neue-400 text-[1.5rem] text-center" style={{ letterSpacing: '5px' }}>
              {getText("PLEASE SELECT FORMAT", "กรุณาเลือกแบบรูปภาพ")}
            </p>
          </div>

          {/* Main Content: รายการเฟรม */}
          <div className="flex-1 flex justify-center items-center gap-4 sm:gap-10 md:gap-16 lg:gap-24 overflow-x-auto px-4 pb-10">
            {machineFrames.map((frame) => {
              const isSelected = selectedFrameId === frame.id;

              return (
                <div key={frame.id} className="flex flex-col items-center shrink-0">
                  <motion.div
                    className="relative xl:w-[29rem] xl:h-[41rem] lg:w-[25rem] lg:h-[37rem] md:w-[17rem] md:h-[29rem] sm:w-[15rem] sm:h-[24rem] w-[12rem] h-[24rem] cursor-pointer"
                    initial={{ scale: 0 }}
                    animate={{ 
                      rotate: isSelected ? shakeAnimation.rotate : 0, 
                      scale: isSelected ? 1.05 : 1 
                    }}
                    transition={isSelected ? shakeAnimation.transition : { type: "spring" }}
                    onClick={() => handleFrameClick(frame)}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                         <p className="font-bebas-neue-400 lg:text-[4rem] text-[2rem] text-white drop-shadow-md bg-black/30 px-4 py-2 rounded-xl backdrop-blur-sm">
                          SELECTED
                        </p>
                      </div>
                    )}
                    
                    {/* แก้ไข Next/Image ให้ใช้ fill และ object-contain */}
                    <div className={`relative w-full h-full rounded-lg overflow-hidden border-4 transition-colors duration-300 ${isSelected ? 'border-black' : 'border-transparent shadow-lg'}`}>
                      <Image
                        src={frame.frame || frame.image || ''}
                        alt={frame.frameName || 'Frame'}
                        fill
                        className="object-contain bg-white"
                      />
                    </div>
                  </motion.div>
                  
                  {/* ราคา */}
                  <motion.div
                    className="mt-6 w-[14rem] h-[4rem] border-2 border-black flex justify-center items-center font-bebas-neue-400 text-[1.8rem] rounded-xl bg-white"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                  >
                    {getText(`${frame.price} BAHT`, `${frame.price} บาท`)}
                  </motion.div>
                </div>
              );
            })}
          </div>

          {/* Modal แจ้งเตือน */}
          <Modal open={showModal} onCancel={() => setShowModal(false)} centered footer={null} className="select-none">
            <div className="flex flex-col items-center text-center p-4">
              {/* แนะนำให้โหลดไฟล์ json มาเก็บในโปรเจกต์ หรือใช้ lottie-react แทน iframe เพื่อประสิทธิภาพ */}
              <iframe src="https://lottie.host/embed/ffc20d8a-075d-4548-a3bf-6e32a66c5dd0/Cyhnz0Jxar.json" className="w-48 h-48 border-none"></iframe>
              <p className="text-xl mb-6 font-medium">{getText("Please Select A Format", "กรุณาเลือกแบบรูปภาพก่อนไปต่อ")}</p>
              <Button size="large" type="primary" className="bg-black hover:bg-gray-800 px-10" onClick={() => setShowModal(false)}>
                {getText("OK", "ตกลง")}
              </Button>
            </div>
          </Modal>

        </div>
      )}
    </AnimatePresence>
  );
}