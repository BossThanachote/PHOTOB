'use client'
import { motion, AnimatePresence } from "framer-motion";
import state from "@/app/valtio_config";
import { useSnapshot } from "valtio";
import { IoIosArrowDropleft } from "react-icons/io";
import { IoIosArrowDropright } from "react-icons/io";
import Image from "next/image";
import { useState, useEffect } from "react";
import { QRCode } from 'antd';
import { useRouter } from "next/navigation";
import photoService from "@/app/services/photoService";

const formatDate = () => {
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return today.toLocaleDateString('en-US', options);
}

export default function Download() {
  const router = useRouter();
  const [countdown, setCountdown] = useState<number>(120);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isTimeout, setIsTimeout] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const snap = useSnapshot(state);
  const [photoUrl, setPhotoUrl] = useState<string>('');

  // ฟังก์ชันสำหรับดาวน์โหลดรูปภาพ
  const triggerDownload = async (url: string) => {
    try {
      setIsDownloading(true);
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `photo_${formatDate().replace(/\s/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Error downloading photo:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // ดึง URL รูปภาพ
  useEffect(() => {
    const getPhotoUrl = async () => {
      // ลองดึงจาก localStorage ก่อน
      const savedPhotoData = localStorage.getItem('photoData');
      if (savedPhotoData) {
        try {
          const { url } = JSON.parse(savedPhotoData);
          if (url) {
            console.log("Using URL from localStorage:", url);
            setPhotoUrl(url);
            return;
          }
        } catch (error) {
          console.error('Error parsing localStorage data:', error);
        }
      }

      // ถ้าไม่มีใน localStorage ลองดึงจาก state
      if (state.uploadedPhotoUrl) {
        console.log("Using URL from state:", state.uploadedPhotoUrl);
        setPhotoUrl(state.uploadedPhotoUrl);
        return;
      }

      // ถ้ายังไม่มี URL แต่มี ID ให้ดึงจาก API
      if (state.uploadedPhotoId) {
        try {
          console.log("Fetching from API with ID:", state.uploadedPhotoId);
          const result = await photoService.getPhotoById(state.uploadedPhotoId);
          if (result.data?.ImageUrl) {
            setPhotoUrl(result.data.ImageUrl);
            localStorage.setItem('photoData', JSON.stringify({
              id: result.data.id,
              url: result.data.ImageUrl
            }));
            console.log("Saved URL to localStorage:", result.data.ImageUrl);
          }
        } catch (error) {
          console.error('Error fetching photo:', error);
        }
      }
    };

    getPhotoUrl();
  }, [state.uploadedPhotoId, state.uploadedPhotoUrl]);

  // ตรวจสอบ URL และ set intro
  useEffect(() => {
    if (window.location.pathname === '/booth/download') {
      state.intro = 10;
      localStorage.setItem('currentIntro', '10');
    }
  }, []);

  // จัดการการย้อนกลับ
  useEffect(() => {
    const handlePopState = () => {
      const savedIntro = localStorage.getItem('currentIntro');
      if (savedIntro) {
        state.intro = parseInt(savedIntro);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // จัดการ countdown
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (snap.intro === 9) {
      setCountdown(120);
      setIsVisible(true);

      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (timer) clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [snap.intro]);

  // จัดการ timeout
  useEffect(() => {
    if (countdown === 0) {
      setIsTimeout(true);
      setTimeout(() => {
        state.intro = 6;
        localStorage.setItem('currentIntro', '6');
        router.push('/booth/select');
      }, 2000);
    }
  }, [countdown, router]);

  // แสดงผลครั้งแรก
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    setIsVisible(false);
    setCountdown(120);
    setIsTimeout(false);
    setTimeout(() => {
      state.intro = 10;
      localStorage.setItem('currentIntro', '10');
      setIsVisible(true);
      setTimeout(() => {
        router.push('/booth/save');
      }, 0);
    }, 1000);
  };

  const handleBack = () => {
    state.resetSelfieData();
    setIsVisible(false);
    setCountdown(120);
    setIsTimeout(false);
    setTimeout(() => {
      state.intro = 7;
      localStorage.setItem('currentIntro', '7');
      setIsVisible(true);
      setTimeout(() => {
        router.push('/booth/custom');
      }, 0);
    }, 1000);
  };

  return (
    <AnimatePresence>
      {(snap.intro === 9 || window.location.pathname === '/booth/download') && isVisible && (
        <div className="w-screen h-screen flex flex-col justify-between border-transparent border-2 bg-[#F7F7F7] select-none">
          {/* Header Mobile */}
          <div className="flex justify-center items-center w-full px-10 md:hidden pt-4 border-b border-transparent">
            <motion.p 
              className="font-bebas-neue-400 md:text-[1.7rem] text-[1.3rem] lg:text-[2rem] select-none text-center"
              style={{ letterSpacing: '10px' }}
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
                delay: 1,
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
              SCAN FOR DOWNLOAD
            </motion.p>
          </div>

          {/* Navigation */}
          <motion.div 
            className="flex justify-between items-center w-full px-10 py-3 border-b border-transparent"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20,
              delay: 1,
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
              <IoIosArrowDropleft className="w-[1.5rem] h-[1.5rem] mr-4 text-black"/>
              Back
            </button>
            <p 
              className="font-bebas-neue-400 md:text-[1.7rem] sm:text-[1.2rem] hidden md:block lg:text-[2rem] select-none"
              style={{ letterSpacing: '10px' }}
            >
              SCAN FOR DOWNLOAD
            </p>
            <button 
              className="font-inter-400 lg:text-xl text-white bg-[#222222] py-4 px-4 sm:py-4 sm:px-8 rounded-2xl flex items-center"
              onClick={handleNext}
            >
              Next
              <IoIosArrowDropright className="w-[1.5rem] h-[1.5rem] ml-4 text-white"/>
            </button>
          </motion.div>

          {/* Main Content */}
          <motion.div
            className="w-full h-full flex flex-col lg:flex-row lg:justify-center items-center lg:gap-[2rem] relative border-2 border-transparent select-none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20,
              delay: 1,
            }}
            exit={{
              scale: 0,
              opacity: 0,
              transition: {
                opacity: { duration: 0.3, ease: "easeOut" },
                duration: 0.3,
                ease: "easeInOut",
              },
            }}
          >
            {/* Left Section */}
            <div className="xl:w-[30rem] xl:h-[44rem] lg:w-[20rem] lg:h-[44rem] hidden lg:block border-2 border-transparent flex justify-center items-center">
              <div className="w-full h-full justify-center items-center border-2 border-transparent flex flex-col gap-5">
              </div>
            </div>

            {/* Mobile Timer */}
            <div className="w-[30rem] h-[8rem] border-4 mb-10 border-transparent lg:hidden flex justify-center items-center">
              <div className="xl:w-[12.5rem] xl:h-[12.5rem] lg:w-[10rem] lg:h-[10rem] h-[7rem] w-[7rem] bg-[#222222] rounded-full flex justify-center items-center">
                <p className="font-bebas-neue-400 text-white xl:text-[3.5rem] lg:text-[2.5rem] text-[2rem] xl:mt-[3.8rem] lg:mt-[2.8rem] sm:pb-2 pt-[2.5rem]">
                  {isTimeout ? "Timeout" : countdown > 0 ? countdown : "Time Out"}
                </p>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="w-[30rem] lg:h-[44rem] md:h-[40rem] h-[40rem] border-[1px] border-[#C6C6C980] flex justify-center items-center bg-white">
              <div className="w-[95%] h-[95%] border-[1px] border-transparent flex-col flex">
                {/* Header */}
                <div className="flex flex-col border-[1px] border-transparent lg:h-[10rem] h-[7rem]">
                  <div className="w-full h-full border-[1px] border-transparent flex flex-col justify-center items-center font-inter-400">
                    <div className="text-[#000000] text-[1.5rem] lg:text-[1.5rem]" style={{ letterSpacing: '10px' }}>
                      PLEASE SCAN
                    </div>
                    <div className="text-[#61616A] text-base flex justify-center items-center gap-2 mt-2">
                      <Image 
                        src="/picture.png"
                        alt="picture icon"
                        width={10000}
                        height={10000}
                        className="w-5 h-5"
                      />
                      For download file
                    </div>
                  </div>
                </div>

                {/* QR Code Display */}
                <div className="flex flex-col justify-center items-center border-[1px] gap-4 border-transparent h-[32rem] mb-[1rem]">
                  {photoUrl ? (
                    <>
                      <QRCode
                        value={photoUrl}
                        size={300}
                        style={{ marginTop: '20px' }}
                      />
                      
                      <button
                        onClick={() => triggerDownload(photoUrl)}
                        disabled={isDownloading}
                        className="mt-4 flex items-center gap-2 px-6 py-3 bg-[#222222] text-white rounded-xl hover:bg-[#333333] transition-colors"
                      >
                        <Image 
                          src="/picture.png"
                          alt="download icon"
                          width={20}
                          height={20}
                          className="w-5 h-5"
                        />
                        {isDownloading ? "Downloading..." : "Download Now"}
                      </button>

                      <div className="w-[80%] text-center font-inter-400 text-base text-[#8E8E93] mt-4">
                        Scan QR code with your phone camera to download instantly
                      </div>

                      <div className="text-center font-inter-400 text-base text-[#8E8E93] mt-auto">
                        {formatDate()}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mb-4"></div>
                      <div>Loading QR Code...</div>
                      </div>
                 )}
               </div>
             </div>
           </div>

           {/* Right Section with Timer */}
           <div className="xl:w-[30rem] xl:h-[44rem] lg:w-[20rem] lg:h-[44rem] w-[30rem] h-[5rem] border-2 border-transparent">
             <div className="w-full h-full justify-end items-end border-2 border-transparent flex flex-col hidden lg:block">
               <div className="border-2 border-transparent flex justify-end items-center gap-5">
                 <div className="xl:w-[12.5rem] xl:h-[12.5rem] lg:w-[10rem] lg:h-[10rem] bg-[#222222] rounded-full flex justify-center items-center mr-10">
                   <p className="font-bebas-neue-400 text-white xl:text-[3.5rem] lg:text-[2.5rem] xl:mt-[3.8rem] lg:mt-[2.8rem] md:mt-[3.7rem] mt-10">
                     {isTimeout ? "Timeout" : countdown > 0 ? countdown : "Time Out"}
                   </p>
                 </div>
               </div>
             </div>
           </div>
         </motion.div>
       </div>
     )}
   </AnimatePresence>
 );
}