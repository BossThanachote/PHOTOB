import React, { useState, useRef, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { StatusType, Frame } from '@/types/types'
import { frameService } from '../services/frameService'

interface UploadedFile {
  file: File
  preview: string
  progress: number
  status: StatusType
  shot: number
  uploading: boolean
}

interface UploadFrameModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (frames: Frame[]) => Promise<void>
  isLoading: boolean
}

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']

export default function UploadFrameModal({ isOpen, onClose, onUpload, isLoading }: UploadFrameModalProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) {
      resetModal()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isLoading && isUploading) {
      setIsUploading(false)
      handleClose()
    }
  }, [isLoading])

  const resetModal = () => {
    setDragActive(false)
    setUploadedFiles([])
    setIsUploading(false)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleClose = () => {
    if (!isUploading && !isLoading) {
      resetModal()
      onClose()
    }
  }

  const validateFile = (file: File): boolean => {
    return ALLOWED_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE
  }

  const processFiles = async (files: FileList) => {
    const newFiles: UploadedFile[] = []

    for (const file of Array.from(files)) {
      if (validateFile(file)) {
        newFiles.push({
          file,
          preview: URL.createObjectURL(file),
          progress: 0,
          status: 'Active',
          shot: 3,
          uploading: false
        })
      }
    }

    setUploadedFiles(prev => [...prev, ...newFiles])
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === "dragenter" || e.type === "dragover")
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    processFiles(e.dataTransfer.files)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files) {
      processFiles(e.target.files)
    }
  }

  const handleStatusChange = (index: number, status: StatusType) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev]
      if (newFiles[index]) {
        newFiles[index].status = status
      }
      return newFiles
    })
  }

  const handleShotChange = (index: number, shot: number) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev]
      if (newFiles[index]) {
        newFiles[index].shot = shot
      }
      return newFiles
    })
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index)
      prev[index]?.preview && URL.revokeObjectURL(prev[index].preview)
      return newFiles
    })
  }

  const updateFileProgress = (index: number, progress: number) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev]
      if (newFiles[index]) {
        newFiles[index].progress = progress
        newFiles[index].uploading = progress < 100
      }
      return newFiles
    })
  }

  const handleSubmit = async () => {
    if (isUploading || isLoading || uploadedFiles.length === 0) return

    try {
      setIsUploading(true)
      
      const uploadPromises = uploadedFiles.map(async (file, index) => {
        try {
          updateFileProgress(index, 20)
          
          const result = await frameService.createFrame({
            frameName: `${file.shot} Cut - ${file.file.name.split('.')[0]}`,
            status: file.status,
            frame: file.file,
            shot: file.shot
          })

          updateFileProgress(index, 100)
          return result
        } catch (error) {
          console.log('Upload warning:', error)
          updateFileProgress(index, 100)
          return null
        }
      })

      const results = (await Promise.all(uploadPromises)).filter((result): result is Frame => result !== null)
      await onUpload(results)

      resetModal()
      onClose()
    } catch (error) {
      console.error('Upload process warning:', error)
    } finally {
      setIsUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[820px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-medium">Upload Frames</h2>
          <button
            aria-label='button'
            type="button"
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            disabled={isUploading}
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
              <img src="/pictureforpicture.png" alt="Upload placeholder" className="w-full h-full object-contain" />
            </div>
            <p className="text-gray-600 mb-2">
              Drag and drop your files here or{" "}
              <button
                type="button"
                className="text-blue-600 hover:underline disabled:opacity-50"
                onClick={() => inputRef.current?.click()}
                disabled={isUploading}
              >
                browse
              </button>{" "}
              to upload
            </p>
            <p className="text-sm text-gray-500">
              Supports: PNG, JPG, JPEG, WEBP (Max: 5MB)
            </p>
            <input
              aria-label='button'
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".png,.jpg,.jpeg,.webp"
              onChange={handleChange}
              multiple
              disabled={isUploading}
            />
          </div>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="space-y-4 mb-4">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={file.preview}
                      alt={file.file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium truncate">{file.file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    aria-label='button'
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-600 disabled:opacity-50"
                    disabled={isUploading}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                  <div 
                    className="h-1.5 rounded-full transition-all duration-300 bg-blue-600"
                    style={{ width: `${file.progress}%` }}
                  />
                </div>

                <div className="flex gap-4">
                  <select
                    aria-label='button'
                    value={file.status}
                    onChange={(e) => handleStatusChange(index, e.target.value as StatusType)}
                    className="mt-2 border rounded-lg px-3 py-1.5 disabled:opacity-50"
                    disabled={isUploading}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Declined">Declined</option>
                  </select>

                  <select
                    aria-label='button'
                    value={file.shot}
                    onChange={(e) => handleShotChange(index, Number(e.target.value))}
                    className="mt-2 border rounded-lg px-3 py-1.5 disabled:opacity-50"
                    disabled={isUploading}
                  >
                    <option value={3}>3 Shots</option>
                    <option value={6}>6 Shots</option>
                    <option value={8}>8 Shots</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center">
          <button 
            type="button"
            className="text-gray-500 hover:underline disabled:opacity-50"
            disabled={isUploading}
          >
            Help Centre
          </button>
          <div className="space-x-2 flex">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isUploading || uploadedFiles.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}