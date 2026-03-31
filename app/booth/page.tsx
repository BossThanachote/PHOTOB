'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi";
import { useSnapshot } from "valtio";
import state from "@/app/valtio_config";

// 1. แยก Animation Variants ออกมาด้านนอก Component เพื่อให้โค้ดสะอาดและไม่ถูกสร้างใหม่ทุกรอบที่ Render
const bounceRight = {
  hidden: { x: 10 },
  visible: { x: [0, 10, 0], transition: { duration: 0.8, ease: [0.5, 0.05, -0.01, 0.9], repeat: Infinity } },
};

const bounceLeft = {
  hidden: { x: -10 },
  visible: { x: [0, -10, 0], transition: { duration: 0.8, ease: [0.5, 0.05, -0.01, 0.9], repeat: Infinity } },
};

const fadeUpVariant = {
  initial: { y: -100, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { type: "spring", damping: 5, stiffness: 30 } },
  exit: { y: -200, opacity: 0, transition: { opacity: { duration: 1 }, duration: 0.3 } }
};

export default function Main() {
  const router = useRouter();
  const snap = useSnapshot(state);
  
  const [isMounted, setIsMounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false); 

  // 2. จัดการ Hydration และ Set Initial State
  useEffect(() => {
    setIsMounted(true);
    state.intro = 1; // รีเซ็ตสถานะเมื่อเข้ามาหน้านี้
  }, []);
  
  const getText = (en: string, th: string) => snap.language === "TH" ? th : en;

  const changeLanguage = (e: React.MouseEvent, lang: "EN" | "TH") => {
    e.stopPropagation(); // ป้องกันไม่ให้คลิกธงแล้วไปทริกเกอร์การเปลี่ยนหน้า
    state.language = lang; 
  };

  // 3. ปรับ Logic การเปลี่ยนหน้าให้เคลียร์ขึ้น
  const handleStartProcess = () => {
    if (isExiting) return; // ป้องกันการกดเบิ้ล
    
    setIsExiting(true); // เริ่มเล่น Exit Animation
    
    // รอให้ Animation เล่นจบ (1 วินาที) แล้วค่อยให้ Next.js เปลี่ยน URL
    setTimeout(() => {
      state.intro = 2;
      router.push(`/booth/format`); 
    }, 1000);
  };

  // ถ้า Component ยังไม่เมาท์ที่ฝั่ง Client ให้ Return null เพื่อป้องกัน Hydration Mismatch
  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {!isExiting && (
        <div 
          className="w-screen h-screen bg-[#F7F7F7] flex justify-center items-center relative overflow-hidden cursor-pointer"
          onClick={handleStartProcess}
        >
          {/* ส่วนเลือกภาษา */}
          <motion.div 
            className="w-[90%] h-[7rem] lg:h-[10rem] top-0 absolute z-20 flex items-center justify-end gap-3"
            variants={fadeUpVariant}
            initial="initial" animate="animate" exit="exit"
          >
            <Image 
              src="/US.png" alt="English" width={80} height={56} 
              className="w-[5rem] h-[3.5rem] cursor-pointer hover:scale-105 transition-transform" 
              onClick={(e) => changeLanguage(e, "EN")}
            />
            <Image 
              src="/TH.png" alt="Thai" width={80} height={56} 
              className="w-[5rem] h-[3.5rem] cursor-pointer hover:scale-105 transition-transform" 
              onClick={(e) => changeLanguage(e, "TH")}
            />
          </motion.div>
        
          <div className="w-[50rem] h-full flex flex-col relative pointer-events-none">
            
            {/* โลโก้ */}
            <motion.div
              className="w-full h-[20rem] flex justify-center items-center mt-[8rem] md:mt-[15rem] relative"
              initial={{ y: -500, opacity: 0 }} 
              animate={{ y: 0, opacity: 1, transition: { type: "spring", damping: 7 } }} 
              exit={{ y: -500, opacity: 0, transition: { duration: 0.8, ease: "backIn" } }}
            >
              {/* ใช้ text-shadow ช่วยแทนการซ้อน Text 2 ชั้น (ถ้าปรับใน Tailwind Config ได้) แต่ตอนนี้คงโครงสร้างเดิมไว้ให้ */}
              <motion.p
                className="font-dream-sparks-400 md:text-[13.8rem] sm:text-[10rem] text-[8rem] absolute z-0 select-none text-gray-800" 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                LOGO
              </motion.p>
              <motion.p
                className="font-dream-sparks-400 md:text-[13.8rem] sm:text-[10rem] text-[8rem] absolute z-10 text-white ml-3 mt-1 select-none drop-shadow-lg" 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                LOGO
              </motion.p>
            
              <motion.p
                className="md:text-2xl sm:text-xl text-black mt-[15rem] md:ml-0 sm:ml-7 relative z-20 select-none tracking-[22px]" 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                photo booth
              </motion.p>
            </motion.div>

            {/* ส่วน Touch Screen (กระพริบลูกศร) */}
            <motion.div 
              className="w-full h-full mt-[10rem] flex justify-center items-center mb-[20rem] lg:mb-[10rem]"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1, transition: { delay: 0.5, duration: 1 } }}
              exit={{ scale: 1.5, opacity: 0, transition: { duration: 0.8 } }}
            >
              <motion.span variants={bounceRight} initial="hidden" animate="visible">
                <BiSolidRightArrow className="text-[2rem] select-none text-gray-700" />
              </motion.span>
              
              <p className="font-dream-sparks-400 text-[2rem] mx-[2rem] mt-8 select-none text-gray-800">
                {getText("TOUCH SCREEN", "แตะหน้าจอ")}
              </p> 
              
              <motion.span variants={bounceLeft} initial="hidden" animate="visible">
                <BiSolidLeftArrow className="text-[2rem] select-none text-gray-700" /> 
              </motion.span>
            </motion.div>

          </div>
        </div>
      )}
    </AnimatePresence>
  );
}