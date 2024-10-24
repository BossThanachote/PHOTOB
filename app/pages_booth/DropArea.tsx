// 'use client'
// import { motion, AnimatePresence } from "framer-motion";
// import { DndProvider, useDrag, useDrop } from "react-dnd";
// import { HTML5Backend } from 'react-dnd-html5-backend';
// import state from "../valtio_config";
// import { useSnapshot } from "valtio";
// import { IoIosArrowDropleft } from "react-icons/io";
// import { IoIosArrowDropright } from "react-icons/io";
// import Image from "next/image";
// import { useState, useEffect, useRef } from "react";
// import { Modal, Button } from 'antd'; 
// import 'antd/dist/reset.css'; 
// import { ChromePicker } from "react-color";
// import { MockImages } from "../MockAPI/MockImage";

// import { colors as mockColors } from '../MockAPI/MockFrameColor';



// interface DropItem {
//     id: number;
//     src: string;
//     alt: string;
//     x: number;
//     y: number;
//     width: number;
//     height: number;
//   }

//   const ItemTypes = {
//     IMAGE: "image",
//   };

//   const getImageSize = (src: string): Promise<{ width: number, height: number }> => {
//     return new Promise((resolve, reject) => {
//       const img = new window.Image();
//       img.src = src;
//       img.onload = () => {
//         resolve({ width: img.width, height: img.height });
//       };
//       img.onerror = (error) => {
//         reject(error);
//       };
//     });
//   };
// // ฟังก์ชั่นลากรูปวาง
//   const DraggableImage = ({ id, src, alt }: { id: number; src: string; alt: string }) => {
//     const [{ isDragging }, drag] = useDrag(() => ({
//       type: ItemTypes.IMAGE,
//       item: { id, src, alt },
//       collect: (monitor) => ({
//         isDragging: !!monitor.isDragging(),
//       }),
//     }));
  
//     const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  
//     useEffect(() => {
//       getImageSize(src).then((imageSize) => {
//         setSize(imageSize);
//       }).catch(() => {
//         // Fallback กรณีที่การโหลดขนาดรูปภาพล้มเหลว
//         setSize({ width: 100, height: 100 });
//       });
//     }, [src]);
  
//     if (!size) return null; // รอให้ขนาดถูกโหลดก่อนที่จะแสดงภาพ
  
//     return (
//       <div
//         ref={drag as any}
//         style={{ 
//             opacity: isDragging ? 0.5 : 1, 
//             cursor: 'move' ,
//             backgroundColor: 'transparent', // เพิ่ม background โปร่งใส
//             padding: 0, 
//             margin: 0, }}
//       >
//         <Image src={src} alt={alt} width={size.width} height={size.height} />
//       </div>
//     );
//   };

//   interface DropAreaProps {
//     currentColorIndex: number;
//     colors: string[];
//     bgColorColor: string;
//     bgColorGray: string;
//     selectedImages: string[];
//     droppedImages: DropItem[];
//   }

// export const DropArea: React.FC<DropAreaProps> = ({ currentColorIndex, colors, bgColorColor, bgColorGray,selectedImages, droppedImages}) => {
//     const [droppedImagesState, setDroppedImages] = useState<DropItem[]>([]);
//     const dropAreaRef = useRef<HTMLDivElement | null>(null);
//     const [isLargeScreen, setIsLargeScreen] = useState(false);
//     const snap = useSnapshot(state);
  
//     useEffect(() => {
//   // โหลดค่าจาก state ของ valtio เมื่อเปิด DropArea ใหม่
//   if (state.droppedImages.length > 0) {
//     setDroppedImages([...state.droppedImages]);
//   }
// }, []);

//     useEffect(() => {
//       const updateScreenSize = () => {
//         setIsLargeScreen(window.innerWidth >= 1024);
//       };
//       window.addEventListener('resize', updateScreenSize);
//       updateScreenSize();
  
//       return () => window.removeEventListener('resize', updateScreenSize);
//     }, []);
  
//     // ฟังก์ชันเพื่อรับขนาดภาพ
//     const getImageSize = (src: string): Promise<{ width: number, height: number }> => {
//         return new Promise((resolve, reject) => {
//             const img = new window.Image();
//           img.src = src;
//           img.onload = () => {
//             resolve({ width: img.width, height: img.height });
//           };
//           img.onerror = (error) => reject(error);
//         });
//       };
  
//       const [{ isOver }, drop] = useDrop<DropItem, void, { isOver: boolean }>({
//         accept: ItemTypes.IMAGE,
//         drop: (item, monitor) => {
//           const delta = monitor.getClientOffset();
//           const dropArea = dropAreaRef.current?.getBoundingClientRect();
//           //ตำแหน่งการวาง
//           if (delta && dropArea) {
//             try {
//               getImageSize(item.src).then(({ width, height }) => {
//                 let x = delta.x - dropArea.left - (width / 2);
//                 let y = delta.y - dropArea.top - (height / 2);
      
//                 state.droppedImages = [
//                   ...state.droppedImages, // กระจาย array เดิม
//                   { ...item, x, y, width, height }, // เพิ่ม item ใหม่
//                 ];

//                 if (isLargeScreen) {
//                   x -= 13;
//                   y -= 155;
//                 } else {
//                   x -= 13;
//                   y -= 125;
//                 }
                
                
//                 setDroppedImages((prev) => [
//                   ...prev,
//                   {
//                     ...item,
//                     x,
//                     y,
//                     width,
//                     height,
//                   },
//                 ]);
//               });
//             } catch (error) {
//               console.error('Error loading image size:', error);
//             }
//           }
//         },
//         collect: (monitor) => ({
//           isOver: !!monitor.isOver(),
//         }),
//       });
      

//       //component ภาพถ่าย
//       return (
//         <div
//           ref={(node) => {
//             dropAreaRef.current = node;
//             drop(node as any);
//           }}
//           className="relative w-[30rem] lg:h-[44rem] md:h-[40rem] h-[40rem] border-[1px] border-[#C6C6C980] flex justify-center items-center bg-white lg:mb-0 mb-10 overflow-hidden"
//           style={{ backgroundColor: isOver ? "#f0f0f0" : colors[currentColorIndex] }}
//           onDragStart={(e) => e.preventDefault()}
//         >
//           <div className="w-[95%] h-[95%] border-[1px] border-transparent flex-col flex">
//             {/* Dynamic grid to display all selected images */}
//             <div className="grid grid-cols-2 gap-4 justify-items-center items-center">
//               {snap.selectedImages.map((src, index) => (
//                 <div
//                   key={index}
//                   className="bg-[#C7C7CC] lg:w-[13rem] lg:h-[16rem] w-[13rem] h-[15rem] flex justify-center items-center"
//                   style={{ backgroundColor: bgColorGray }}
//                 >
//                   <Image src={src} alt={`Selected Image ${index}`} width={1000} height={1000} className="w-full h-full object-cover" />
//                 </div>
//               ))}
//             </div>
      
//             {/* Dropped images */}
//             {droppedImagesState.map((image, index) => (
//               <div
//                 key={index}
//                 style={{
//                   position: "absolute",
//                   left: image.x,
//                   top: image.y,
//                   width: image.width,
//                   height: image.height,
//                 }}
//               >
//                 <Image src={image.src} alt={image.alt} width={image.width} height={image.height} />
//               </div>
//             ))}
//           </div>
//         </div>
//       );
//     };