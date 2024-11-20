import React, { useState, useRef, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { StatusType, Sticker } from '@/types/types'
import { stickerService } from '../services/stickerService'
import { getAuthToken } from '../utils/auth'

interface UploadedFile {
  file: File
  preview: string
  progress: number
  status: StatusType
  error?: string
  uploading: boolean
}

interface UploadStickerModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (stickers: Sticker[]) => Promise<void>
  isLoading: boolean
}

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']

export default function UploadStickerModal({ isOpen, onClose, onUpload, isLoading }: UploadStickerModalProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
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
    setUploadError(null)
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

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Invalid file type. Only PNG, JPG, JPEG, and WEBP are allowed.'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds 5MB limit.'
    }
    return null
  }

  const processFiles = async (files: FileList) => {
    const newFiles: UploadedFile[] = []

    for (const file of Array.from(files)) {
      const error = validateFile(file)
      if (error) {
        newFiles.push({
          file,
          preview: URL.createObjectURL(file),
          progress: 0,
          status: 'Declined',
          error,
          uploading: false
        })
        continue
      }

      newFiles.push({
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: 'Active',
        uploading: false
      })
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

  const setFileError = (index: number, error: string) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev]
      if (newFiles[index]) {
        newFiles[index].error = error
        newFiles[index].status = 'Declined'
        newFiles[index].uploading = false
      }
      return newFiles
    })
  }

  const handleSubmit = async () => {
    if (isUploading || isLoading || uploadedFiles.length === 0) return

    setIsUploading(true)
    setUploadError(null)
    
    try {
      const uploadPromises = uploadedFiles
        .filter(file => !file.error)
        .map(async (file, index) => {
          try {
            updateFileProgress(index, 20)
            
            const result = await stickerService.createSticker({
              stickerName: file.file.name.split('.')[0],
              status: file.status,
              sticker: file.file
            })

            updateFileProgress(index, 100)
            return result
          } catch (error) {
            setFileError(index, error instanceof Error ? error.message : 'Upload failed')
            return null
          }
        })

      const results = (await Promise.all(uploadPromises)).filter((result): result is Sticker => result !== null)

      if (results.length > 0) {
        await onUpload(results)
      } else {
        setUploadError('No files were uploaded successfully')
        setIsUploading(false)
      }
    } catch (error) {
      console.error('Error during upload:', error)
      setUploadError(error instanceof Error ? error.message : 'Failed to upload files')
      setIsUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[820px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-medium">Upload Stickers</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            disabled={isUploading || isLoading}
          >
            <X size={20} />
          </button>
        </div>

        {uploadError && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {uploadError}
          </div>
        )}

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
                disabled={isUploading || isLoading}
              >
                browse
              </button>{" "}
              to upload
            </p>
            <p className="text-sm text-gray-500">
              Supports: PNG, JPG, JPEG, WEBP (Max: 5MB)
            </p>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".png,.jpg,.jpeg,.webp"
              onChange={handleChange}
              multiple
              disabled={isUploading || isLoading}
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
                    {file.error && (
                      <p className="text-xs text-red-500 mt-1">{file.error}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-600 disabled:opacity-50"
                    disabled={isUploading || isLoading}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      file.error ? 'bg-red-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${file.progress}%` }}
                  />
                </div>

                {!file.error && (
                  <select
                    value={file.status}
                    onChange={(e) => handleStatusChange(index, e.target.value as StatusType)}
                    className="mt-2 border rounded-lg px-3 py-1.5 disabled:opacity-50"
                    disabled={isUploading || isLoading}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Declined">Declined</option>
                  </select>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center">
          <button 
            type="button"
            className="text-gray-500 hover:underline disabled:opacity-50"
            disabled={isUploading || isLoading}
          >
            Help Centre
          </button>
          <div className="space-x-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              disabled={isUploading || isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isUploading || isLoading || uploadedFiles.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {(isUploading || isLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
              {isUploading || isLoading ? 'Uploading...' : 'Done'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

