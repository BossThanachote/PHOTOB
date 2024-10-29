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

  const snap = useSnapshot(state);
  const [isVisible, setIsVisible] = useState(false); 
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);

  const getText = (englishText: string, thaiText: string) => {
    return snap.language === "TH" ? thaiText : englishText;
  };

  useEffect(() => {
    // ตั้งค่า selectedImages ขึ้นอยู่กับจำนวนภาพที่ดึงมา
    setSelectedImages(Array(snap.imageSrcs.length).fill(""));
  }, [snap.imageSrcs.length]);

  const handleNext = () => {
    // ตรวจสอบว่าช่องทางซ้ายเต็มหรือยัง
    const isFull = selectedImages.every(image => image !== "");
    if (!isFull) {
      setShowModal(true); // แสดง Modal ถ้ายังใส่รูปไม่ครบ
    } else {
      setIsVisible(false); 
      setTimeout(() => {
        state.intro = 7; 
        setIsVisible(true); 
      }, 1200); 
    }
  };

  const handleBack = () => {
    setIsVisible(false); 
    setTimeout(() => {
      state.imageSrcs = [];  // รีเซ็ตภาพถ่ายเมื่อย้อนกลับไปหน้าถ่ายใหม่
      state.intro = 5; 
      setIsVisible(true); 
    }, 1200); 
  };

  const handleImageClick = (src: string) => {
    const nextEmptyIndex = selectedImages.findIndex(image => image === "");
    if (nextEmptyIndex !== -1) {
        const updatedImages = [...selectedImages];
        updatedImages[nextEmptyIndex] = src;
        setSelectedImages(updatedImages);
        state.selectedImages = updatedImages; // อัปเดตใน valtio state
    }
};


const handleClearImage = (index: number) => {
  const updatedImages = [...selectedImages];
  updatedImages[index] = "";
  setSelectedImages(updatedImages);
  state.selectedImages = updatedImages; // อัปเดตใน valtio state
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
                <div className="w-full h-full  grid grid-rows-3 grid-cols-2 border-2 border-transparent gap-1 px-4 py-4 justify-items-center align-items-center " style={{ gridAutoRows: "1fr", gridTemplateColumns: "1fr 1fr" }}>
                {selectedImages.map((src, index) => (
                     <motion.div key={index} className="w-full aspect-w-1 aspect-h-1 bg-[#000000CC] flex justify-center items-center select-none cursor-pointer" onClick={() => handleClearImage(index)}
                         whileTap={{ scale: 0.7 }}
                     >
                         {src ? <Image src={src} alt={`Selected image ${index}`} width={10000} height={100000} className="w-full h-full object-cover" /> : <Image src="/picture.png" alt="" width={10000} height={100000} className="w-5 h-5" />}
                     </motion.div>
                 ))}
                </div>
              </motion.div>
              <motion.div className="xl:w-[44rem] xl:h-[45rem] lg:w-[32rem] lg:h-[28rem] md:w-[18rem] md:h-[20rem] w-[18rem] h-[18rem] grid grid-cols-3 gap-1 justify-items-center align-items-center py-[1.5rem] px-[1rem] border-2 border-transparent" style={{ gridAutoRows: "1fr", gridTemplateColumns: "1fr 1fr" }}
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
                {/* รูป */}
                {snap.imageSrcs.map((src, index) => (
                  <motion.div key={index} className="w-full aspect-w-1 aspect-h-1 bg-[#000000CC] flex justify-center items-center select-none cursor-pointer overflow-hidden" onClick={() => handleImageClick(src)}
                  whileTap={{scale:0.7}}
                  >
                    <Image src={src} alt={`Captured image ${index}`} width={10000} height={100000} className="w-full h-full object-cover" />
                  </motion.div>
                ))}
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
            <p className="text-lg mb-6">{getText("Please select all the images to proceed", "กรุณาเลือกรูปภาพให้ครบก่อนดำเนินการ")}</p>
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
