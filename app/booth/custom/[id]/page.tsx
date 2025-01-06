'use client'
import { motion, AnimatePresence } from "framer-motion";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from 'react-dnd-html5-backend';
import state from "@/app/valtio_config";
import { useSnapshot } from "valtio";
import { IoIosArrowDropleft } from "react-icons/io";
import { IoIosArrowDropright } from "react-icons/io";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Modal, Button } from 'antd'; 
import 'antd/dist/reset.css'; 
import { ChromePicker } from "react-color";
import { MockImages } from "@/app/MockAPI/MockImage";
import html2canvas from 'html2canvas';
import { colors as mockColors } from "@/app/MockAPI/MockFrameColor";
import { colorsBorder as mockColorsBorder } from "@/app/MockAPI/MockBorderColor";
import { DropArea } from "@/app/pages_booth/DropArea";
import { useRouter } from "next/navigation";
import photoService from "@/app/services/photoService";
import { useMachineCode } from "@/app/hooks/useMachineCode";
import machineService from "@/app/services/machineService";
import { useParams } from 'next/navigation';
import { StatusType } from "@/types/types";

interface MachineInfo {
  id: string;
  name: string;
  code: string;
  status: StatusType;
  frames?: Array<{ id: string; image?: string; frame?: string; frameName?: string }>;
  stickers?: Array<{ id: string; image?: string; sticker?: string; stickerName?: string }>;
}
  const ItemTypes = {
    IMAGE: "image",
  };

//   // กำหนดไซส์รูปขนาดเดิม
const getImageSize = (src: string): Promise<{ width: number, height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = (error) => reject(error);
  });
};

  
// // ฟังก์ชั่นลากรูปวาง
  const DraggableImage = ({ id, src, alt }: { id: number; src: string; alt: string }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: ItemTypes.IMAGE,
      item: { id, src, alt },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }));
  
    const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  
    useEffect(() => {
      getImageSize(src).then((imageSize) => {
        setSize(imageSize);
      }).catch(() => {
        // Fallback กรณีที่การโหลดขนาดรูปภาพล้มเหลว
        setSize({ width: 100, height: 100 });
      });
    }, [src]);
  
    if (!size) return null; // รอให้ขนาดถูกโหลดก่อนที่จะแสดงภาพ
  
    return (
      <div
        ref={drag as any}
        style={{ 
            opacity: isDragging ? 0.5 : 1, 
            cursor: 'move' ,
            backgroundColor: 'transparent', // เพิ่ม background โปร่งใส
            padding: 0, 
            margin: 0, }}
      >
        <Image src={src} alt={alt} width={size.width} height={size.height} />
      </div>
    );
  };

    const getLuminance = (r: number, g: number, b: number) => {
      const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    };
    
    // ฟังก์ชันสำหรับตรวจสอบว่าควรใช้ตัวอักษรสีขาวหรือดำ
    const getTextColor = (r: number, g: number, b: number) => {
      const luminance = getLuminance(r, g, b);
      return luminance > 0.5 ? "black" : "white"; // ถ้า luminance สูงกว่า 0.5 ใช้สีดำ, ถ้าต่ำกว่าใช้สีขาว
    };      

