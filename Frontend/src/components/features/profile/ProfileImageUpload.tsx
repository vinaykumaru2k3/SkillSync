'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/common/Button'
import { storageService } from '@/lib/supabase/storage'
import { ImageCropper } from './ImageCropper'

interface ProfileImageUploadProps {
  currentImageUrl?: string
  onUpload: (imageUrl: string) => Promise<void>
}

export function ProfileImageUpload({ currentImageUrl, onUpload }: ProfileImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null)
  const [uploading, setUploading] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      // Validate file
      storageService.validateFile(file)

      // Create preview for cropping
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageToCrop(reader.result as string)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Invalid file')
    }
  }

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    setImageToCrop(null)
    setUploading(true)

    try {
      // Delete old image if it exists
      if (currentImageUrl) {
        try {
          await storageService.deleteFile(currentImageUrl)
        } catch (error) {
          console.warn('Failed to delete old image:', error)
          // Continue with upload even if delete fails
        }
      }

      // Convert blob to file
      const croppedFile = new File([croppedImageBlob], 'profile.jpg', { type: 'image/jpeg' })
      
      // Create preview
      const previewUrl = URL.createObjectURL(croppedImageBlob)
      setPreview(previewUrl)

      // Upload to Supabase Storage
      const imageUrl = await storageService.uploadFile(croppedFile)
      
      // Update profile with new image URL
      await onUpload(imageUrl)
    } catch (error) {
      console.error('Upload failed:', error)
      alert(error instanceof Error ? error.message : 'Failed to upload image. Please try again.')
      setPreview(currentImageUrl || null)
    } finally {
      setUploading(false)
    }
  }

  const handleCropCancel = () => {
    setImageToCrop(null)
  }

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
          {preview ? (
            <img
              src={preview}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-center text-white">
                <div className="text-sm">Uploading...</div>
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Change Photo'}
        </Button>
      </div>

      {/* Image Cropper Modal */}
      {imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </>
  )
}
