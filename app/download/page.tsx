'use client'
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AutoDownload() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const url = searchParams.get('url');
    if (url) {
      const decodedUrl = decodeURIComponent(url);
      
      // สร้างลิงก์ดาวน์โหลดอัตโนมัติ
      const link = document.createElement('a');
      link.href = decodedUrl;
      link.download = 'watt-photo.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // รอสักครู่แล้วปิดหน้าต่าง
      setTimeout(() => {
        window.close();
      }, 1000);
    }
  }, [searchParams]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Downloading your photo...</h2>
        <p className="text-gray-600">Your download will begin automatically</p>
        <p className="text-gray-500 text-sm mt-4">You can close this window after the download starts</p>
      </div>
    </div>
  );
}