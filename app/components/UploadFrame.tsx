// components/UploadFrameModal.tsx
import React, { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'

interface UploadFrameModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (frameData: { frame: string; status: 'Active' | 'Disable'; shot: number }) => void
}

export default function UploadFrameModal({ isOpen, onClose, onUpload }: UploadFrameModalProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [status, setStatus] = useState<'Active' | 'Disable'>('Active')
  const [shot, setShot] = useState(3)
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetModal()
    }
  }, [isOpen])

  // Function to reset all states
  const resetModal = () => {
    setDragActive(false)
    setUploadedFile(null)
    setUploadProgress(0)
    setStatus('Active')
    setShot(3)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  // Handle closing with reset
  const handleClose = () => {
    resetModal()
    onClose()
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files?.length) {
      processFile(files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    const files = e.target.files
    if (files?.length) {
      processFile(files[0])
    }
  }

  const processFile = (file: File) => {
    setUploadedFile(file)
    // Simulate upload progress
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const handleSubmit = () => {
    if (uploadedFile && uploadProgress === 100) {
      const fileUrl = URL.createObjectURL(uploadedFile)
      onUpload({
        frame: fileUrl,
        status,
        shot
      })
      resetModal()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[820px] h-[740px]">
        <div className="flex justify-end items-center mb-4">
          <button
            aria-label='button' 
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
          <h2 className="text-2xl font-medium">Upload Frame</h2>
        </div>
        <h3 className='text-[#8E8E93]'>Drag or drop your file here</h3>
        <div
          className={`border-2 border-dashed rounded-lg p-6 h-[15rem] flex flex-col justify-center text-center ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {!uploadedFile ? (
            <>
              <div className="w-16 h-16 bg-[transparent] rounded-lg mx-auto mb-4 flex items-center justify-center">
                <img src="/pictureforpicture.png" alt="Upload placeholder" />
              </div>
              <p className="text-gray-600 mb-2">
                Drag and drop your file here or{" "}
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
              />
            </>
          ) : (
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-100">
                  <img 
                    src={URL.createObjectURL(uploadedFile)} 
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-left text-sm mb-1">{uploadedFile.name}</p>
                  <p className="text-left text-xs text-gray-500">
                    {(uploadedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                {uploadProgress === 100 && (
                  <button
                    aria-label='button'
                    onClick={() => setUploadedFile(null)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              
              {uploadProgress === 100 ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      aria-label='button'
                      value={status}
                      onChange={(e) => setStatus(e.target.value as 'Active' | 'Disable')}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="Active">Active</option>
                      <option value="Disable">Disable</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Shot</label>
                    <select
                      aria-label='button'
                      value={shot}
                      onChange={(e) => setShot(Number(e.target.value))}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value={3}>3</option>
                      <option value={6}>6</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between mt-4">
          <button
            className="text-gray-500 hover:underline"
          >
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
              disabled={!uploadedFile || uploadProgress < 100}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}