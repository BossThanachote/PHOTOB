'use client'

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useSnapshot } from "valtio";
import state from "../valtio_config"; 

// SVG สำหรับแสงแฟลชสีขาวเต็มหน้าจอ
const FlashEffect = () => (
  <motion.div 
    className="absolute inset-0 bg-white z-[100] pointer-events-none"
    initial={{ opacity: 0 }}
    animate={{ opacity: [0, 1, 0] }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
  />
);

export default function Selfie() {
    const snap = useSnapshot(state);
    
    // State สำหรับจัดการ countdown และ steps
    const [countdown, setCountdown] = useState(12); // เริ่มต้นที่ 12 วินาที
    const [currentStep, setCurrentStep] = useState(1); // เริ่มต้นที่รูปที่ 1
    const [flashActive, setFlashActive] = useState(false); // ควบคุมแฟลชตอนถ่าย
    
    // Refs สำหรับจัดการกล้องและ canvas
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isCapturingRef = useRef(false);

    // กำหนดจำนวนรูปสูงสุดตาม frame ที่เลือก
    const maxSteps = snap.selectedDiv === 1 ? 6 : snap.selectedDiv === 2 ? 8 : 6;
    
    // เช็คว่าถ่ายรูปครบหรือยัง
    const isAllDone = currentStep > maxSteps;

    // เปิด/ปิดกล้อง และเคลียร์ข้อมูลเมื่อเข้ามาหน้านี้
    useEffect(() => {
        if (snap.intro === 5) {
            state.imageSrcs = []; // เคลียร์รูปเก่า
            setCountdown(12);
            setCurrentStep(1);
            setFlashActive(false);
            startCamera(); 
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [snap.intro]);

    // นับถอยหลัง 12 วินาที
    useEffect(() => {
        if (snap.intro !== 5 || isAllDone) return;

        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            // นับถอยหลังถึง 0 -> ถ่ายรูป
            captureImage();
            
            // เอฟเฟกต์แฟลช
            setFlashActive(true);
            setTimeout(() => setFlashActive(false), 300);

            // ขยับไป Step ถัดไป (ถ้าครบแล้วเดี๋ยว Effect ตัวล่างจะจัดการเอง)
            setCurrentStep((prev) => prev + 1);
            setCountdown(12); 
        }
    }, [countdown, snap.intro, isAllDone]);

    //  จับตาดูตอนถ่ายรูปครบแล้วเปลี่ยนหน้า
    useEffect(() => {
        if (snap.intro === 5 && isAllDone) {
            console.log("All photos taken! Preparing transition...");
            
            // ปิดกล้องทันทีที่ถ่ายครบ
            stopCamera(); 

            // รอ 3 วินาทีให้ User เห็นคำว่า DONE! ก่อนเด้งไปหน้าถัดไป
            const finishTimer = setTimeout(() => {
                console.log("Transitioning to intro 6 (Select Photo)");
                state.intro = 6;
                localStorage.setItem('currentIntro', '6');
            }, 3000);

            return () => clearTimeout(finishTimer);
        }
    }, [isAllDone, snap.intro]);


    // ฟังก์ชันเปิดกล้อง
    const startCamera = () => {
        navigator.mediaDevices.getUserMedia({ video: { aspectRatio: 3 / 4, facingMode: 'user' } })
            .then(stream => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch(error => console.error("Error accessing the camera: ", error));
    };

    // ฟังก์ชันปิดกล้อง
    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    // ฟังก์ชันจับภาพ
    const captureImage = () => {
        if (isCapturingRef.current) return;
    
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                isCapturingRef.current = true;
    
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;

                context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
                const dataUrl = canvasRef.current.toDataURL('image/png', 0.9);
                
                state.imageSrcs.push(dataUrl); 
    
                console.log(`Captured photo URL (step ${currentStep}/${maxSteps})`);
                isCapturingRef.current = false;
            }
        }
    };

    // ปุ่มสำหรับเทส ข้ามไปหน้าถัดไปทันที 
    const handleForceNext = () => {
        state.intro = 6;
        localStorage.setItem('currentIntro', '6');
    };

    return (
        <AnimatePresence>
            {snap.intro === 5 && (
                <motion.div 
                    className="w-screen h-screen flex flex-col justify-center items-center relative select-none overflow-hidden"
                    animate={{ backgroundColor: "#222222" }} 
                    initial={{ backgroundColor: "#F7F7F7" }} 
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    exit={{ scale: [1, 1.2, 0], opacity: [1, 0.5, 0], transition: { duration: 0.5, ease: "easeInOut" } }} 
                >
                    
                    {flashActive && <FlashEffect />}

                    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-16 w-full max-w-6xl">
                        
                        {/* ส่วนกล้อง (ตรงกลาง) */}
                        <div className="relative flex justify-center items-center w-[20rem] h-[30rem] sm:w-[24rem] sm:h-[36rem] md:w-[27rem] md:h-[40rem] lg:w-[32rem] lg:h-[48rem] bg-white border-[10px] md:border-[15px] border-white shadow-lg overflow-hidden shrink-0">
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror-view"></video>
                            <canvas ref={canvasRef} className="hidden"></canvas>
                        </div>

                        {/* ส่วนข้อมูล */}
                        <div className="flex flex-col items-center lg:items-start pt-4 lg:pt-10">
                            
                            <div className="flex flex-row lg:flex-row items-center gap-6 lg:gap-10">
                                {/* ข้อความ 2/6 */}
                                <div className="text-white font-bebas-neue-400 text-6xl md:text-7xl lg:text-[6rem] leading-none tracking-wider">
                                    {isAllDone ? "DONE!" : (
                                        <>
                                            <span>{currentStep}</span>
                                            <span className="text-[#8E8E93]">/{maxSteps}</span>
                                        </>
                                    )}
                                </div>

                                {/* วงกลมนับเวลาถอยหลัง */}
                                <div className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 bg-[#8E8E93] rounded-full grid place-items-center shadow-md">
                                    <p className="font-bebas-neue-400 text-white text-5xl md:text-6xl lg:text-7xl leading-none translate-y-1">
                                        {isAllDone ? "DONE" : countdown}
                                    </p>
                                </div>
                            </div>

                            {/* ข้อความ Dummy */}
                            <div className="text-white font-inter-400 text-sm md:text-base mt-10 max-w-xs text-center lg:text-left text-[#C6C6C9] leading-relaxed">
                                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                            </div>
                            
                            {/* ปุ่มเทสซ่อน (กดเพื่อ Force ข้ามหน้า) */}
                            <div className="w-6 h-6 border-red-500 border-2 mt-4 cursor-pointer opacity-20 hover:opacity-100 rounded-sm" onClick={handleForceNext} title="Force Next Page"></div>
                        </div>

                    </div>

                    <style jsx global>{`
                      .mirror-view { transform: scaleX(-1); }
                    `}</style>
                </motion.div>
            )}
        </AnimatePresence>
    )
}