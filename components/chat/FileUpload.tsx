'use client'

import React, { useRef, useState } from 'react'
import { Paperclip, X, Loader2, Image as ImageIcon, File } from 'lucide-react'
import { formatFileSize, isImageFile } from '@/lib/chat-utils'

interface FileUploadProps {
  onFilesSelected: (files: Array<{ name: string; type: string; size: number; url: string }>) => void
  maxSize?: number // in bytes
  maxFiles?: number
}

export default function FileUpload({ onFilesSelected, maxSize = 10 * 1024 * 1024, maxFiles = 5 }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; type: string; size: number; url: string }>>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files).slice(0, maxFiles - uploadedFiles.length)
    
    // Validate files
    for (const file of fileArray) {
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is ${formatFileSize(maxSize)}`)
        return
      }
    }

    setIsUploading(true)

    try {
      const uploadPromises = fileArray.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/chat/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`)
        }

        const data = await response.json()
        return data.file
      })

      const uploaded = await Promise.all(uploadPromises)
      const newFiles = [...uploadedFiles, ...uploaded]
      setUploadedFiles(newFiles)
      onFilesSelected(newFiles)
    } catch (error: any) {
      console.error('Error uploading files:', error)
      alert(error.message || 'Failed to upload files')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    setUploadedFiles(newFiles)
    onFilesSelected(newFiles)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading || uploadedFiles.length >= maxFiles}
        className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-900/50 rounded-lg transition-all disabled:opacity-50"
      >
        {isUploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Paperclip className="w-4 h-4" />
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
      />

      {uploadedFiles.length > 0 && (
        <div className="absolute bottom-full left-0 mb-2 p-2 bg-[#1a1a1a] border border-gray-800/50 rounded-lg shadow-xl min-w-[200px]">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center gap-2 mb-2 last:mb-0">
              {isImageFile(file.name) ? (
                <ImageIcon className="w-4 h-4 text-primary-400 flex-shrink-0" />
              ) : (
                <File className="w-4 h-4 text-gray-400 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-300 truncate">{file.name}</div>
                <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-1 text-gray-500 hover:text-red-400 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {dragActive && (
        <div
          className="fixed inset-0 z-50 bg-primary-500/10 border-2 border-dashed border-primary-500/50 flex items-center justify-center"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <Paperclip className="w-12 h-12 text-primary-400 mx-auto mb-2" />
            <p className="text-white font-semibold">Drop files here to upload</p>
          </div>
        </div>
      )}
    </div>
  )
}

