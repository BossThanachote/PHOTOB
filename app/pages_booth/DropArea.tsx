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
        selectedImages: string[];
      }
     // DropArea component for dropping images
      export const DropArea: React.FC<DropAreaProps> = ({ currentColorIndex, colors, bgColorColor, bgColorGray, selectedImages, droppedImages}) => {
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
                <div className="relative grid grid-cols-2 justify-center items-center border-[1px] gap-4 border-red-500 h-full">
                {selectedImages.map((src, index) => (
                    <motion.div key={index} className="w-full aspect-w-1 aspect-h-1 bg-[#000000CC] flex justify-center items-center select-none cursor-pointer" 
                    whileTap={{scale:0.7}} 
                    >
                      {src ? <Image src={src} alt={`Selected image ${index}`} width={10000} height={100000} className="w-full h-full object-cover" /> : <Image src="/picture.png" alt="" width={10000} height={100000} className="w-5 h-5" />}
                    </motion.div>
                  ))}
        
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
                </div>
              </div>
            </div>
          );
        };