# Supabase Storage Setup for Profile Images

This document explains how profile images are stored using Supabase Storage.

## Overview

Profile images are stored in Supabase Storage instead of the local filesystem, providing:
- **Scalability**: Cloud-based storage that scales automatically
- **CDN**: Fast global content delivery
- **Reliability**: Built-in redundancy and backups
- **Security**: Fine-grained access control

## Configuration

### Supabase Project Details

- **Project URL**: `https://ymihlmgnwmmbjlyaxzii.supabase.co`
- **Bucket Name**: `profile-images`

### Backend Configuration (Java/Spring Boot)

The backend is configured in `user-service/src/main/resources/application.yml`:

```yaml
supabase:
  url: ${SUPABASE_URL:https://ymihlmgnwmmbjlyaxzii.supabase.co}
  key: ${SUPABASE_KEY:your-anon-key}
  storage:
    bucket: profile-images
```

Environment variables:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase anon/public key

### Frontend Configuration (Next.js)

The frontend is configured via environment variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ymihlmgnwmmbjlyaxzii.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=your-anon-key
```

## Supabase Storage Bucket Setup

### 1. Create the Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Name it `profile-images`
5. Make it **Public** (so profile images are accessible)
6. Click **Create bucket**

### 2. Set Bucket Policies

To allow authenticated users to upload and manage their profile images:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-images');

-- Allow public read access
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-images');

-- Allow users to update their own files
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-images');

-- Allow users to delete their own files
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-images');
```

### 3. Configure CORS (if needed)

If you're uploading from a different domain, configure CORS in Supabase:

1. Go to **Settings** > **API**
2. Add your frontend domain to the allowed origins

## How It Works

### Upload Flow

1. **Frontend**: User selects an image file
2. **Frontend**: File is validated (type, size)
3. **Frontend**: File is uploaded directly to Supabase Storage
4. **Frontend**: Public URL is returned
5. **Frontend**: URL is sent to backend API
6. **Backend**: URL is saved in the `user_profiles` table

### File Naming

Files are named using UUIDs to prevent conflicts:
```
{uuid}.{extension}
```

Example: `550e8400-e29b-41d4-a716-446655440000.jpg`

### Public URLs

Uploaded files are accessible via public URLs:
```
https://ymihlmgnwmmbjlyaxzii.supabase.co/storage/v1/object/public/profile-images/{filename}
```

## File Validation

Both frontend and backend validate uploaded files:

- **File type**: Must be an image (image/*)
- **File size**: Maximum 10MB
- **Supported formats**: JPEG, PNG, GIF, WebP, etc.

## API Endpoints

### Upload Profile Image (Backend)

**Endpoint**: `POST /api/v1/users/{profileId}/avatar`

**Request**: Multipart form data with `file` field

**Response**: Public URL of the uploaded image

### Update Profile with Image URL

**Endpoint**: `PUT /api/v1/users/{profileId}`

**Request Body**:
```json
{
  "profileImageUrl": "https://ymihlmgnwmmbjlyaxzii.supabase.co/storage/v1/object/public/profile-images/..."
}
```

## Frontend Usage

### Upload Component

```typescript
import { storageService } from '@/lib/supabase/storage'

// Upload file
const imageUrl = await storageService.uploadFile(file)

// Update profile
await userService.updateProfile(profileId, { profileImageUrl: imageUrl })
```

### Delete Old Image

```typescript
// Delete old image before uploading new one
if (oldImageUrl) {
  await storageService.deleteFile(oldImageUrl)
}
```

## Security Considerations

1. **Anon Key**: The anon key is safe to expose in frontend code
2. **RLS Policies**: Use Row Level Security policies to control access
3. **File Size Limits**: Enforced at both frontend and backend
4. **File Type Validation**: Only images are allowed
5. **Rate Limiting**: Consider implementing rate limits for uploads

## Troubleshooting

### Upload Fails with 403 Error

- Check that the bucket exists and is public
- Verify the anon key is correct
- Check RLS policies allow uploads

### Images Not Loading

- Verify the bucket is set to public
- Check the public URL format is correct
- Ensure CORS is configured if needed

### File Size Errors

- Default limit is 10MB
- Can be increased in Supabase dashboard under Storage settings

## Migration from Local Storage

If you have existing images in local storage:

1. Upload them to Supabase Storage
2. Update the `profileImageUrl` in the database
3. Delete local files

Example migration script can be created if needed.

## Cost Considerations

Supabase Storage pricing (as of 2024):
- **Free tier**: 1GB storage, 2GB bandwidth
- **Pro tier**: 100GB storage, 200GB bandwidth
- Additional storage: $0.021/GB/month
- Additional bandwidth: $0.09/GB

For a typical user profile image (500KB), the free tier supports:
- ~2,000 images stored
- ~4,000 image downloads per month

## Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Storage API Reference](https://supabase.com/docs/reference/javascript/storage)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
