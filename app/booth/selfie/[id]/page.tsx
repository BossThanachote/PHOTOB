'use client'
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import state from "@/app/valtio_config";
import { useSnapshot } from "valtio";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useParams } from 'next/navigation';

export default function Selfie() {
  const router = useRouter();
  const snap = useSnapshot(state);
  const [isExiting, setIsExiting] = useState(false);
  const [countdown, setCountdown] = useState(12);
  const [currentStep, setCurrentStep] = useState(1);
  const [doneDelay, setDoneDelay] = useState(false);
  const [imageSrcs, setImageSrcs] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [maxSteps, setMaxSteps] = useState(3); // ค่าเริ่มต้นเป็น 3
  const isCapturingRef = useRef(false);
  const params = useParams();
  const machineId = params.machineId as string;

  // ฟังก์ชัน getShotFromStorage คล้ายกับในหน้า FrameManagement
  const getShotFromStorage = (frameId: string): number => {
    if (typeof window === 'undefined') return 3;
    const storedShot = localStorage.getItem(`frame_shot_${frameId}`);
    const shotValue = storedShot ? parseInt(storedShot) : 3;
    console.log('Getting shot from storage:', {
      frameId,
      storedShot,
      shotValue
    });
    return shotValue;
  };

  // โหลดค่า shot จาก localStorage
  // useEffect(() => {
  //   const selectedFrameId = localStorage.getItem('selectedFrameId');
  //   if (selectedFrameId) {
  //     const shotValue = getShotFromStorage(selectedFrameId);
  //     console.log('Setting maxSteps to:', shotValue);
  //     setMaxSteps(shotValue);
  //   }
  // }, []);

  // ในหน้า Selfie.tsx
useEffect(() => {
  // ดึง selectedFrameId จาก localStorage
  const selectedFrameId = localStorage.getItem('selectedFrameId');
  
  if (selectedFrameId) {
    // ดึงค่า shot จาก localStorage โดยใช้ frame_shot_{id}
    const shotValue = localStorage.getItem(`frame_shot_${selectedFrameId}`);
    console.log('Found shot value in storage:', shotValue);
    
    if (shotValue) {
      const numericShot = parseInt(shotValue);
      console.log('Setting maxSteps to:', numericShot);
      setMaxSteps(numericShot);
    }
  } else {
    // ถ้าไม่มี selectedFrameId ลองดูว่ามี selectedFrameShot ไหม (fallback)
    const selectedFrameShot = localStorage.getItem('selectedFrameShot');
    if (selectedFrameShot) {
      const numericShot = parseInt(selectedFrameShot);
      console.log('Using fallback shot value:', numericShot);
      setMaxSteps(numericShot);
    }
  }
}, []);

  // Set initial state
  useEffect(() => {
    if (machineId) {
      state.intro = 5;
      localStorage.setItem('currentIntro', '5');
    }
    
    if (snap.intro === 5) {
      setCountdown(12);
      setCurrentStep(1);
      setDoneDelay(false);
      startCamera();
    }
  }, [machineId, snap.intro]);

  // Handle browser back button
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

  // Main countdown and photo capture logic
  useEffect(() => {
    const storedMachineId = localStorage.getItem('selectedMachineId');
    let interval: NodeJS.Timeout | null = null;
    const localCountdown = { value: 12 };
    const localStep = { value: 1 };

    if (!storedMachineId) {
      console.error("No machine ID found");
      router.push('/dashboard');
      return;
    }

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
              state.intro = 6;
              localStorage.setItem('currentIntro', '6');
              stopCamera();
              setTimeout(() => {
                router.push(`/booth/select/${storedMachineId}`);
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
  }, [snap.intro, doneDelay, maxSteps, router]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing the camera:", error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const captureImage = () => {
    if (isCapturingRef.current) return;

    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        isCapturingRef.current = true;
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        const dataUrl = canvasRef.current.toDataURL('image/png');
        setImageSrcs(prev => [...prev, dataUrl]);
        state.imageSrcs.push(dataUrl);

        setCurrentStep(prevStep => {
          console.log(`Captured image URL (step ${prevStep + 1}):`, dataUrl);
          isCapturingRef.current = false;
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

  const getText = (englishText: string, thaiText: string) => {
    return snap.language === "TH" ? thaiText : englishText;
  };

  return (
    <AnimatePresence>
      {(snap.intro === 5 || window.location.pathname === '/booth/selfie') && (
        <motion.div
          className="w-screen h-screen border-transparent border-2 flex flex-col lg:flex-row justify-center items-center relative select-none"
          animate={{ backgroundColor: "#222222" }}
          initial={{ backgroundColor: "#F7F7F7" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          exit={exitAnimation}
        >
          {/* Countdown for mobile */}
          <div className="md:w-[27rem] md:h-[10rem] sm:w-[24rem] sm:h-[10rem] w-[20rem] h-[10rem] flex justify-center items-center border-2 border-transparent lg:hidden">
            <div className="md:w-[8.5rem] md:h-[8.5rem] sm:w-[8rem] sm:h-[8rem] w-[8rem] h-[8rem] bg-[#8E8E93] rounded-full flex justify-center items-center">
              <p className="font-bebas-neue-400 text-white md:text-[3.5rem] text-[2.5rem] xl:mt-[3.8rem] lg:mt-[2.8rem] md:mt-[3.7rem] mt-10">
                {currentStep > maxSteps ? "DONE!" : countdown}
              </p>
            </div>
          </div>

          <div className="xl:w-[30rem] lg:w-[20rem] hidden lg:block"></div>

          {/* Camera View */}
          <div className="flex justify-center items-center xl:w-[36rem] xl:h-[48rem] lg:w-[27rem] lg:h-[39rem] md:w-[27rem] md:h-[39rem] sm:w-[24rem] sm:h-[36rem] w-[20rem] h-[32rem] bg-[#F7F7F7] select-none">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover">
              Your browser does not support video playback.
            </video>
            <canvas ref={canvasRef} className="hidden"></canvas>
          </div>

          {/* Step counter and instructions */}
          <div className="md:w-[27rem] md:h-[10rem] sm:w-[24rem] sm:h-[10rem] w-[20rem] h-[10rem] border-2 md:text-[3.5rem] text-[2.5rem] flex flex-col items-center justify-center border-transparent lg:hidden">
            <p className="font-bebas-neue-400 text-white mt-3">
              {currentStep > maxSteps ? "DONE!" : `${currentStep}/${maxSteps}`}
            </p>
            <p className="font-inter-400 md:text-[1.1rem] text-[1rem] text-center text-white">
              {getText(
                "Please look at the camera and smile",
                "กรุณามองกล้องและยิ้ม"
              )}
            </p>
          </div>

          {/* Desktop layout */}
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
              {getText(
                "Please look at the camera and smile",
                "กรุณามองกล้องและยิ้ม"
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}