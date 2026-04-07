'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi";
import { Settings, MonitorPlay, X } from "lucide-react"; // <-- เพิ่ม Icon สำหรับตั้งค่า
import { useSnapshot } from "valtio";
import state from "@/app/valtio_config";
import { supabase } from '@/app/lib/supabase'; // <-- นำเข้า Supabase

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

  // --- State สำหรับ Setup Mode ---
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [machines, setMachines] = useState<any[]>([]);
  const [activeBoothName, setActiveBoothName] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    state.intro = 1;

    // เช็คว่าเคยตั้งค่าตู้ไว้หรือยัง
    const savedBoothId = localStorage.getItem('active_booth_id');
    const savedBoothName = localStorage.getItem('active_booth_name');
    if (savedBoothName) setActiveBoothName(savedBoothName);
  }, []);

  // ฟังก์ชันโหลดรายชื่อตู้ทั้งหมดเมื่อเปิด Modal ตั้งค่า
  const openSetup = async (e: React.MouseEvent) => {
    e.stopPropagation(); // กันไม่ให้เผลอกดเปลี่ยนหน้า
    setIsSetupOpen(true);
    const { data } = await supabase.from('machine').select('*').order('name');
    setMachines(data || []);
  };

  // บันทึกการตั้งค่าตู้ลงเครื่อง
  const selectMachine = (machine: any) => {
    localStorage.setItem('active_booth_id', machine.id);
    localStorage.setItem('active_booth_name', machine.name);
    setActiveBoothName(machine.name);
    setIsSetupOpen(false);
  };

  const getText = (en: string, th: string) => snap.language === "TH" ? th : en;

  const changeLanguage = (e: React.MouseEvent, lang: "EN" | "TH") => {
    e.stopPropagation(); 
    state.language = lang; 
  };

  const handleStartProcess = () => {
    // ถ้ายังไม่ได้ตั้งค่าตู้ ไม่ให้ผ่าน
    if (!localStorage.getItem('active_booth_id')) {
      alert("กรุณาตั้งค่าเครื่อง Photobooth ก่อนใช้งาน (กดปุ่มฟันเฟืองมุมขวาบน)");
      return;
    }

    if (isExiting) return; 
    setIsExiting(true); 
    setTimeout(() => {
      state.intro = 2;
      router.push(`/booth/format`); 
    }, 1000);
  };

  if (!isMounted) return null;

  return (
    <>
      <AnimatePresence>
        {!isExiting && (
          <div 
            className="w-screen h-screen bg-[#F7F7F7] flex justify-center items-center relative overflow-hidden cursor-pointer"
            onClick={handleStartProcess}
          >
            {/* --- ปุ่มตั้งค่าลับ (Admin) --- */}
            <button 
              onClick={openSetup}
              className="absolute top-6 right-6 z-50 p-3 bg-white/50 backdrop-blur-md rounded-full shadow-sm text-gray-400 hover:text-[#9B1C27] hover:bg-white transition-all"
            >
              <Settings size={24} />
            </button>

            {/* โชว์ชื่อตู้มุมซ้ายบน (ถ้าตั้งค่าแล้ว) */}
            {activeBoothName && (
              <div className="absolute top-6 left-6 z-50 px-4 py-2 bg-black/10 backdrop-blur-sm rounded-full text-sm font-bold text-gray-500 pointer-events-none">
                📍 {activeBoothName}
              </div>
            )}

            {/* ส่วนเลือกภาษา (โค้ดเดิมของ Boss) */}
            <motion.div 
              className="w-[90%] h-[7rem] lg:h-[10rem] top-0 absolute z-20 flex items-center justify-end gap-3 pr-16" // เพิ่ม pr-16 หลบปุ่มตั้งค่า
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
              {/* โลโก้ (โค้ดเดิม) */}
              <motion.div
                className="w-full h-[20rem] flex justify-center items-center mt-[8rem] md:mt-[15rem] relative"
                initial={{ y: -500, opacity: 0 }} 
                animate={{ y: 0, opacity: 1, transition: { type: "spring", damping: 7 } }} 
                exit={{ y: -500, opacity: 0, transition: { duration: 0.8, ease: "backIn" } }}
              >
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

              {/* ส่วน Touch Screen (กระพริบลูกศร โค้ดเดิม) */}
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

      {/* --- Modal เลือกเครื่อง (Setup Mode) --- */}
      {isSetupOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-ibm-thai">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Settings className="text-[#9B1C27]" /> ตั้งค่าเครื่อง
              </h2>
              <button onClick={() => setIsSetupOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={16}/></button>
            </div>
            
            <p className="text-sm text-gray-500 mb-4">เลือกตู้ที่ต้องการให้คอมพิวเตอร์เครื่องนี้แสดงผล</p>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {machines.map(m => (
                <button
                  key={m.id}
                  onClick={() => selectMachine(m)}
                  className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                    localStorage.getItem('active_booth_id') === m.id 
                      ? 'border-[#9B1C27] bg-red-50 text-[#9B1C27]' 
                      : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 font-bold">
                    <MonitorPlay /> {m.name}
                  </div>
                  <span className="text-xs bg-white px-2 py-1 rounded-md shadow-sm border">
                    {m.selected_frames?.length || 0} เฟรม
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}