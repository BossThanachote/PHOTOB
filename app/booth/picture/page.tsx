'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function PictureDownload() {
  const searchParams = useSearchParams();
  const imageUrl = searchParams.get('imageUrl'); // ดึงค่า imageUrl จาก query parameter

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <h1 className="text-2xl font-bold mb-5">Download Your Image</h1>

      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Customized Image"
          className="rounded-lg shadow-lg mb-5 w-[300px] h-[300px] object-cover"
        />
      ) : (
        <p>No image available for download. Please go back and customize an image first.</p>
      )}

      <button
        className="bg-blue-500 text-white py-2 px-4 rounded-lg"
        onClick={() => {
          if (imageUrl) {
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = 'customized-image.png';
            link.click();
          }
        }}
      >
        Download Image
      </button>
    </div>
  );
}
