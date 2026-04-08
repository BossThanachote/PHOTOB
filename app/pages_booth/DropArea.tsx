'use client'
import { motion, AnimatePresence } from "framer-motion";
import { useDrop } from "react-dnd";
import state from "../valtio_config";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import React, { forwardRef, useImperativeHandle } from 'react';

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

interface DropAreaProps {
  currentColorIndex: number;
  currentColorIndexBorder: number;
  colors: string[];
  colorsBorder: string[];
  bgColorColor: string;
  bgColorGray: string;
  droppedImages: DropItem[];
  selectedImages: string[];
  filterColor: string;
}

export const DropArea = forwardRef<HTMLDivElement, DropAreaProps>(
  ({ currentColorIndex, currentColorIndexBorder, colors, colorsBorder, bgColorColor, filterColor, bgColorGray, droppedImages, selectedImages }, ref) => {
    const [droppedImagesState, setDroppedImages] = useState<DropItem[]>([]);
    const dropAreaRef = useRef<HTMLDivElement | null>(null);
    const [isLargeScreen, setIsLargeScreen] = useState(false);
    const [selectedFrame, setSelectedFrame] = useState<string | null>(null);
    const [frameKey, setFrameKey] = useState<string>('');

    useEffect(() => {
      const loadSelectedFrame = () => {
        const selectedFrameData = localStorage.getItem('selectedFrame');
        if (selectedFrameData) {
          const frame = JSON.parse(selectedFrameData);
          console.log('Selected frame data:', frame);
          setSelectedFrame(frame.frame || frame.image);
          setFrameKey(frame.id || Date.now().toString());
        }
      };

      loadSelectedFrame();

      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'selectedFrame') {
          loadSelectedFrame();
        }
      };

      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }, []);

    useEffect(() => {
      setDroppedImages([]);
      state.droppedImages = [];
    }, [frameKey]);

    useEffect(() => {
      if (ref && typeof ref === 'object' && ref.current !== null) {
        ref.current = dropAreaRef.current;
      }
    }, [ref, dropAreaRef]);

    useEffect(() => {
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

    const [{ isOver }, drop] = useDrop<DropItem, void, { isOver: boolean }>({
      accept: ItemTypes.IMAGE,
      drop: (item, monitor) => {
        const delta = monitor.getClientOffset();
        const dropArea = dropAreaRef.current?.getBoundingClientRect();

        if (delta && dropArea) {
          try {
            getImageSize(item.src).then(({ width, height }) => {
              
           
              const MAX_SIZE = 120; 
              // คำนวณอัตราส่วนเพื่อไม่ให้ภาพเสียทรง (ถ้าภาพเล็กกว่า 120px อยู่แล้วก็ไม่ขยาย)
              const scale = Math.min(MAX_SIZE / width, MAX_SIZE / height, 1); 
              
              const renderWidth = width * scale;
              const renderHeight = height * scale;

             
              let x = delta.x - dropArea.left - (renderWidth / 2);
              let y = delta.y - dropArea.top - (renderHeight / 2);

              state.droppedImages = [
                ...state.droppedImages,
                { ...item, x, y, width: renderWidth, height: renderHeight },
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
                  width: renderWidth, 
                  height: renderHeight,
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

    useImperativeHandle(ref, () => dropAreaRef.current as HTMLDivElement);

    return (
      <div
        ref={(node) => {
          dropAreaRef.current = node;
          drop(node as any);
        }}
        className="relative w-[30rem] lg:h-[44rem] md:h-[40rem] h-[40rem] flex justify-center items-center lg:mb-0 mb-10 overflow-hidden"
        onDragStart={(e) => e.preventDefault()}
        key={frameKey}
      >
        {/* Frame Image Container */}
        <div className="absolute inset-0 w-full h-full">
          {selectedFrame && (
            <Image
              src={selectedFrame}
              alt="Selected Frame"
              layout="fill"
              objectFit="contain"
              className="pointer-events-none"
            />
          )}
        </div>

        {/* Content Container */}
        <div 
          className="relative w-[95%] h-[95%] z-10"
          style={{ 
            backgroundColor: isOver ? "#f0f0f0" : 'transparent',
            borderColor: isOver ? "#C7C7C7" : 'transparent' 
          }}
        >
          <div className="w-full h-full border-transparent flex-col flex">
           {/* Header with HAPPY DAY */}
            <div className="flex flex-col border-transparent lg:h-[10rem] h-[7rem] mb-10">
              <div className="w-full h-[10%] border-transparent flex justify-end pt-2 pr-2">
                <Image src="/sun.png" alt="sun" width={100} height={100} className="w-[2rem] h-[2rem]" />
              </div>
              
     
              <div className="w-full h-[80%] border-transparent flex justify-center items-center pt-[3rem] lg:pt-[3rem] font-dream-sparks-400 text-[3rem] lg:text-[3rem]">
                
                <div className="relative flex justify-center items-center whitespace-nowrap">
                  <Image 
                    src="/moon.png" 
                    alt="moon" 
                    width={100} 
                    height={100} 
                    className="w-[2rem] h-[2.2rem] absolute -left-[3rem]" 
                  />
                  <span className="text-black absolute z-0 mt-[6px] ml-[8px]">HAPPY DAY</span>
                  <span className="text-white relative z-10" style={{ color: bgColorColor }}>HAPPY DAY</span>
                </div>

              </div>
              
              <div className="w-full h-[10%] border-transparent flex justify-end pb-[1.8rem] pr-2">
                <Image src="/cloud-q.png" alt="cloud" width={100} height={100} className="w-[1.5rem] h-[1rem] absolute" />
              </div>
            </div>

            {/* Photos Grid */}
            <div className="relative grid grid-cols-2 grid-rows-3 gap-2 justify-center items-center border-transparent h-full">
              {selectedImages.map((src, index) => (
                <motion.div 
                  key={index} 
                  className="w-full h-full flex justify-center items-center select-none cursor-pointer"
                  style={{ backgroundColor: bgColorColor }}
                >
                  {src ? (
                    <div className="relative w-full h-full">
                      <div 
                        className="absolute z-10 top-0 left-0 w-full h-full" 
                        style={{ backgroundColor: bgColorGray }}
                      />
                      <Image
                        src={src}
                        alt={`Selected image ${index}`}
                        width={2000}
                        height={15000}
                        className="w-full h-full object-cover relative"
                      />
                    </div>
                  ) : (
                    <Image 
                      src="/picture.png" 
                      alt="" 
                      width={10000} 
                      height={100000} 
                      className="w-[5rem] h-[5rem]"
                    />
                  )}
                </motion.div>
              ))}

              {/* Dragged Stickers */}
              {droppedImagesState.map((image, index) => (
                <div
                  key={index}
                  style={{
                    position: "absolute",
                    left: image.x,
                    top: image.y,
                    width: image.width,
                    height: image.height,
                    zIndex: 20,
                    pointerEvents: "none"
                  }}
                >
                  <Image 
                    src={image.src} 
                    alt={image.alt} 
                    width={image.width} 
                    height={image.height}
                    className="w-full h-full object-contain drop-shadow-md"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
);