'use client'

import { AnimatePresence } from "framer-motion";
import { DndProvider, useDrag } from "react-dnd";
import { HTML5Backend } from 'react-dnd-html5-backend';
import state from "@/app/valtio_config";
import { useSnapshot } from "valtio";
import { IoIosArrowDropleft, IoIosArrowDropright } from "react-icons/io";
import { useState, useEffect, useRef } from "react";
import { ChromePicker } from "react-color";
import html2canvas from 'html2canvas';
import { colors as mockColors } from "@/app/MockAPI/MockFrameColor";
import { DropArea } from "@/app/pages_booth/DropArea"; 
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useBoothSession } from "@/app/lib/useBoothSession";
import { supabase } from '@/app/lib/supabase'; 
import { colorsBorder as mockColorsBorder } from "@/app/MockAPI/MockBorderColor";
const ItemTypes = { IMAGE: "image" };

const getImageSize = (src: string): Promise<{ width: number, height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = (error) => reject(error);
  });
};

const DraggableImage = ({ id, src, alt }: { id: string; src: string; alt: string }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.IMAGE,
    item: { id, src, alt },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  
  useEffect(() => {
    getImageSize(src).then((s) => setSize(s)).catch(() => setSize({ width: 80, height: 80 }));
  }, [src]);
  
  if (!size) return null; 
  return (
    <div ref={drag as any} style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move' }}>
      <img src={src} alt={alt} style={{ width: '100%', height: 'auto', maxHeight: '80px', objectFit: 'contain' }} />
    </div>
  );
};

export default function Custom() {
  const router = useRouter();
  const snap = useSnapshot(state);
  const { session, isLoading: sessionLoading } = useBoothSession();
  
  const [isVisible, setIsVisible] = useState(false); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [machineStickers, setMachineStickers] = useState<any[]>([]);
  const [isLoadingStickers, setIsLoadingStickers] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const dropAreaRef = useRef<HTMLDivElement | null>(null);

  // ฟังก์ชันดึงสติ๊กเกอร์ 
  useEffect(() => {
    const fetchAllStickers = async () => {
      try {
        setIsLoadingStickers(true);
        // ดึงสติ๊กเกอร์ทั้งหมดที่ Boss อัปโหลดไว้ในตาราง sticker
        const { data: stickers, error } = await supabase
          .from('sticker')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setMachineStickers(stickers || []);
      } catch (error) {
        console.error("Error fetching stickers:", error);
      } finally {
        setIsLoadingStickers(false);
      }
    };

    fetchAllStickers();
  }, []); 

  useEffect(() => {
    state.intro = 7;
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleClearStickers = () => { state.droppedImages = []; setRefreshKey(prev => prev + 1); };
  const getText = (en: string, th: string) => snap.language === "TH" ? th : en;

  const handleNext = async () => {
    setIsProcessing(true);
    if (dropAreaRef.current) {
      const canvas = await html2canvas(dropAreaRef.current, { useCORS: true, backgroundColor: null });
      state.savedDropAreaImage = canvas.toDataURL("image/png");
    }
    setTimeout(() => {
      setIsProcessing(false);
      router.push(`/booth/download`); 
    }, 1000);
  };

  const [bgColorColor, setBgColorColor] = useState("#FFFFFF");
  const [bgColorGray, setBgColorGray] = useState("rgba(61, 61, 216, 0.3)");
  const [activePicker, setActivePicker] = useState<string | null>(null);

  if (sessionLoading || !session) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-12 h-12" /></div>
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <AnimatePresence> 
      {isVisible && (
          <div className="w-screen h-screen flex flex-col bg-[#F7F7F7] overflow-hidden">
            {/* Navbar */}
            <div className="flex justify-between items-center w-full px-10 py-5 bg-white shadow-sm z-50">
              <button onClick={() => router.back()} className="flex items-center gap-2 font-bold text-gray-500 hover:text-black">
                <IoIosArrowDropleft size={24}/> {getText("Back", "กลับ")}
              </button>
              <h1 className="font-bebas-neue-400 text-3xl tracking-widest">{getText("DECORATE", "ตกแต่ง")}</h1>
              <button onClick={handleNext} disabled={isProcessing} className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded-2xl font-bold hover:bg-gray-800 disabled:opacity-50">
                {isProcessing ? <Loader2 className="animate-spin"/> : <>{getText("Next", "ถัดไป")} <IoIosArrowDropright size={24}/></>}
              </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-10 p-10 overflow-y-auto">
              
              {/* Left: Filter */}
              <div className="w-full lg:w-64 flex flex-col gap-4 shrink-0">
                <div className="bg-white p-6 rounded-3xl shadow-sm border text-center">
                  <p className="font-bold mb-4">Frame Color</p>
                  <div 
                    className="w-16 h-16 rounded-full mx-auto cursor-pointer border-4 border-gray-100 shadow-inner"
                    style={{ backgroundColor: bgColorColor }}
                    onClick={() => setActivePicker(activePicker === 'color' ? null : 'color')}
                  />
                  {activePicker === 'color' && (
                    <div className="absolute z-50 mt-4"><ChromePicker color={bgColorColor} onChange={(c) => {
                      setBgColorColor(c.hex);
                      state.bgColorColor = c.hex;
                    }}/></div>
                  )}
                </div>
              </div>

              {/* Center: Preview */}
              <div className="shrink-0 shadow-2xl border-[12px] border-white rounded-xl bg-white">
                <DropArea
                  ref={dropAreaRef}
                  key={refreshKey}
                  currentColorIndex={snap.currentColorIndex || 0}
                  currentColorIndexBorder={snap.currentColorIndexBorder || 0} 
                  colors={mockColors}
                  colorsBorder={mockColorsBorder}
                  bgColorColor={bgColorColor}
                  bgColorGray={bgColorGray} 
                  filterColor={snap.filterColor || ''}
                  droppedImages={[...(snap.droppedImages || [])]}
                  selectedImages={[...(snap.selectedImages || [])]} 
                />
              </div>

              {/* Right: Stickers */}
              <div className="w-full lg:w-80 h-[60vh] bg-white rounded-[2rem] p-6 shadow-sm border flex flex-col shrink-0">
                <div className="flex justify-between items-center mb-4">
                  <p className="font-bold text-xl">Stickers</p>
                  <button onClick={handleClearStickers} className="text-red-500 text-xs font-bold hover:underline">CLEAR</button>
                </div>
                
                <div className="flex-1 overflow-y-auto bg-gray-50 rounded-2xl p-4 border-2 border-dashed border-gray-200">
                  {isLoadingStickers ? (
                    <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-gray-300"/></div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {machineStickers.map(s => (
                        <DraggableImage key={s.id} id={s.id} src={s.image_url} alt={s.name} />
                      ))}
                      {machineStickers.length === 0 && <p className="col-span-3 text-center text-gray-400 text-sm py-10">ยังไม่มีสติ๊กเกอร์ในระบบ</p>}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </AnimatePresence>
    </DndProvider>
  );
}