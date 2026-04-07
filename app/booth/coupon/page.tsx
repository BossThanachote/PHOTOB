'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { IoIosArrowDropleft } from "react-icons/io";
import { Modal, Button } from 'antd';
import { useSnapshot } from "valtio";
import state from "@/app/valtio_config";
import { useBoothSession } from "@/app/lib/useBoothSession";
import { Loader2 } from "lucide-react";


// SVG สำหรับไอค่อน Backspace
const BackspaceIcon = () => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 md:w-10 md:h-10 text-white" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
    <line x1="18" y1="9" x2="12" y2="15"></line>
    <line x1="12" y1="9" x2="18" y2="15"></line>
  </svg>
);

export default function Coupon() {
  const router = useRouter();
  const snap = useSnapshot(state);
  const { session, isLoading } = useBoothSession()
  const [isClient, setIsClient] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const [couponCode, setCouponCode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    setIsClient(true);
    state.intro = 13;
    localStorage.setItem('currentIntro', '13');

    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const getText = (en: string, th: string) => snap.language === "TH" ? th : en;

  // ฟังก์ชันจัดการการกดปุ่ม Keypad
  const handleKeyPress = (key: string) => {
    if (couponCode.length < 8) {
      setCouponCode(prev => prev + key);
    }
  };

  // ฟังก์ชันลบตัวอักษร
  const handleDelete = () => {
    setCouponCode(prev => prev.slice(0, -1));
  };

  const handleBack = () => {
    setIsVisible(false);
    setTimeout(() => {
      state.intro = 3;
      localStorage.setItem('currentIntro', '3');
      router.push(`/booth/payment`);
    }, 500);
  };

  // ฟังก์ชันกดยืนยันคูปอง
  const handleConfirm = () => {
    if (couponCode.length < 8) {
      setModalMessage(getText("Please enter 8-digit code.", "กรุณาใส่รหัสให้ครบ 8 หลัก"));
      setShowModal(true);
      return;
    }

    // 🚀 [TODO: Database] ตรงนี้ต้องยิง API ไปเช็คกับ Neon/Prisma
    // สมมติว่าโค้ดถูกต้อง เด้งไปหน้า Camera เลย
    setIsVisible(false);
    setTimeout(() => {
      state.intro = 5; 
      localStorage.setItem('currentIntro', '5');
      router.push(`/booth/camera`); 
    }, 500);
  };

  // โครงสร้างปุ่มบน Keypad
  const keypadLayout = [
    { key: '1', type: 'num' }, { key: '2', type: 'num' }, { key: '3', type: 'num' }, { key: 'A', type: 'char' },
    { key: '4', type: 'num' }, { key: '5', type: 'num' }, { key: '6', type: 'num' }, { key: 'B', type: 'char' },
    { key: '7', type: 'num' }, { key: '8', type: 'num' }, { key: '9', type: 'num' }, { key: 'C', type: 'char' },
    { key: '#', type: 'num' }, { key: '0', type: 'num' }, { key: 'DEL', type: 'action' }
  ];

  if (!isClient) return null;

  if (isLoading || !session) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-12 h-12" /></div>
  }
  
  return (
    <AnimatePresence> 
      {isVisible && (
        <div className="w-screen h-screen flex flex-col bg-[#F7F7F7] select-none overflow-hidden">
          
          {/* Navbar */}
          <motion.div 
            className="flex justify-between items-center w-full px-6 lg:px-10 py-5"
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
              COUPON
            </p>
            
            <button 
              className="font-inter-400 lg:text-xl text-white bg-[#222222] py-3 px-4 sm:py-4 sm:px-8 rounded-2xl shadow-md hover:bg-black transition-colors w-[140px] text-center"
              onClick={handleConfirm}
            >
              {getText("Confirm", "ยืนยัน")}
            </button>
          </motion.div>

          {/* Main Content */}
          <motion.div
            className="w-full flex-1 flex flex-col items-center pt-8 md:pt-16 pb-10"
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 20, delay: 0.1 } }}
            exit={{ scale: 0.9, opacity: 0, transition: { duration: 0.3 } }}
          >
            
            {/* คำแนะนำ */}
            <p className="text-[#8E8E93] font-inter-400 text-lg md:text-xl mb-6">
              {getText("Please enter 8-digit code to use coupon", "กรุณาใส่รหัส 8 หลัก เพื่อใช้คูปอง")}
            </p>

            {/* กล่องแสดงผลรหัส (Input Box) - แก้ไขใหม่ครับ */}
            <div className="w-[90%] max-w-[35rem] h-[5rem] md:h-[6rem] bg-white border-2 border-gray-400 rounded-2xl flex items-center justify-center mb-10 shadow-inner px-4">
              {/* ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ */}
              {/* แก้ไขฟอนต์และการจัดกึ่งกลางตรงนี้ครับ */}
              <p className="flex justify-center mt-5 md:mt-10 font-dream-sparks-400 text-3xl md:text-5xl tracking-[0.5rem] md:tracking-[1rem] text-gray-800 text-center w-full leading-none translate-y-1">
                {couponCode}
              </p>
              {/* ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ ✨ */}
            </div>

            {/* Custom Keypad */}
            <div className="grid grid-cols-4 gap-4 md:gap-6">
              {keypadLayout.map((item, index) => {
                const isChar = item.type === 'char';
                const isAction = item.type === 'action';
                
                return (
                  <motion.button
                    key={index}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => isAction ? handleDelete() : handleKeyPress(item.key)}
                    className={`
                      w-[4rem] h-[4rem] md:w-[6rem] md:h-[6rem] rounded-full grid place-items-center shadow-md transition-colors
                      ${isChar ? 'bg-[#8E8E93] hover:bg-gray-500' : 'bg-[#222222] hover:bg-black'}
                    `}
                  >
                    {isAction ? (
                      <BackspaceIcon />
                    ) : (
                      <span className="font-dream-sparks-400 text-white text-3xl md:text-[3.5rem] leading-none translate-y-1">
                        {item.key}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>

          </motion.div>

          {/* Modal แจ้งเตือนเมื่อรหัสไม่ครบ */}
          <Modal open={showModal} onCancel={() => setShowModal(false)} centered footer={null} className="select-none">
            <div className="flex flex-col items-center text-center p-4">
              <iframe src="https://lottie.host/embed/ffc20d8a-075d-4548-a3bf-6e32a66c5dd0/Cyhnz0Jxar.json" className="w-48 h-48 border-none"></iframe>
              <p className="text-xl mb-6 font-medium">{modalMessage}</p>
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