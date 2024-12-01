'use client'
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi";
import state from "@/app/valtio_config";
import { useSnapshot } from "valtio";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Selfie() {
    const router = useRouter();
    const snap = useSnapshot(state);
    const [isExiting, setIsExiting] = useState(false); 
    const [countdown, setCountdown] = useState(12); // เริ่มต้นที่ 12
    const [currentStep, setCurrentStep] = useState(1); // เริ่มต้นที่ 1
    const [doneDelay, setDoneDelay] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null); // เก็บรูปภาพที่จับจากกล้อง
    const [imageSrcs, setImageSrcs] = useState<string[]>([]);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const maxSteps = snap.selectedDiv === 1 ? 6 : snap.selectedDiv === 2 ? 8 : 6;
    const isCapturingRef = useRef(false); // สถานะการจับภาพ
    
    const handleNext = () => {
      setTimeout(() => {
          state.intro = 6; 
      }, 1200); 
  };
  
  useEffect(() => {
    if (snap.intro === 5) {
        // เริ่มการนับถอยหลังเมื่อ intro เป็น 3
        setCountdown(12); // รีเซ็ต countdown
        setCurrentStep(1); // รีเซ็ต currentStep
        setDoneDelay(false); // รีเซ็ต doneDelay
        startCamera(); // เริ่มต้นกล้อง
    }
}, [snap.intro]);


  useEffect(() => {
    if (window.location.pathname === '/booth/selfie') {
      state.intro = 5;
      localStorage.setItem('currentIntro', '5');
    }
   }, []);
   
   // เพิ่ม useEffect สำหรับจัดการการย้อนกลับ
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
   
   useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    const localCountdown = { value: 12 };
    const localStep = { value: 1 };
   
    if (snap.intro === 5 && localStep.value <= maxSteps) {
      interval = setInterval(() => {
        localCountdown.value -= 1;
   
        if (localCountdown.value > 0) {
          setCountdown(localCountdown.value);
        } else {
          captureImage();
          localStep.value += 1;
          setCurrentStep(localStep.value);
   
          if (localStep.value > maxSteps) {
            clearInterval(interval!);
            setTimeout(() => {
              console.log("Setting intro to 6");
              state.intro = 6;
              localStorage.setItem('currentIntro', '6');
              stopCamera();
              // นำทางไปหน้า select หลังจาก delay
              setTimeout(() => {
                router.push('/booth/select');
              }, 0);
            }, 1000);
          }
   
          localCountdown.value = 12;
          setCountdown(localCountdown.value);
        }
      }, 1000);
    }
   
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
   }, [snap.intro, doneDelay, maxSteps]);
   
   const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing the camera: ", error);
    }
   };

    // ฟังก์ชันหยุดกล้อง
    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
        }
    };

    // ฟังก์ชันจับภาพจากกล้อง
    const captureImage = () => {
        if (isCapturingRef.current) return; // หากกำลังจับภาพอยู่ ให้ return ออกไป
    
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                isCapturingRef.current = true; // ตั้งค่าสถานะว่ากำลังจับภาพ
    
                // วาดภาพจากวิดีโอลงใน canvas
                context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
                
                // แปลงภาพใน canvas เป็น data URL
                const dataUrl = canvasRef.current.toDataURL('image/png');
                
                // เก็บ URL ไว้ใน state และ log ออกมาใน console
                setImageSrcs(prev => [...prev, dataUrl]); // อัพเดต useState
                state.imageSrcs.push(dataUrl); // อัพเดตใน valtio state ด้วย
    
                // ใช้ callback ใน setCurrentStep เพื่อให้ console.log ใช้ค่าที่ถูกต้อง
                setCurrentStep(prevStep => {
                    console.log(`Captured image URL (step ${prevStep + 1}):`, dataUrl);
                    isCapturingRef.current = false; // จบการจับภาพ
                    return prevStep + 1;
                });
            }
        }
    };

    const exitAnimation = {
        scale: [1, 1.2, 0],
        opacity: [1, 0.5, 0],
        transition: {
          duration: 0.5,
          ease: "easeInOut"
        },
    };

    return (
        <>
            <AnimatePresence>
              {(snap.intro === 5 || window.location.pathname === '/booth/selfie') && (
                    <motion.div 
                        className="w-screen h-screen border-transparent border-2 flex flex-col lg:flex-row justify-center items-center relative select-none"
                        animate={{ backgroundColor: "#222222" }} 
                        initial={{ backgroundColor: "#F7F7F7" }} 
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        exit={exitAnimation} 
                    >
                        {/* ส่วนของเลข 12 และสัดส่วน */}
                        <div className="md:w-[27rem] md:h-[10rem] sm:w-[24rem] sm:h-[10rem] w-[20rem] h-[10rem] flex justify-center items-center border-2 border-transparent lg:hidden">
                            <div className="md:w-[8.5rem] md:h-[8.5rem] sm:w-[8rem] sm:h-[8rem] w-[8rem] h-[8rem] bg-[#8E8E93] rounded-full flex justify-center items-center">
                                <p className="font-bebas-neue-400 text-white md:text-[3.5rem] text-[2.5rem] xl:mt-[3.8rem] lg:mt-[2.8rem] md:mt-[3.7rem] mt-10 ">
                                  {currentStep > maxSteps ? "DONE!" : countdown}
                                </p>
                            </div>
                        </div>
                        
                        <div className="xl:w-[30rem] lg:w-[20rem] hidden lg:block"></div>

                        <div className="flex justify-center items-center xl:w-[36rem] xl:h-[48rem] lg:w-[27rem] lg:h-[39rem] md:w-[27rem] md:h-[39rem] sm:w-[24rem] sm:h-[36rem] w-[20rem] h-[32rem] bg-[#F7F7F7] select-none">                      
                            <video ref={videoRef} autoPlay className="w-full h-full object-cover">
                            <canvas ref={canvasRef} className="w-full h-full" style={{ display: "none" }}></canvas>                    
                            </video>
                        </div>
                        
                        {/* แสดง countdown และ currentStep */}
                        <div className="md:w-[27rem] md:h-[10rem] sm:w-[24rem] sm:h-[10rem] w-[20rem] h-[10rem] border-2 md:text-[3.5rem] text-[2.5rem] flex flex-col items-center justify-center border-transparent lg:hidden">
                            <p className="font-bebas-neue-400 text-white mt-3">
                                {currentStep > maxSteps ? "DONE!" : `${currentStep}/${maxSteps}`}
                            </p>
                            <p className="font-inter-400 md:text-[1.1rem] text-[1rem] text-center text-white">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
                        </div>
                        
                        <div className="xl:w-[30rem] xl:h-[48rem] lg:w-[20rem] lg:h-[39rem] hidden lg:block border-2 border-transparent flex flex-col">
                            <div className="w-full flex">
                                <div className="w-[50%] h-[15rem] border-transparent border-2 xl:text-[5.5rem] lg:text-[4rem] pl-10">
                                    <p className="font-bebas-neue-400 text-white">          
                                        {currentStep > maxSteps ? "DONE!" : `${currentStep}/${maxSteps}`}
                                    </p>
                                </div>
                                <div className="w-[50%] h-[15rem] border-transparent border-2 flex justify-center">
                                    <div className="xl:w-[12.5rem] xl:h-[12.5rem] lg:w-[8rem] lg:h-[8rem] bg-[#8E8E93] rounded-full flex justify-center items-center">
                                        <p className="font-bebas-neue-400 text-white xl:text-[3.5rem] lg:text-[2.5rem] xl:mt-[3.8rem] lg:mt-[2.8rem] md:mt-[3.7rem] mt-10">
                                          {currentStep > maxSteps ? "DONE!" : countdown}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="w-[80%] xl:h-[25rem] lg:h-[18rem] border-transparent border-2 flex items-end xl:mb-[10rem] lg:mb-[7rem] md:mb-[-1rem] lg:ml-[2rem] xl:ml-[2rem] text-start text-white font-inter-400">
                                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                            </div>
                            <div className="w-5 h-5 border-red-500 border-2" onClick={handleNext}>

                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}