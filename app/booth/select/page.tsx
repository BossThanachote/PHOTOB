'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; 
import { motion, AnimatePresence } from "framer-motion";
import { IoIosArrowDropleft, IoIosArrowDropright } from "react-icons/io";
import Image from "next/image";
import { Modal, Button } from 'antd'; 
import { useSnapshot } from "valtio";
import state from "@/app/valtio_config"; 
import { useBoothSession } from "@/app/lib/useBoothSession"; 
import { Loader2 } from "lucide-react";

const ImageIcon = () => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-white" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
);

export default function Select() {
  const snap = useSnapshot(state);
  const router = useRouter(); 
  const { session, isLoading } = useBoothSession(); 
  
  const [isClient, setIsClient] = useState(false);
  const [isVisible, setIsVisible] = useState(false); 
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);

  const maxSlots = session?.frame?.shot || 6; 
  const frameCols = session?.frame?.cols || 2;

  useEffect(() => {
    setIsClient(true);
    state.intro = 6; 
    
    setSelectedImages(Array(maxSlots).fill(""));
    
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, [maxSlots]);

  const getText = (en: string, th: string) => snap.language === "TH" ? th : en;

  const handleNext = () => {
    const isFull = selectedImages.every(image => image !== "");
    
    if (!isFull) {
      setShowModal(true); 
    } else {
      setIsVisible(false); 
      setTimeout(() => {
        state.selectedImages = [...selectedImages];
        state.intro = 7; 
        localStorage.setItem('currentIntro', '7'); 
        router.push('/booth/custom'); 
      }, 500); 
    }
  };

  const handleBack = () => {
    setIsVisible(false); 
    setTimeout(() => {
      state.imageSrcs = [];  
      state.intro = 5; 
      localStorage.setItem('currentIntro', '5');
      router.push('/booth/camera'); 
    }, 500); 
  };

  const handleImageClick = (src: string) => {
    if (selectedImages.includes(src)) return; 

    const nextEmptyIndex = selectedImages.findIndex(img => img === "");
    if (nextEmptyIndex !== -1) {
        const updatedImages = [...selectedImages];
        updatedImages[nextEmptyIndex] = src;
        setSelectedImages(updatedImages);
    }
  };

  const handleClearImage = (index: number) => {
    const updatedImages = [...selectedImages];
    updatedImages[index] = "";
    setSelectedImages(updatedImages);
  };

  if (!isClient) return null;

  if (isLoading || !session) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-12 h-12" /></div>
  }

  return (
    <AnimatePresence> 
      {isVisible && (
        <div className="w-screen h-screen flex flex-col justify-between bg-[#F7F7F7] select-none absolute top-0 left-0 z-50">
          
          {/* Navbar */}
          <motion.div 
            className="flex justify-between items-center w-full px-6 lg:px-10 py-5 shrink-0"
            initial={{ y: -100, opacity: 0 }} 
            animate={{ y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
            exit={{ y: -200, opacity: 0, transition: { duration: 0.3 } }}
          >
            <button 
              className="font-inter-400 lg:text-xl text-[#666666] bg-white py-3 px-4 sm:py-4 sm:px-8 rounded-2xl flex items-center shadow-sm hover:bg-gray-50 transition-colors w-[140px] justify-center"
              onClick={handleBack}
            >
              <IoIosArrowDropleft className="w-[1.5rem] h-[1.5rem] mr-2 text-black"/>
              {getText("Back", "กลับ")}
            </button>
            
            <p className="font-bebas-neue-400 text-2xl md:text-[2rem] text-center absolute left-1/2 transform -translate-x-1/2" style={{ letterSpacing: '10px' }}>
              {getText("PLEASE SELECT PHOTO", "กรุณาเลือกรูปภาพ")}
            </p>
            
            <button 
              className="font-inter-400 lg:text-xl text-white bg-[#222222] py-3 px-4 sm:py-4 sm:px-8 rounded-2xl shadow-md hover:bg-black transition-colors w-[140px] text-center flex items-center justify-center"
              onClick={handleNext}
            >
              {getText("Next", "ถัดไป")}
              <IoIosArrowDropright className="w-[1.5rem] h-[1.5rem] ml-2 text-white"/>
            </button>
          </motion.div>

          <div className="flex justify-center md:hidden pb-4 shrink-0">
             <p className="font-bebas-neue-400 text-[1.5rem] text-center" style={{ letterSpacing: '5px' }}>
              {getText("PLEASE SELECT PHOTO", "กรุณาเลือกรูปภาพ")}
            </p>
          </div>
           
          {/* Main Content */}
          <div className="w-full flex-1 flex flex-col lg:flex-row items-start justify-center gap-8 lg:gap-16 xl:gap-32 pt-8 pb-20 px-4 overflow-y-auto">
            
            {/* ฝั่งซ้าย: กรอบรูป (Polaroid) */}
            <motion.div 
              className="w-[18rem] md:w-[22rem] lg:w-[26rem] xl:w-[30rem] bg-white p-4 pb-16 md:pb-24 shadow-xl border border-gray-200 shrink-0"
              initial={{ scale: 0.9, opacity: 0, x: -50 }} 
              animate={{ scale: 1, opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
              exit={{ scale: 0.9, opacity: 0, x: -50, transition: { duration: 0.3 } }}
            >
              <div 
                className="w-full grid gap-2"
                style={{ gridTemplateColumns: `repeat(${frameCols}, minmax(0, 1fr))` }}
              >
                {selectedImages.map((src, index) => (
                    <motion.div 
                      key={index} 
                      className="w-full aspect-[4/3] bg-[#222222] flex justify-center items-center cursor-pointer overflow-hidden relative" 
                      onClick={() => handleClearImage(index)}
                      whileHover={{ scale: 0.98 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {src ? (
                        <Image src={src} alt={`Selected ${index}`} fill className="object-cover" />
                      ) : (
                        <ImageIcon />
                      )}
                    </motion.div>
                ))}
              </div>
            </motion.div>

            {/* ฝั่งขวา: รูปที่ถ่ายมา */}
            <motion.div 
              className="w-[18rem] md:w-[26rem] lg:w-[32rem] xl:w-[38rem] grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 max-h-[75vh] overflow-y-auto p-4 bg-white/50 rounded-2xl border shrink-0"
              initial={{ scale: 0.9, opacity: 0, x: 50 }} 
              animate={{ scale: 1, opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 20, delay: 0.1 } }}
              exit={{ scale: 0.9, opacity: 0, x: 50, transition: { duration: 0.3 } }}
            >
              {snap.imageSrcs.length > 0 ? snap.imageSrcs.map((src:any, index:number) => {
                const isSelected = selectedImages.includes(src);

                return (
                  <motion.div 
                    key={index} 
                    className={`w-full aspect-[3/4] flex justify-center items-center cursor-pointer overflow-hidden relative border-4 rounded-lg ${isSelected ? 'opacity-50 border-green-500' : 'bg-[#C6C6C9] border-transparent hover:border-gray-400'}`} 
                    onClick={() => handleImageClick(src)}
                    whileHover={{ scale: isSelected ? 1 : 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {src ? (
                       <Image src={src} alt={`Captured ${index}`} fill className="object-cover" />
                    ) : (
                       <ImageIcon />
                    )}
                    {isSelected && (
                      <div className="absolute inset-0 bg-black/20 flex justify-center items-center">
                        <p className="text-white font-bebas-neue-400 text-5xl drop-shadow-md">✓</p>
                      </div>
                    )}
                  </motion.div>
                );
              }) : (
                Array(maxSlots).fill('').map((_, i) => (
                  <div key={i} className="w-full aspect-[3/4] bg-[#C6C6C9] flex justify-center items-center rounded-lg">
                    <ImageIcon />
                  </div>
                ))
              )}
            </motion.div>
          </div>
            
          <Modal open={showModal} onCancel={() => setShowModal(false)} centered footer={null} className="select-none">
            <div className="flex flex-col items-center text-center p-4">
              <iframe src="https://lottie.host/embed/ffc20d8a-075d-4548-a3bf-6e32a66c5dd0/Cyhnz0Jxar.json" className="w-48 h-48 border-none"></iframe>
              <p className="text-xl mb-6 font-medium">{getText("Please select all photos to proceed", "กรุณาเลือกรูปภาพให้ครบก่อนดำเนินการ")}</p>
              <Button size="large" type="primary" className="bg-black hover:bg-gray-800 px-10" onClick={() => setShowModal(false)}>
                {getText("OK","ตกลง")}
              </Button>
            </div>
          </Modal>

        </div>
      )}
    </AnimatePresence>  
  );
}