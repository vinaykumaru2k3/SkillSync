import { supabase, STORAGE_BUCKET } from './client'

export const storageService = {
  /**
   * Upload a file to Supabase Storage
   * @param file - The file to upload
   * @param path - Optional path within the bucket (defaults to UUID)
   * @returns The public URL of the uploaded file
   */
  async uploadFile(file: File, path?: string): Promise<string> {
    const fileName = path || `${crypto.randomUUID()}${this.getFileExtension(file.name)}`

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path)

    return urlData.publicUrl
  },

  /**
   * Delete a file from Supabase Storage
   * @param fileUrl - The public URL of the file to delete
   */
  async deleteFile(fileUrl: string): Promise<void> {
    const filePath = this.extractFilePathFromUrl(fileUrl)
    
    if (!filePath) {
      throw new Error('Invalid file URL')
    }

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath])

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`)
    }
  },

  /**
   * Get the public URL for a file
   * @param path - The path to the file in the bucket
   * @returns The public URL
   */
  getPublicUrl(path: string): string {
    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(path)

    return data.publicUrl
  },

  /**
   * Extract file path from a Supabase Storage URL
   */
  extractFilePathFromUrl(fileUrl: string): string | null {
    const bucketPath = `/storage/v1/object/public/${STORAGE_BUCKET}/`
    
    if (!fileUrl.includes(bucketPath)) {
      return null
    }

    const parts = fileUrl.split(bucketPath)
    return parts.length > 1 ? parts[1] : null
  },

  /**
   * Get file extension from filename
   */
  getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.')
    return lastDotIndex === -1 ? '' : filename.substring(lastDotIndex)
  },

  /**
   * Validate file before upload
   */
  validateFile(file: File): void {
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed')
    }

    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      throw new Error('File size must be less than 10MB')
    }
  },
}
