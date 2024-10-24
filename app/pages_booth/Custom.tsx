'use client'
import { motion, AnimatePresence } from "framer-motion";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from 'react-dnd-html5-backend';
import state from "../valtio_config";
import { useSnapshot } from "valtio";
import { IoIosArrowDropleft } from "react-icons/io";
import { IoIosArrowDropright } from "react-icons/io";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Modal, Button } from 'antd'; 
import 'antd/dist/reset.css'; 
import { ChromePicker } from "react-color";
import { MockImages } from "../MockAPI/MockImage";
import { colors as mockColors } from '../MockAPI/MockFrameColor';

  //กำหนด type
  interface DropItem {
    id: number;
    src: string;
    alt: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }

  const ItemTypes = {
    IMAGE: "image",
  };

  // กำหนดไซส์รูปขนาดเดิม
  const getImageSize = (src: string): Promise<{ width: number, height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.src = src;
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = (error) => {
        reject(error);
      };
    });
  };
// ฟังก์ชั่นลากรูปวาง
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

  interface DropAreaProps {
    currentColorIndex: number;
    colors: string[];
    bgColorColor: string;
    bgColorGray: string;
    droppedImages: DropItem[];
  }
 // DropArea component for dropping images
  export const DropArea: React.FC<DropAreaProps> = ({ currentColorIndex, colors, bgColorColor, bgColorGray, droppedImages}) => {
    const [droppedImagesState, setDroppedImages] = useState<DropItem[]>([]);
    const dropAreaRef = useRef<HTMLDivElement | null>(null);
    const [isLargeScreen, setIsLargeScreen] = useState(false);
  
    useEffect(() => {
  // โหลดค่าจาก state ของ valtio เมื่อเปิด DropArea ใหม่
  if (state.droppedImages.length > 0) {
    setDroppedImages([...state.droppedImages]);
  }
}, []);

    useEffect(() => {
      const updateScreenSize = () => {
        setIsLargeScreen(window.innerWidth >= 1024);
      };
      window.addEventListener('resize', updateScreenSize);
      updateScreenSize();
  
      return () => window.removeEventListener('resize', updateScreenSize);
    }, []);
  
    // ฟังก์ชันเพื่อรับขนาดภาพ
    const getImageSize = (src: string): Promise<{ width: number, height: number }> => {
        return new Promise((resolve, reject) => {
            const img = new window.Image();
          img.src = src;
          img.onload = () => {
            resolve({ width: img.width, height: img.height });
          };
          img.onerror = (error) => reject(error);
        });
      };
  
      const [{ isOver }, drop] = useDrop<DropItem, void, { isOver: boolean }>({
        accept: ItemTypes.IMAGE,
        drop: (item, monitor) => {
          const delta = monitor.getClientOffset();
          const dropArea = dropAreaRef.current?.getBoundingClientRect();
          //ตำแหน่งการวาง
          if (delta && dropArea) {
            try {
              getImageSize(item.src).then(({ width, height }) => {
                let x = delta.x - dropArea.left - (width / 2);
                let y = delta.y - dropArea.top - (height / 2);
      
                state.droppedImages = [
                  ...state.droppedImages, // กระจาย array เดิม
                  { ...item, x, y, width, height }, // เพิ่ม item ใหม่
                ];

                if (isLargeScreen) {
                  x -= 13;
                  y -= 155;
                } else {
                  x -= 13;
                  y -= 125;
                }
                
                
                setDroppedImages((prev) => [
                  ...prev,
                  {
                    ...item,
                    x,
                    y,
                    width,
                    height,
                  },
                ]);
              });
            } catch (error) {
              console.error('Error loading image size:', error);
            }
          }
        },
        collect: (monitor) => ({
          isOver: !!monitor.isOver(),
        }),
      });
      

      //component ภาพถ่าย
      return (
        <div
          ref={(node) => {
            dropAreaRef.current = node;
            drop(node as any);
          }}
          className="relative w-[30rem] lg:h-[44rem] md:h-[40rem] h-[40rem] border-[1px] border-[#C6C6C980] flex justify-center items-center bg-white lg:mb-0 mb-10 overflow-hidden"
          style={{ backgroundColor: isOver ? "#f0f0f0" : colors[currentColorIndex] , }} 
          onDragStart={(e) => e.preventDefault()}
        >
          <div className="w-[95%] h-[95%] border-[1px] border-transparent flex-col flex ">
            <div className="flex flex-col border-[1px] border-transparent lg:h-[10rem] h-[7rem]">
              <div className="w-full h-[10%] border-[1px] border-transparent flex justify-end pt-2 pr-2">
                <Image src="/sun.png" alt="sun" width={1000} height={1000} className="w-[2rem] h-[2rem]" />
              </div>
              <div className="w-full h-[80%] border-[1px] border-transparent flex justify-center items-center pt-[3rem] lg:pt-[3rem] font-dream-sparks-400 text-[3rem] lg:text-[3rem]">
                <Image src="/moon.png" alt="moon" width={1000} height={1000} className="w-[2rem] h-[2.2rem] absolute mr-[18rem] mb-[8rem]" />
                <p className="text-black absolute z-0">HAPPY DAY</p>
                <p className="text-white absolute z-10 ml-[0.3rem] mt-[0.2rem] text-shadow-black-2"style={{ color: bgColorColor }} >HAPPY DAY</p>
              </div>
              <div className="w-full h-[10%] border-[1px] border-transparent flex justify-end pb-[1.8rem] pr-2">
                <Image src="/cloud-q.png" alt="cloud" width={1000} height={1000} className="w-[1.5rem] h-[1rem] absolute" />
              </div>
            </div>
    
            {/* ด้านล่างนี้คือ Drop Area สำหรับรูปที่ลากมา */}
            <div className="relative flex flex-col justify-center items-center border-[1px] gap-4 border-transparent h-[32rem] mb-[1rem]">
              <div className="w-full lg:h-[20rem] h-[15rem] border-[1px] border-transparent flex gap-4 justify-center items-center">
                  <div className="bg-[#C7C7CC] lg:w-[13rem] lg:h-[16rem] w-[13rem] h-[15rem] flex justify-center items-center" style={{ backgroundColor: bgColorGray}}>
                    <Image src="/picture.png" alt="" width={1000} height={1000} className="w-[1.5rem] h-[1.5rem]" />
                  </div>
                  <div className="bg-[#C7C7CC] lg:w-[13rem] lg:h-[16rem] w-[13rem] h-[15rem] flex justify-center items-center" style={{ backgroundColor: bgColorGray}}>
                    <Image src="/picture.png" alt="" width={1000} height={1000} className="w-[1.5rem] h-[1.5rem]" />
                  </div>
              </div>
    
              {/* แสดงภาพที่ถูกลากวางใน DropArea */}
              {droppedImagesState.map((image, index) => (
                <div
                  key={index}
                  style={{
                    position: "absolute",
                    left: image.x,
                    top: image.y,
                    width: image.width,
                    height: image.height,
                  }}
                >
                  <Image src={image.src} alt={image.alt} width={image.width} height={image.height} />
                </div>
              ))}
    
              <div className="w-full lg:h-[20rem] h-[15rem] border-[1px] border-transparent flex gap-4 justify-center items-center">
                <div className="bg-[#C7C7CC] lg:w-[13rem] lg:h-[16rem] w-[13rem] h-[15rem] flex justify-center items-center" style={{ backgroundColor: bgColorGray}}>
                  <Image src="/picture.png" alt="" width={1000} height={1000} className="w-[1.5rem] h-[1.5rem]" /> 
                </div>
                <div className="bg-[#C7C7CC] lg:w-[13rem] lg:h-[16rem] w-[13rem] h-[15rem] flex justify-center items-center" style={{ backgroundColor: bgColorGray}}>
                  <Image src="/picture.png" alt="" width={1000} height={1000} className="w-[1.5rem] h-[1.5rem]" />
                </div>
              </div>
            </div>
          </div>
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
  const [isVisible, setIsVisible] = useState(false); 
  const snap = useSnapshot(state);
  const [showModal, setShowModal] = useState(false);
  const dropAreaRef = useRef<HTMLDivElement | null>(null);

  const getText = (englishText: string, thaiText: string) => {
    return snap.language === "TH" ? thaiText : englishText;
  };

  const handleNext = () => {
    setIsVisible(false); 
    setTimeout(() => {
      state.intro = 8; 
      setIsVisible(true); 
    }, 1200); 
  };

  const handleBack = () => {
    setIsVisible(false); 
    setTimeout(() => {
      state.intro = 6; 
      setIsVisible(true);
      setCurrentColorIndex(mockColors.indexOf("#FFFFFF"));
    }, 1200); 
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
  
  //เช็คว่าสีที่ดึงมามีข้อมูลไหม
  if (!mockColors || mockColors.length === 0) {
    console.error("Colors array is empty or undefined");
    return null;
  }
  
  
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
  const [bgColorGray, setBgColorGray] = useState("#C7C7CC");
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
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <AnimatePresence > 
        {snap.intro == 7 && isVisible && (
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
                    <div className="w-full flex gap-3 items-center font-inter-400 text-[1.5rem] justify-center lg:justify-start">
                        <Image src="/quan.png" alt="heart" width={10000} height={10000} className="w-[2rem] h-[2rem]" />
                        <div>Frame color</div>  
                    </div>
                    {/* เลือกสีเฟรม */}
                    <div className="w-full flex items-center font-inter-400 text-[1.5rem] gap-5 mb-[5rem] justify-center lg:justify-start mt-5">
                    <motion.div 
                      className="w-[6rem] h-[6rem] bg-white flex justify-center items-center rounded-full cursor-pointer"
                      onClick={handleLeftClick}
                      whileTap={{scale:0.7}}
                    >
                      <Image src="/totheleft.png" alt="left arrow" width={10000} height={10000} className="w-[1.1rem] h-[1.5rem]" />
                    </motion.div>
                    {/* สีเฟรมตรงกลาง */}
                    <div 
                      className="w-[6rem] h-[6rem] flex justify-center items-center rounded-full"
                      style={{ backgroundColor: snap.colors[snap.currentColorIndex] }}
                    ></div>
                    <motion.div 
                      className="w-[6rem] h-[6rem] bg-[#222222] flex justify-center items-center rounded-full cursor-pointer"
                      onClick={handleRightClick}
                      whileTap={{scale:0.7}}
                    >
                      <Image src="/totheright.png" alt="right arrow" width={10000} height={10000} className="w-[1.1rem] h-[1.5rem]" />
                    </motion.div>  
                  </div>
                </div>
                {/* component ภาพถ่าย + ลากรูป */}
                <DropArea
                  currentColorIndex={snap.currentColorIndex}
                  colors={mockColors}
                  bgColorColor={bgColorColor}
                  bgColorGray={bgColorGray}
                  droppedImages={[...(snap.droppedImages || [])]}
                />
                
                {/* filter ด้านขวา */}
                <div className="xl:w-[30rem] xl:h-[44rem] lg:w-[20rem] lg:h-[44rem] w-[30rem] h-[35rem] border-2 border-transparent px-[1rem] flex items-end" >
                  <div className="w-full h-full justify-center items-center border-2 border-transparent flex flex-col gap-5 text-[#222222]" >
                    {/* หัวข้อเลือกเฟรม */}
                    <div className="w-full flex gap-3 items-center font-inter-400 text-[1.5rem] justify-center lg:justify-start" onDragStart={(e) => e.preventDefault()}>
                        <Image src="/quan.png" alt="heart" width={10000} height={10000} className="w-[2rem] h-[2rem]" />
                        <div>Frame</div>  
                    </div>
                    {/* เลือกเฟรม */}
                    <div className="w-full flex items-center font-inter-400 text-[1.5rem] gap-5 mb-[5rem] justify-center lg:justify-start" onDragStart={(e) => e.preventDefault()}>
                        <motion.div className="w-[6rem] h-[6rem] bg-white flex justify-center items-center rounded-full cursor-pointer"
                          whileTap={{scale:0.7}}
                        >
                            <Image src="/totheleft.png" alt="heart" width={10000} height={10000} className="w-[1.1rem] h-[1.5rem]" />
                        </motion.div>  
                        <div>[ ]</div>
                        <motion.div className="w-[6rem] h-[6rem] bg-[#222222] flex justify-center items-center rounded-full cursor-pointer"
                          whileTap={{scale:0.7}}
                        >
                            <Image src="/totheright.png" alt="heart" width={10000} height={10000} className="w-[1.1rem] h-[1.5rem]" />
                        </motion.div>  
                    </div>
                    {/* หัวข้อสติ๊กเกอร์ */}
                    <div className="w-full flex gap-3 items-center font-inter-400 text-[1.5rem] justify-center lg:justify-start" onDragStart={(e) => e.preventDefault()}>
                        <Image src="/heart.png" alt="heart" width={10000} height={10000} className="w-[2rem] h-[2rem]" />
                        <div>Sticker</div>  
                    </div>
                    {/* สติ๊กเกอร์ */}
                    <div className="border-2 border-transparent flex items-center gap-5">
                      <div className="w-full h-[12rem] overflow-auto border-2 border-[#C6C6C980] rounded-lg p-4 bg-white">
                        <div className="grid grid-cols-5 gap-4 cursor-grab" > 
                          {MockImages.map((image) => (
                            <DraggableImage key={image.id} id={image.id} src={image.src} alt={image.alt} />
                          ))}
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
