'use client'
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PictureBooth() {
    const searchParams = useSearchParams();
    const [imageURL, setImageURL] = useState<string | null>(null);

    useEffect(() => {
        const image = searchParams.get("imageURL");
        if (image) {
            setImageURL(image);
        }
    }, [searchParams]);

    const handleDownload = () => {
        if (imageURL) {
            const link = document.createElement("a");
            link.href = imageURL;
            link.download = "downloaded_image.png";
            link.click();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-2xl font-bold mb-4">Your Picture</h1>
            {imageURL ? (
                <>
                    <img src={imageURL} alt="Captured" className="w-[300px] h-auto mb-4" />
                    <button 
                        onClick={handleDownload} 
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                    >
                        Download Image
                    </button>
                </>
            ) : (
                <p>No image available</p>
            )}
        </div>
    );
}