// Main component with DndProvider wrapping everything
export default function Custom() {
  const machineCode = useMachineCode();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false); 
  const snap = useSnapshot(state);
  const [showModal, setShowModal] = useState(false);
  const dropAreaRef = useRef<HTMLDivElement | null>(null);
  const [machineStickers, setMachineStickers] = useState<Array<{
    id: string;
    sticker?: string;
    image?: string;
    stickerName?: string;
  }>>([]);
  

  const params = useParams();
  const machineId = params.id as string; // ID จริงจาก API
  
  
  const [refreshKey, setRefreshKey] = useState(0);
  const handleClearStickers = () => {
    state.droppedImages = []; // ล้างข้อมูลสติ๊กเกอร์ที่ถูกวางบน DropArea
    setRefreshKey(prev => prev + 1); // อัปเดต refreshKey เพื่อบังคับ re-render
  };

  const getText = (englishText: string, thaiText: string) => {
    return snap.language === "TH" ? thaiText : englishText;
  };

  const getMachineStickersFromStorage = (machineId: string): any[] => {
    if (typeof window === 'undefined') return [];
    const storedStickers = localStorage.getItem(`machine_stickers_${machineId}`);
    return storedStickers ? JSON.parse(storedStickers) : [];
  };


  useEffect(() => {
    const fetchMachineData = async () => {
      try {
        // ดึง machineId จาก params หรือ localStorage และแปลงเป็น string
        const storedMachineId = (params.machineId || localStorage.getItem('selectedMachineId')) as string;
  
        if (!storedMachineId) {
          console.error("No machine ID found");
          router.push('/dashboard');
          return;
        }
  
        // ลองดึงจาก localStorage ก่อน
        const storedStickers = getMachineStickersFromStorage(storedMachineId);
        if (storedStickers.length > 0) {
          setMachineStickers(storedStickers);
          return;
        }
  
        // ถ้าไม่มีใน localStorage ดึงจาก API
        const response = await machineService.getTransactions();
        const targetMachine = response.find(machine => machine.id === storedMachineId);
        
        if (targetMachine?.stickers) {
          setMachineStickers(targetMachine.stickers);
          localStorage.setItem(
            `machine_stickers_${storedMachineId}`,
            JSON.stringify(targetMachine.stickers)
          );
        }
  
      } catch (error) {
        console.error('Error fetching machine data:', error);
      }
    };
  
    fetchMachineData();
  }, [params.machineId, router]);
  
  useEffect(() => {
    const fetchMachineStickers = async () => {
      try {
        // ใช้ non-null assertion operator (!) เพื่อบอก TypeScript ว่าค่าไม่เป็น null
        const storedMachineId: string = params.machineId ? params.machineId.toString() : localStorage.getItem('selectedMachineId') || '';
        
        // หรือใช้ type casting
        // const storedMachineId = (params.machineId || localStorage.getItem('selectedMachineId')) as string;
    
        if (!storedMachineId) {
          console.error("No machine ID found");
          return;
        }
    
        // ลองดึงจาก localStorage ก่อน
        const storedStickers = getMachineStickersFromStorage(storedMachineId);
        if (storedStickers.length > 0) {
          setMachineStickers(storedStickers);
          return;
        }
    
        // ถ้าไม่มีใน localStorage ให้ดึงจาก API
        const response = await machineService.getTransactions();
        const targetMachine = response.find(machine => machine.id === storedMachineId);
        
        if (targetMachine?.stickers) {
          setMachineStickers(targetMachine.stickers);
          localStorage.setItem(
            `machine_stickers_${storedMachineId}`,
            JSON.stringify(targetMachine.stickers)
          );
        }
      } catch (error) {
        console.error('Error fetching machine stickers:', error);
      }
    };
  
    fetchMachineStickers();
  }, [params.machineId]);


  useEffect(() => {
    if (window.location.pathname === '/booth/color') {
      state.intro = 7;
      localStorage.setItem('currentIntro', '7');
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
   
   const handleNext = async () => {
    const storedMachineId = localStorage.getItem('selectedMachineId');
   
    if (!storedMachineId) {
      console.error("No machine ID found");
      router.push('/dashboard');
      return;
    }
   
    const dropAreaElement = dropAreaRef.current;
    if (dropAreaElement) {
      dropAreaElement.style.filter = `brightness(${snap.filterColor})`;
   
      const canvas = await html2canvas(dropAreaElement);
      const imageURL = canvas.toDataURL("image/png");
   
      state.savedDropAreaImage = imageURL;
   
      try {
        const result = await photoService.uploadPhoto({
          machine_code: machineCode,
          file: imageURL
        });
   
        console.log("Raw response:", result);
   
        if (result && result.data) {
          state.uploadedPhotoId = result.data.id;
          state.uploadedPhotoUrl = result.data.ImageUrl;
   
          const photoData = {
            id: result.data.id,
            url: result.data.ImageUrl
          };
          localStorage.setItem('photoData', JSON.stringify(photoData));
   
          console.log("Saved photo data:", photoData);
        } else {
          console.error("Invalid response format:", result);
        }
   
        dropAreaElement.style.filter = '';
      } catch (error) {
        console.error('Error uploading photo:', error);
      }
    }
   
    await new Promise(resolve => setTimeout(resolve, 1000));
   
    setIsVisible(false);
    state.intro = 9;
    localStorage.setItem('currentIntro', '9');
    setIsVisible(true);
    router.push(`/booth/download/${storedMachineId}`);
   };
   
   const handleBack = () => {
    const storedMachineId = localStorage.getItem('selectedMachineId');
   
    if (!storedMachineId) {
      console.error("No machine ID found");
      router.push('/dashboard');
      return;
    }
   
    setIsVisible(false);
    setTimeout(() => {
      state.intro = 6;
      localStorage.setItem('currentIntro', '6');
      setIsVisible(true);
      setCurrentColorIndex(mockColors.indexOf("#FFFFFF"));
      setCurrentColorIndexBorder(mockColorsBorder.indexOf("#C7C7C7"));
      setTimeout(() => {
        router.push(`/booth/select/${storedMachineId}`);
      }, 0);
    }, 1000);
   };

  const handleCloseModal = () => setShowModal(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // สร้าง state สำหรับการเก็บ index ของสีที่เลือก
  const [currentColorIndex, setCurrentColorIndex] = useState<number>(0);
  const [currentColorIndexBorder, setCurrentColorIndexBorder] = useState<number>(0);
  
  //เช็คว่าสีที่ดึงมามีข้อมูลไหม
  if (!mockColors || mockColors.length === 0) {
    console.error("Colors array is empty or undefined");
    return null;
  }

  if(!mockColorsBorder || mockColorsBorder.length === 0) {
    console.error("Colors array is emtry or undefined");
    return null;
  }
  const handleLeftClickBorder = () => {
    const newIndex = snap.currentColorIndexBorder === 0 ? mockColorsBorder.length - 1 : snap.currentColorIndexBorder - 1;
    state.currentColorIndexBorder = newIndex;
    state.colorsBorder[snap.currentColorIndexBorder] = mockColorsBorder[newIndex]; // อัปเดตสีใน state ของ valtio
};

const handleRightClickBorder = () => {
    const newIndex = snap.currentColorIndex === mockColorsBorder.length - 1 ? 0 : snap.currentColorIndexBorder + 1;
    state.currentColorIndexBorder = newIndex;
    state.colorsBorder[snap.currentColorIndexBorder] = mockColorsBorder[newIndex]; // อัปเดตสีใน state ของ valtio
};
  

  
  // ฟังก์ชันสำหรับการเลื่อนไปทางซ้าย
  const handleLeftClick = () => {
    const newIndex = snap.currentColorIndex === 0 ? mockColors.length - 1 : snap.currentColorIndex - 1;
    state.currentColorIndex = newIndex;
    state.colors[snap.currentColorIndex] = mockColors[newIndex]; // อัปเดตสีใน state ของ valtio
};

const handleRightClick = () => {
    const newIndex = snap.currentColorIndex === mockColors.length - 1 ? 0 : snap.currentColorIndex + 1;
    state.currentColorIndex = newIndex;
    state.colors[snap.currentColorIndex] = mockColors[newIndex]; // อัปเดตสีใน state ของ valtio
};
  
  const [showColorPickerColor, setShowColorPickerColor] = useState(false);
  const [bgColorColor, setBgColorColor] = useState("#DD6287");
  const [textColorColor, setTextColorColor] = useState("white");

  // สถานะสำหรับองค์ประกอบ "Gray"
  const [showColorPickerGray, setShowColorPickerGray] = useState(false);
  const [bgColorGray, setBgColorGray] = useState("rgba(61, 61, 216, 0.3)");
  const [textColorGray, setTextColorGray] = useState("white");

  // สถานะสำหรับการเปิด Picker ใดๆ
  const [activePicker, setActivePicker] = useState<string | null>(null);
  
  
  const handleColorChangeColor = (color: any) => {
    const rgbaColor = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;
    setBgColorColor(rgbaColor);  
    state.bgColorColor = rgbaColor;  // บันทึกค่าใน global state ด้วย


  };

  // ฟังก์ชันเปลี่ยนสีสำหรับองค์ประกอบ "Gray"
  const handleColorChangeGray = (color: any) => {
    const rgbaGray = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`; // เก็บค่า rgba พร้อมกับ alpha
    setBgColorGray(rgbaGray);  // ใช้ค่า rgba แทนค่า hex
    const newTextColor = getTextColor(color.rgb.r, color.rgb.g, color.rgb.b);
    setTextColorGray(newTextColor);
    state.bgColorGray = rgbaGray;

    state.updateFilterColor(rgbaGray);
    console.log("Updated bgColorGray in Custom.tsx:", rgbaGray);

  };

  return (
    <DndProvider backend={HTML5Backend}>
      <AnimatePresence > 
      {(snap.intro === 7 || window.location.pathname === '/booth/custom') && isVisible && (
          <div className="w-screen h-screen flex flex-col justify-between border-transparent ">
            {/* Navbar */}
            <div className="flex justify-center items-center w-full px-10 md:hidden py-5 border-b border-transparent" >
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
            <div className="w-full h-full flex lg:flex-row flex-col items-center justify-center lg:gap-[5rem] gap-5">
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
                {/* filter ด้านซ้าย */}
                <div className="xl:w-[30rem] xl:h-[44rem] lg:w-[20rem] lg:h-[44rem] w-[30rem] h-[35rem] border-2 border-transparent px-[1rem] flex items-center justify-center flex-col" onDragStart={(e) => e.preventDefault()}>
                     {/* หัวข้อฟิวเตอร์ */}
                     <div className="w-full flex gap-3 items-center font-inter-400 text-[1.5rem] justify-center lg:justify-start">
                        <Image src="/picture.png" alt="heart" width={10000} height={10000} className="w-[2rem] h-[2rem]" />
                        <div>Filter</div>  
                    </div>
                    {/* ฟิวเตอร์ */}
                    <div className="w-full flex items-center font-inter-400 text-[1.5rem] gap-5 mb-[5rem] justify-center lg:justify-start mt-5">
                        {/* filter happy */}
                        <motion.div className="w-[6rem] h-[6rem] bg-white flex justify-center items-center rounded-full cursor-pointer"
                          whileTap={{ scale: 0.7 }}
                          onClick={() => setActivePicker(activePicker === "color" ? null : "color")}
                        >
                            <div className="w-[93%] h-[93%] rounded-full bg-[#DD6287] text-white flex justify-center items-center font-inter-400"
                              style={{ backgroundColor: bgColorColor, color: textColorColor }}
                            >
                              Color
                            </div>    
                        </motion.div>
                        {/* filter picture */}
                        {activePicker === "color" && (
                          <div className="absolute mt-[25rem]">
                            <ChromePicker color={bgColorColor} onChange={handleColorChangeColor} disableAlpha={false} />
                          </div>
                        )}
                        <motion.div className="w-[6rem] h-[6rem] bg-white flex justify-center items-center rounded-full cursor-pointer"
                          whileTap={{scale:0.7}}
                          onClick={() => setActivePicker(activePicker === "gray" ? null : "gray")}
                        >
                            <div className="w-[93%] h-[93%] rounded-full bg-[#C7C7CC] text-white flex justify-center items-center font-inter-400"
                              style={{ backgroundColor: bgColorGray, color: textColorGray}}
                            >
                              Color
                            </div> 
                        </motion.div>
                        {activePicker === "gray" && (
                          <div className="absolute mt-[25rem]">
                            <ChromePicker color={bgColorGray} onChange={handleColorChangeGray} disableAlpha={false} />
                          </div>
                        )}
                    </div>
                    {/* หัวข้อเลือกสีเฟรม */}
                    

                  
                </div>
                {/* component ภาพถ่าย + ลากรูป */}
                <DropArea
                  ref={dropAreaRef}
                  key={refreshKey}
                  currentColorIndex={snap.currentColorIndex}
                  currentColorIndexBorder={snap.currentColorIndexBorder}
                  colors={mockColors}
                  colorsBorder={mockColorsBorder}
                  bgColorColor={bgColorColor}
                  bgColorGray={bgColorGray}
                  filterColor={snap.filterColor}
                  droppedImages={[...(snap.droppedImages || [])]}
                  selectedImages={[...(snap.selectedImages || [])]} 
                />
                
                {/* filter ด้านขวา */}
                <div className="xl:w-[30rem] xl:h-[44rem] lg:w-[20rem] lg:h-[44rem] w-[30rem] h-[35rem] border-2 border-transparent px-[1rem] flex items-end" >
                  <div className="w-full h-full justify-center items-center border-2 border-transparent flex flex-col gap-5 text-[#222222]" >
                    {/* หัวข้อเลือกเฟรม */}
                    
                    
                    {/* หัวข้อสติ๊กเกอร์ */}
                    <div className="w-full flex gap-3 items-center font-inter-400 text-[1.5rem] justify-center lg:justify-start" onDragStart={(e) => e.preventDefault()}>
                        <Image src="/heart.png" alt="heart" width={10000} height={10000} className="w-[2rem] h-[2rem]" />
                        <div>Sticker</div>
                        <div onClick={handleClearStickers} className="cursor-pointer text-red-500">Delete</div>
                    </div>
                    {/* สติ๊กเกอร์ */}
                    <div className="border-2 border-transparent flex items-center gap-5">
                      <div className="w-full h-[12rem] overflow-auto border-2 border-[#C6C6C980] rounded-lg p-4 bg-white">
                        <div className="grid grid-cols-5 gap-4 cursor-grab" > 
                        {machineStickers.length > 0 ? (
                          machineStickers.map((sticker) => (
                            <DraggableImage 
                              key={sticker.id} 
                              id={Number(sticker.id)}
                              src={sticker.sticker || sticker.image || ''} 
                              alt={sticker.stickerName || `Sticker ${sticker.id}`} 
                            />
                          ))
                        ) : (
                          <div className="col-span-5 text-center text-gray-500 py-4">
                            No stickers available for this machine
                          </div>
                        )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          
          </div>
        )}
      </AnimatePresence>
    </DndProvider>
  );
}
