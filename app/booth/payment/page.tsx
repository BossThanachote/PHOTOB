'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { IoIosArrowDropleft, IoIosArrowDropright } from "react-icons/io";
import { Modal, Button } from 'antd';
import { useSnapshot } from "valtio";
import state from "@/app/valtio_config";
import { useBoothSession } from "@/app/lib/useBoothSession";
import { Loader2 } from "lucide-react";



// 1. แยก Animation ออกมาด้านนอก
const shakeAnimation = {
  rotate: [0, -5, 5, -5, 5, 0], 
  transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 },
};

const exitAnimation = {
  scale: [1, 1.2, 0], 
  opacity: [1, 0.5, 0], 
  transition: { duration: 0.5, ease: "easeInOut" },
};

const fadeUpVariant = {
  initial: { y: -100, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { type: "spring", damping: 5, stiffness: 30 } },
  exit: { y: -200, opacity: 0, transition: { duration: 0.3 } }
};

// 2. สร้าง Array ข้อมูล Payment เตรียมพร้อมสำหรับเชื่อม Database ในอนาคต
const PAYMENT_METHODS = [
  { id: 'THAIQR', src: '/THAIQR.png', alt: 'Thai QR', wrapperClass: 'bg-transparent', imgClass: 'w-full h-full' },
  { id: 'ALIPAY', src: '/ALIPAY.png', alt: 'Alipay', wrapperClass: 'bg-transparent', imgClass: 'w-full h-full' },
  { id: 'COUPON', src: '/Coupon.png', alt: 'Coupon', wrapperClass: 'bg-white flex justify-center items-center', imgClass: 'w-[70%] h-[40%]' },
];

export default function Payment() {
  const router = useRouter();
  const snap = useSnapshot(state);
  const { session, isLoading } = useBoothSession()
  
  const [isClient, setIsClient] = useState(false);
  const [isVisible, setIsVisible] = useState(false); 
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setIsClient(true);
    state.intro = 3;
    localStorage.setItem('currentIntro', '3');
    
    const timer = setTimeout(() => setIsVisible(true), 500); // ลด delay ลงเพื่อให้โหลดไวขึ้น
    return () => clearTimeout(timer);
  }, []);

  const getText = (en: string, th: string) => snap.language === "TH" ? th : en;

  const handleSelectMethod = (methodId: string) => {
    setSelectedMethod(prev => prev === methodId ? null : methodId);
  };

  const handleNext = () => {
    if (!selectedMethod) {
      setShowModal(true);
      return;
    }

    setIsVisible(false);
    
    // 3. ลด Switch Case ลง ใช้ Dynamic Routing แทน
    setTimeout(() => {
      // อัปเดต state ตามประเภทที่เลือก
      const introMap: Record<string, number> = { 'THAIQR': 11, 'ALIPAY': 12, 'COUPON': 13 };
      const nextIntro = introMap[selectedMethod] || 3;
      
      state.intro = nextIntro;
      localStorage.setItem('currentIntro', nextIntro.toString());
      
      router.push(`/booth/${selectedMethod.toLowerCase()}`); 
    }, 500);
  };
  
  const handleBack = () => {
    setIsVisible(false);
    setTimeout(() => {
      state.intro = 2;
      localStorage.setItem('currentIntro', '2');
      router.push(`/booth/format`); 
    }, 500);
  };

  if (!isClient) return null;

  if (isLoading || !session) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-12 h-12" /></div>
  }

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
              className="font-inter-400 lg:text-xl text-[#666666] bg-white py-4 px-4 sm:px-8 rounded-2xl flex items-center shadow-sm hover:bg-gray-50 transition-colors"
              onClick={handleBack}
            >
              <IoIosArrowDropleft className="w-[1.5rem] h-[1.5rem] mr-4 text-black"/>
              {getText("Back", "กลับ")}
            </button>
            
            <p className="font-bebas-neue-400 md:text-[1.7rem] sm:text-[1.2rem] hidden md:block lg:text-[2rem] text-center" style={{ letterSpacing: '10px' }}>
              {getText("PAYMENT GATEWAY", "เส้นทางการชำระเงิน")}
            </p>                  
            
            <button 
              className="font-inter-400 lg:text-xl text-white bg-[#222222] py-4 px-4 sm:px-8 rounded-2xl flex items-center shadow-md hover:bg-black transition-colors"
              onClick={handleNext}
            >
              {getText("Next", "ถัดไป")}                
              <IoIosArrowDropright className="w-[1.5rem] h-[1.5rem] ml-4 text-white"/>
            </button>
          </motion.div>

          {/* Title สำหรับ Mobile */}
          <div className="flex justify-center md:hidden pb-4">
             <p className="font-bebas-neue-400 text-[1.5rem] text-center" style={{ letterSpacing: '5px' }}>
              {getText("PAYMENT GATEWAY", "เส้นทางการชำระเงิน")}
            </p>
          </div>
          
          {/* Main Content: Payment Methods */}
          <div className="flex-1 flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12 lg:gap-20 pb-10 select-none">
            {PAYMENT_METHODS.map((method) => {
              const isSelected = selectedMethod === method.id;
              
              return (
                <motion.div 
                  key={method.id}
                  className={`md:w-[16rem] md:h-[16rem] w-[12rem] h-[12rem] rounded-[3rem] cursor-pointer overflow-hidden shadow-lg border-4 transition-colors duration-300 ${isSelected ? 'border-black' : 'border-transparent'} ${method.wrapperClass}`}
                  onClick={() => handleSelectMethod(method.id)}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1,
                    rotate: isSelected ? shakeAnimation.rotate : 0 
                  }}
                  transition={{ 
                    scale: { type: "spring", stiffness: 200, damping: 20 },
                    rotate: isSelected ? shakeAnimation.transition : {} 
                  }}
                  exit={exitAnimation} 
                >
                  <Image 
                    src={method.src} 
                    alt={method.alt} 
                    width={500} 
                    height={500} 
                    className={method.imgClass}
                    style={{ objectFit: 'contain' }}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Modal แจ้งเตือนเมื่อไม่เลือก */}
          <Modal open={showModal} onCancel={() => setShowModal(false)} centered footer={null} className="select-none">
            <div className="flex flex-col items-center text-center p-4">
              <iframe src="https://lottie.host/embed/ffc20d8a-075d-4548-a3bf-6e32a66c5dd0/Cyhnz0Jxar.json" className="w-48 h-48 border-none"></iframe>
              <p className="text-xl mb-6 font-medium">{getText("Please Select Payment Method", "กรุณาเลือกช่องทางการชำระเงิน")}</p>
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