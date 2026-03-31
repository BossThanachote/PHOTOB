'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { IoIosArrowDropleft } from "react-icons/io";
import { QRCode } from 'antd';
import { useSnapshot } from "valtio";
import state from "@/app/valtio_config";
import 'antd/dist/reset.css';

export default function ThaiQR() {
  const router = useRouter();
  const snap = useSnapshot(state);
  
  const [isClient, setIsClient] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const [countdown, setCountdown] = useState(60); // 20 นาที
  const [isTimeout, setIsTimeout] = useState(false);
  
  // State สำหรับเก็บข้อมูลเฟรมที่ดึงมาจากรอบก่อนหน้า
  const [framePrice, setFramePrice] = useState<number>(120);

  useEffect(() => {
    setIsClient(true);
    // 💡 ThaiQR ใช้ intro = 11 (อ้างอิงจากหน้า Payment)
    state.intro = 11;
    localStorage.setItem('currentIntro', '11');

    // ดึงข้อมูลเฟรมจาก LocalStorage เพื่อเอาราคามาแสดง
    const storedFrame = localStorage.getItem('selectedFrame');
    if (storedFrame) {
      try {
        const frameData = JSON.parse(storedFrame);
        if (frameData.price) setFramePrice(frameData.price);
      } catch (e) {
        console.error("Error parsing frame data", e);
      }
    }

    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // ระบบนับถอยหลัง
  useEffect(() => {
    if (!isVisible || isTimeout) return;

    if (countdown <= 0) {
      setIsTimeout(true);
      // หมดเวลาให้เด้งกลับไปหน้า Format
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          state.intro = 2;
          localStorage.setItem('currentIntro', '2');
          router.push('/booth/format');
        }, 500);
      }, 2000); 
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, isVisible, isTimeout, router]);

  const formatDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getText = (en: string, th: string) => snap.language === "TH" ? th : en;

  const handleBack = () => {
    setIsVisible(false);
    setTimeout(() => {
      state.intro = 3;
      localStorage.setItem('currentIntro', '3');
      router.push(`/booth/payment`);
    }, 500);
  };

  // 🚀 ปุ่ม Test Success เด้งไปหน้ากล้องเหมือน Alipay
  const simulatePaymentSuccess = () => {
    setIsVisible(false);
    setTimeout(() => {
      state.intro = 5;  // 🚀 เปลี่ยนเป็น 5 เพื่อให้เข้าหน้า Selfie.tsx
      localStorage.setItem('currentIntro', '5');
      router.push(`/booth/camera`); 
    }, 500);
  };
  if (!isClient) return null;

  return (
    <AnimatePresence> 
      {isVisible && (
        <div className="w-screen h-screen flex flex-col justify-between bg-[#F7F7F7] select-none overflow-hidden">
          
          {/* Navbar */}
          <motion.div 
            className="flex justify-between items-center w-full px-10 py-5"
            initial={{ y: -100, opacity: 0 }} 
            animate={{ y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
            exit={{ y: -200, opacity: 0, transition: { duration: 0.3 } }}
          >
            <button 
              className="font-inter-400 lg:text-xl text-[#666666] bg-white py-4 px-4 sm:px-8 rounded-2xl flex items-center shadow-sm hover:bg-gray-50"
              onClick={handleBack}
            >
              <IoIosArrowDropleft className="w-[1.5rem] h-[1.5rem] mr-4 text-black"/>
              {getText("Back", "กลับ")}
            </button>
            
            <p className="font-bebas-neue-400 md:text-[1.7rem] sm:text-[1.2rem] hidden md:block lg:text-[2rem]" style={{ letterSpacing: '10px' }}>
              {getText("PAYMENT", "การชำระเงิน")}
            </p>
            
            {/* ปุ่มจำลองสถานะจ่ายเงินสำเร็จ */}
            <button 
              className="font-inter-400 lg:text-xl text-white bg-green-600 py-4 px-4 sm:px-8 rounded-2xl flex items-center shadow-md hover:bg-green-700 transition-colors"
              onClick={simulatePaymentSuccess}
            >
              Test Success
            </button>
          </motion.div>

          <div className="flex justify-center md:hidden pb-4">
             <p className="font-bebas-neue-400 text-[1.5rem] text-center" style={{ letterSpacing: '5px' }}>
              {getText("PAYMENT", "การชำระเงิน")}
            </p>
          </div>

          {/* Main Content */}
          <motion.div
            className="w-full flex-1 flex flex-col lg:flex-row justify-center items-center lg:gap-10 pb-10"
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
            exit={{ scale: 0.9, opacity: 0, transition: { duration: 0.3 } }}
          >
            {/* Countdown Mobile (แก้ Grid กึ่งกลางแล้ว) */}
            <div className="lg:hidden flex justify-center items-center mb-6">
              <div className="h-[7rem] w-[7rem] bg-[#222222] rounded-full grid place-items-center shadow-lg">
                <p className="font-bebas-neue-400 text-white text-[2.5rem] leading-none text-center m-0 p-0 translate-x-[1px]">
                  {isTimeout ? getText("Timeout", "หมดเวลา") : countdown}
                </p>
              </div>
            </div>

            {/* Slip / QR Area (เปลี่ยนสี Header เป็นสีน้ำเงินเข้มแบบ PromptPay) */}
            <div className="w-[90%] max-w-[30rem] lg:h-[40rem] bg-white border border-gray-200 rounded-3xl shadow-xl flex flex-col overflow-hidden">
              <div className="bg-[#113566] w-full py-4 flex justify-center items-center">
                 <p className="text-white font-inter-400 text-2xl font-bold tracking-wider">THAI QR PAYMENT</p>
              </div>
              
              <div className="flex flex-col justify-center items-center flex-1 py-8">
                <p className="text-gray-800 text-2xl mb-6 font-medium">
                  {getText("PLEASE SCAN TO PAY", "สแกนคิวอาร์โค้ดเพื่อชำระเงิน")}
                </p>
                
                <div className="p-4 bg-white rounded-2xl border-2 border-gray-100 shadow-inner">
                  <QRCode
                    value="promptpay://example-qr-code-data" 
                    size={250}
                    bordered={false}
                    color="#113566" // เปลี่ยนสี QR Code ให้เข้ากับธีม ThaiQR ได้ด้วยนะครับ
                  />
                </div>
                
                <div className="mt-8 text-center flex flex-col gap-2">
                  <p className="font-inter-400 text-lg text-gray-500 font-medium">Photo booth CO.,LTD.</p>
                  <p className="font-inter-400 text-xl text-gray-800 font-bold">
                    {getText(`Net price ${framePrice} baht`, `ราคาสุทธิ ${framePrice} บาท`)}
                  </p>
                  <p className="font-inter-400 text-sm text-gray-400 mt-2">{formatDate()}</p>
                </div>
              </div>
            </div>

            {/* Countdown Desktop (แก้ Grid กึ่งกลางแล้ว) */}
            <div className="hidden lg:flex w-[20rem] justify-center items-center">
              <div className="w-[12.5rem] h-[12.5rem] bg-[#222222] rounded-full grid place-items-center shadow-2xl">
                <p className="font-bebas-neue-400 text-white text-[4rem] leading-none text-center m-0 p-0 translate-x-[2px]">
                  {isTimeout ? "Timeout" : countdown}
                </p>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}