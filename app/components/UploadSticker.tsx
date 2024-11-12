// components/UploadStickerModal.tsx
import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface UploadedFile {
  file: File;
  preview: string;
  progress: number;
  status: 'Active' | 'Disable';
}

interface UploadStickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (stickers: { stickerName: string; sticker: string; status: 'Active' | 'Disable' }[]) => void;
}

export default function UploadStickerModal({ isOpen, onClose, onUpload }: UploadStickerModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      resetModal();
    }
  }, [isOpen]);

  const resetModal = () => {
    setDragActive(false);
    setUploadedFiles([]);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const processFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setUploadedFiles(prev => [
            ...prev,
            {
              file,
              preview: reader.result as string,
              progress: 0,
              status: 'Active'
            }
          ]);

          // Simulate upload progress
          const fileIndex = uploadedFiles.length;
          const interval = setInterval(() => {
            setUploadedFiles(prev => {
              const newFiles = [...prev];
              if (newFiles[fileIndex]) {
                if (newFiles[fileIndex].progress >= 100) {
                  clearInterval(interval);
                } else {
                  newFiles[fileIndex].progress += 10;
                }
              }
              return newFiles;
            });
          }, 200);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    processFiles(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleStatusChange = (index: number, status: 'Active' | 'Disable') => {
    setUploadedFiles(prev => {
      const newFiles = [...prev];
      newFiles[index].status = status;
      return newFiles;
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const completedFiles = uploadedFiles.filter(file => file.progress === 100);
    if (completedFiles.length > 0) {
      const stickerData = completedFiles.map(file => ({
        stickerName: file.file.name.split('.')[0],
        sticker: file.preview,
        status: file.status
      }));
      onUpload(stickerData);
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[820px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-medium">Upload Stickers</h2>
          <button
            aria-label='button'
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-6 mb-4 ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4">
              <img src="/pictureforpicture.png" alt="Upload placeholder" />
            </div>
            <p className="text-gray-600 mb-2">
              Drag and drop your files here or{" "}
              <button
                className="text-blue-600 hover:underline"
                onClick={() => inputRef.current?.click()}
              >
                browse
              </button>{" "}
              to upload
            </p>
            <p className="text-sm text-gray-500">
              Supports: PNG, JPG, JPEG, WEBP
            </p>
            <input
              aria-label='button'
              ref={inputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleChange}
              multiple
            />
          </div>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="space-y-4 mb-4">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-gray-100">
                    <img 
                      src={file.preview}
                      alt={file.file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{file.file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    aria-label='button'
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${file.progress}%` }}
                  />
                </div>

                {file.progress === 100 && (
                  <select
                    aria-label='button'
                    value={file.status}
                    onChange={(e) => handleStatusChange(index, e.target.value as 'Active' | 'Disable')}
                    className="mt-2 border rounded-lg px-3 py-1.5"
                  >
                    <option value="Active">Active</option>
                    <option value="Disable">Disable</option>
                  </select>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center">
          <button className="text-gray-500 hover:underline">
            Help Centre
          </button>
          <div className="space-x-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={uploadedFiles.length === 0 || !uploadedFiles.every(f => f.progress === 100)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}