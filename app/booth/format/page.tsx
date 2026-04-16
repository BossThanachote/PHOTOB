'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { IoIosArrowDropleft, IoIosArrowDropright } from "react-icons/io";
import { Modal, Button } from 'antd';
import { useSnapshot } from "valtio";
import state from "@/app/valtio_config";
import { supabase } from '@/app/lib/supabase';
import { Loader2, Camera } from "lucide-react"; 

interface MachineFrame {
  id: string;
  frame?: string;
  image?: string;
  frameName?: string;
  shot: number;
  cols: number; 
  rows: number; 
  price: number; 
}

const shakeAnimation = {
  rotate: [0, -2, 2, -2, 2, 0], // 🚀 ปรับสั่นให้เบาลงนิดนึงจะได้ดูสมูทบนจอเล็ก
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
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [machineFrames, setMachineFrames] = useState<MachineFrame[]>([]);

  useEffect(() => {
    setIsClient(true);
    state.intro = 2; 
    
    const fetchFrames = async () => {
      try {
        const boothId = localStorage.getItem('active_booth_id');
        if (!boothId) {
          alert("ยังไม่ได้ตั้งค่าตู้! ระบบจะพากลับไปหน้าแรก");
          router.push('/booth');
          return;
        }

        const { data: machine } = await supabase.from('machine').select('selected_frames').eq('id', boothId).single();
        
        if (machine && machine.selected_frames && machine.selected_frames.length > 0) {
          const { data: frames } = await supabase.from('frame').select('*').in('id', machine.selected_frames);
          
          if (frames) {
            const formattedFrames: MachineFrame[] = frames.map((f: any) => ({
              id: f.id,
              frameName: f.name,
              shot: f.shots_count,
              cols: f.cols,
              rows: f.rows , 
              price: f.price, 
              frame: f.image_url 
            }));
            setMachineFrames(formattedFrames);
          }
        }
      } catch (error) {
        console.error("Error fetching frames:", error);
      } finally {
        setIsLoading(false);
        setIsVisible(true); 
      }
    };

    fetchFrames();
  }, [router]);

  const getText = (en: string, th: string) => snap.language === "TH" ? th : en;

  const handleFrameClick = (frame: MachineFrame) => {
    if (selectedFrameId === frame.id) {
      setSelectedFrameId(null); 
    } else {
      setSelectedFrameId(frame.id);
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

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-[#F7F7F7]">
        <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="w-screen h-screen flex flex-col justify-between bg-[#F7F7F7] overflow-hidden">
          {/* Navbar */}
          <motion.div 
            className="flex justify-between items-center w-full px-6 md:px-10 py-4 md:py-5 shrink-0"
            variants={fadeUpVariant}
            initial="initial" animate="animate" exit="exit"
          >
            <button
              className="font-inter-400 text-sm md:text-xl text-[#666666] bg-white py-3 px-4 sm:px-8 rounded-2xl flex items-center shadow-sm hover:bg-gray-50"
              onClick={handleBack}
            >
              <IoIosArrowDropleft className="w-[1.5rem] h-[1.5rem] mr-2 md:mr-4 text-black" />
              {getText("Back", "กลับ")}
            </button>
            
            <p className="font-bebas-neue-400 md:text-[1.7rem] sm:text-[1.2rem] hidden md:block lg:text-[2rem] text-center" style={{ letterSpacing: '10px' }}>
              {getText("PLEASE SELECT FORMAT", "กรุณาเลือกแบบรูปภาพ")}
            </p>
            
            <button
              className="font-inter-400 text-sm md:text-xl text-white bg-[#222222] py-3 px-4 sm:px-8 rounded-2xl flex items-center shadow-md hover:bg-black"
              onClick={handleNext}
            >
              {getText("Next", "ถัดไป")}
              <IoIosArrowDropright className="w-[1.5rem] h-[1.5rem] ml-2 md:ml-4 text-white" />
            </button>
          </motion.div>

          <div className="flex justify-center md:hidden pb-2 shrink-0">
             <p className="font-bebas-neue-400 text-[1.5rem] text-center" style={{ letterSpacing: '5px' }}>
              {getText("PLEASE SELECT FORMAT", "กรุณาเลือกแบบรูปภาพ")}
            </p>
          </div>

          {/* 🚀 Main Content: ปรับ Layout การโชว์เฟรมให้รับกับทุกหน้าจอ ( Responsive Height ) */}
          <div className="flex-1 flex justify-center items-center gap-6 sm:gap-10 md:gap-16 lg:gap-20 overflow-x-auto overflow-y-hidden px-4 pb-6 min-h-0">
            {machineFrames.length === 0 ? (
              <div className="text-gray-400 text-2xl font-bold flex flex-col items-center gap-4">
                <p>ตู้นี้ยังไม่มีเฟรมรูปภาพ</p>
                <p className="text-sm font-normal">กรุณาแจ้งผู้ดูแลให้เพิ่มเฟรมใน Machine Management</p>
              </div>
            ) : (
              machineFrames.map((frame) => {
                const isSelected = selectedFrameId === frame.id;
                return (
                  <div key={frame.id} className="flex flex-col items-center shrink-0 h-full justify-center">
                    
                    {/* 🚀 ปรับขนาดกล่องเฟรมด้วย h-[xx_vh] และ aspect-[2/3] แทนการฟิกซ์ rem */}
                    <motion.div
                      className="relative w-auto h-[50vh] sm:h-[55vh] md:h-[60vh] lg:h-[65vh] max-h-[700px] aspect-[2/3] cursor-pointer"
                      initial={{ scale: 0 }}
                      animate={{ 
                        rotate: isSelected ? shakeAnimation.rotate : 0, 
                        scale: isSelected ? 1.03 : 1 
                      }}
                      transition={isSelected ? shakeAnimation.transition : { type: "spring" }}
                      onClick={() => handleFrameClick(frame)}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                           <p className="font-bebas-neue-400 lg:text-[4rem] md:text-[3rem] text-[2rem] text-white drop-shadow-md bg-black/30 px-4 py-2 rounded-xl backdrop-blur-sm">
                           SELECTED
                          </p>
                        </div>
                      )}
                      
                      <div className={`relative w-full h-full bg-white flex flex-col p-3 md:p-5 rounded-lg overflow-hidden border-4 transition-colors duration-300 ${isSelected ? 'border-black shadow-2xl' : 'border-transparent shadow-lg'}`}>
                        {frame.frame ? (
                          <Image src={frame.frame} alt={frame.frameName || 'Frame'} fill className="object-contain" />
                        ) : (
                          <>
                            <div 
                              className="w-full flex-1 grid gap-2 md:gap-3"
                              style={{
                                gridTemplateColumns: `repeat(${frame.cols}, minmax(0, 1fr))`,
                                gridTemplateRows: `repeat(${frame.rows}, minmax(0, 1fr))`
                              }}
                            >
                              {Array.from({ length: frame.shot }).map((_, i) => (
                                <div key={i} className="bg-gray-200 rounded-md shadow-inner w-full h-full flex items-center justify-center">
                                  <Camera size={24} className="text-gray-300 opacity-50" />
                                </div>
                              ))}
                            </div>

                            <div className="h-12 md:h-20 mt-3 flex items-center justify-center border-t-2 border-gray-100 border-dashed shrink-0">
                              <p className="font-dream-sparks-400 text-gray-300 text-xl md:text-2xl tracking-[5px]">
                                LOGO
                              </p>
                            </div>
                          </>
                        )}
                        <div className="absolute top-2 left-2 bg-black text-white text-[10px] md:text-xs px-2 py-1 rounded font-bold">
                          {frame.frameName}
                        </div>
                      </div>
                    </motion.div>
                    
                    {/* 🚀 ปุ่มราคาปรับขนาดให้รับกับกล่อง */}
                    <motion.div
                      className="mt-4 md:mt-6 w-[12rem] md:w-[14rem] h-[3.5rem] md:h-[4rem] border-2 border-black flex justify-center items-center font-bebas-neue-400 text-[1.5rem] md:text-[1.8rem] rounded-xl bg-white shrink-0"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                    >
                      {getText(`${frame.price} BAHT`, `${frame.price} บาท`)}
                    </motion.div>
                  </div>
                );
              })
            )}
          </div>

          <Modal open={showModal} onCancel={() => setShowModal(false)} centered footer={null} className="select-none">
            <div className="flex flex-col items-center text-center p-4">
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