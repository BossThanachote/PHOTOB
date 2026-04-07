'use client'

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import state from "@/app/valtio_config";
import { useSnapshot } from "valtio";
import { CheckCircle2, Home, Loader2, QrCode } from "lucide-react";
import { supabase } from "@/app/lib/supabase";
import { IoIosArrowDropleft } from "react-icons/io";

export default function DownloadPage() {
  const router = useRouter();
  const snap = useSnapshot(state);
  
  const [isClient, setIsClient] = useState(false);
  const [isUploading, setIsUploading] = useState(true);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    state.intro = 9;
    localStorage.setItem('currentIntro', '9');

    const uploadPhotoAndGetUrl = async () => {
      try {
        // 1. เช็คว่ามีรูปที่แคปมาจากหน้าตกแต่งไหม
        const base64Image = state.savedDropAreaImage;
        if (!base64Image) {
          throw new Error("ไม่พบรูปภาพ กรุณาเริ่มทำรายการใหม่");
        }

        // 2. แปลงรูป Base64 เป็นไฟล์จริงๆ (Blob)
        const res = await fetch(base64Image);
        const blob = await res.blob();
        const fileExt = "png";
        const fileName = `booth_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

        // 3. อัปโหลดขึ้น Supabase Bucket ชื่อ 'photos'
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(fileName, blob, { contentType: 'image/png', upsert: false });

        if (uploadError) throw uploadError;

        // 4. ดึงลิงก์สาธารณะ (Public URL) มาสร้าง QR Code
        const { data: publicUrlData } = supabase.storage
          .from('photos')
          .getPublicUrl(fileName);

        setPhotoUrl(publicUrlData.publicUrl);
      } catch (error: any) {
        console.error("Upload error:", error);
        setErrorMsg(error.message || "เกิดข้อผิดพลาดในการสร้าง QR Code");
      } finally {
        setIsUploading(false);
      }
    };

    uploadPhotoAndGetUrl();
  }, []);

  const getText = (en: string, th: string) => snap.language === "TH" ? th : en;

  // ฟังก์ชันย้อนกลับไปหน้าตกแต่ง
  const handleBack = () => {
    state.intro = 7;
    localStorage.setItem('currentIntro', '7');
    router.push('/booth/custom');
  };
  
  // ฟังก์ชันล้างค่าทั้งหมด เตรียมต้อนรับลูกค้าคนต่อไป!
  const handleFinish = () => {
    // 1. ล้าง State กลาง (Valtio)
    state.imageSrcs = [];
    state.droppedImages = [];
    state.selectedImages = [];
    state.savedDropAreaImage = '';
    state.intro = 1;
    
    // 2. ล้าง LocalStorage (แต่เก็บ active_booth_id ไว้ให้ตู้จำตัวเองได้)
    localStorage.removeItem('selectedFrame');
    localStorage.removeItem('selectedFrameId');
    localStorage.removeItem('selectedFrameShot');
    localStorage.setItem('currentIntro', '1');

    // 3. ส่งกลับหน้าแรก
    router.push('/booth');
  };

  if (!isClient) return null;

  return (
    <AnimatePresence>
      <div className="w-screen h-screen flex flex-col bg-[#F7F7F7] overflow-hidden select-none">
        
        {/* Navbar */}
        <motion.div 
          className="flex justify-between items-center w-full px-6 lg:px-10 py-6 bg-white shadow-sm z-50 shrink-0"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { type: "spring", damping: 20 } }}
        >
          {/* ซ้าย: ปุ่ม Back */}
          <button 
            onClick={handleBack} 
            className="font-inter-400 lg:text-xl text-[#666666] bg-gray-50 py-3 px-4 sm:py-4 sm:px-8 rounded-2xl flex items-center hover:bg-gray-100 transition-colors w-[140px] justify-center"
          >
            <IoIosArrowDropleft className="w-[1.5rem] h-[1.5rem] mr-2 text-black"/>
            {getText("Back", "กลับ")}
          </button>

          {/* กลาง: ข้อความหัวข้อ */}
          <h1 className="font-bebas-neue-400 text-2xl md:text-4xl tracking-[10px] text-gray-800 absolute left-1/2 transform -translate-x-1/2">
            {getText("GET YOUR PHOTO", "รับรูปภาพของคุณ")}
          </h1>

          {/* ขวา: กล่องเปล่า (ล่องหน) เพื่อถ่วงน้ำหนัก Flex ให้หัวข้ออยู่กึ่งกลางเป๊ะๆ */}
          <div className="w-[140px]"></div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20 p-6 md:p-10 overflow-y-auto">
          
          {/* ฝั่งซ้าย: โชว์รูปภาพที่เสร็จแล้ว */}
          <motion.div 
            className="w-[16rem] md:w-[22rem] lg:w-[28rem] shrink-0 bg-white p-4 shadow-2xl border-4 border-white rounded-xl"
            initial={{ scale: 0.8, opacity: 0, x: -50 }}
            animate={{ scale: 1, opacity: 1, x: 0, transition: { delay: 0.2, type: "spring" } }}
          >
            {state.savedDropAreaImage ? (
              <img src={state.savedDropAreaImage} alt="Final Photo" className="w-full h-auto object-contain drop-shadow-sm" />
            ) : (
              <div className="w-full aspect-[3/4] bg-gray-200 flex items-center justify-center rounded-lg">
                <p className="text-gray-400 font-bold text-xl">NO IMAGE</p>
              </div>
            )}
          </motion.div>

          {/* ฝั่งขวา: QR Code & ปุ่มเสร็จสิ้น */}
          <motion.div 
            className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100 flex flex-col items-center text-center"
            initial={{ scale: 0.8, opacity: 0, x: 50 }}
            animate={{ scale: 1, opacity: 1, x: 0, transition: { delay: 0.4, type: "spring" } }}
          >
            <div className="bg-[#9B1C27]/10 p-4 rounded-full mb-6 text-[#9B1C27]">
              <QrCode size={48} />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              {getText("Scan to Download", "สแกนเพื่อดาวน์โหลด")}
            </h2>
            <p className="text-gray-500 mb-8">
              {getText("Please scan the QR Code below to save the photo to your device.", "กรุณาสแกนคิวอาร์โค้ดด้านล่างเพื่อบันทึกรูปภาพลงในมือถือของคุณ")}
            </p>

            {/* กรอบ QR Code */}
            <div className="w-48 h-48 md:w-56 md:h-56 bg-gray-50 rounded-3xl border-4 border-dashed border-gray-200 flex items-center justify-center p-4 mb-10">
              {isUploading ? (
                <div className="flex flex-col items-center text-gray-400">
                  <Loader2 className="w-10 h-10 animate-spin mb-2" />
                  <span className="text-sm font-bold">Generating...</span>
                </div>
              ) : errorMsg ? (
                <p className="text-red-500 text-sm font-bold">{errorMsg}</p>
              ) : photoUrl ? (
                // 🚀 ใช้ API สร้าง QR Code
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(photoUrl)}`} 
                  alt="QR Code" 
                  className="w-full h-full object-contain"
                />
              ) : null}
            </div>

            {/* ปุ่ม FINISH กลับหน้าแรก */}
            <button 
              onClick={handleFinish}
              className="w-full py-5 bg-[#222222] text-white rounded-2xl font-bold text-xl flex items-center justify-center gap-3 hover:bg-black hover:scale-[1.02] transition-all shadow-lg"
            >
              <CheckCircle2 size={24} />
              {getText("FINISH", "เสร็จสิ้น")}
            </button>

          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}