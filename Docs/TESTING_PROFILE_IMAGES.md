# Testing Profile Image Upload with Supabase Storage

## Prerequisites

✅ User service is running on port 8082
✅ Supabase bucket `profile-images` is created and set to **Public**

## Step 1: Create the Supabase Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/ymihlmgnwmmbjlyaxzii
2. Click **Storage** in the left sidebar
3. Click **New bucket**
4. Enter bucket name: `profile-images`
5. Toggle **Public bucket** to ON (important!)
6. Click **Create bucket**

## Step 2: Test Backend API Directly

### Create a User Profile

First, create a user profile to test with:

```bash
curl -X POST http://localhost:8082/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "displayName": "Test User",
    "bio": "Testing profile images",
    "visibility": "PUBLIC"
  }'
```

**Expected Response:**
```json
{
  "id": "some-uuid",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "displayName": "Test User",
  "bio": "Testing profile images",
  "visibility": "PUBLIC",
  "skills": [],
  "socialLinks": {},
  "createdAt": "2024-11-13T...",
  "updatedAt": "2024-11-13T..."
}
```

Save the `id` from the response - you'll need it for the next steps.

### Upload Profile Image (Backend Method)

```bash
# Replace {profile-id} with the actual profile ID from above
curl -X POST http://localhost:8082/api/v1/users/{profile-id}/avatar \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/image.jpg"
```

**Expected Response:**
```
https://ymihlmgnwmmbjlyaxzii.supabase.co/storage/v1/object/public/profile-images/uuid.jpg
```

### Update Profile with Image URL (Frontend Method)

Alternatively, upload directly to Supabase and update the profile:

```bash
# Replace {profile-id} with the actual profile ID
curl -X PUT http://localhost:8082/api/v1/users/{profile-id} \
  -H "Content-Type: application/json" \
  -d '{
    "profileImageUrl": "https://ymihlmgnwmmbjlyaxzii.supabase.co/storage/v1/object/public/profile-images/test.jpg"
  }'
```

### Verify the Profile

```bash
curl http://localhost:8082/api/v1/users/{profile-id}
```

You should see the `profileImageUrl` field populated.

## Step 3: Test Frontend Upload

### Setup Frontend Environment

1. Create `.env.local` in the Frontend directory:

```bash
cd Frontend
cp .env.example .env.local
```

2. Verify the contents:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8082/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://ymihlmgnwmmbjlyaxzii.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltaWhsbWdud21tYmpseWF4emlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMTYwNzIsImV4cCI6MjA3ODU5MjA3Mn0.VMx0dnqSisFUItjJEhvimxo-Fgq_Rw46O6TMcC0kpFU
```

### Start the Frontend

```bash
npm run dev
```

The frontend will start on http://localhost:3000

### Test the Upload Flow

1. **Navigate to Profile Page**
   - Go to: http://localhost:3000/profile/550e8400-e29b-41d4-a716-446655440000
   - (Use the userId from your created profile)

2. **Upload Image**
   - Click "Change Photo" button
   - Select an image file (JPEG, PNG, GIF, WebP)
   - Max size: 10MB
   - The image should upload and display immediately

3. **Verify in Supabase**
   - Go to Supabase Dashboard → Storage → profile-images
   - You should see your uploaded file with a UUID name

4. **Check the Public URL**
   - Click on the file in Supabase
   - Copy the public URL
   - Open it in a browser - the image should load

## Step 4: Test Direct Supabase Upload (Browser Console)

Open browser console on your frontend and run:

```javascript
// Test upload
const testUpload = async () => {
  const { storageService } = await import('/src/lib/supabase/storage.ts');
  
  // Create a test file input
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    console.log('Uploading:', file.name);
    
    try {
      const url = await storageService.uploadFile(file);
      console.log('Success! URL:', url);
      console.log('Open this URL:', url);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };
  
  input.click();
};

testUpload();
```

## Troubleshooting

### Error: "Failed to upload file: new row violates row-level security policy"

**Solution**: The bucket needs to be public or you need to set up RLS policies.

1. Go to Supabase Dashboard → Storage → profile-images
2. Click the three dots → Edit bucket
3. Toggle "Public bucket" to ON
4. Save

### Error: "Bucket not found"

**Solution**: Create the bucket in Supabase Dashboard.

### Error: "Only image files are allowed"

**Solution**: Make sure you're uploading an image file (JPEG, PNG, GIF, WebP).

### Error: "File size exceeds maximum limit"

**Solution**: Image must be under 10MB. Compress the image or choose a smaller one.

### Image uploads but doesn't display

**Solution**: 
1. Check the bucket is set to Public
2. Verify the URL format is correct
3. Check browser console for CORS errors

### Backend upload fails with connection error

**Solution**: 
1. Verify Supabase URL and key in application.yml
2. Check internet connection
3. Verify the bucket exists

## Verify Everything Works

Run this complete test:

```bash
# 1. Create profile
PROFILE_RESPONSE=$(curl -s -X POST http://localhost:8082/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "displayName": "Test User",
    "visibility": "PUBLIC"
  }')

PROFILE_ID=$(echo $PROFILE_RESPONSE | jq -r '.id')
echo "Profile ID: $PROFILE_ID"

# 2. Upload image (replace with your image path)
IMAGE_URL=$(curl -s -X POST http://localhost:8082/api/v1/users/$PROFILE_ID/avatar \
  -F "file=@test-image.jpg")

echo "Image URL: $IMAGE_URL"

# 3. Verify profile has image
curl -s http://localhost:8082/api/v1/users/$PROFILE_ID | jq '.profileImageUrl'
```

## Expected Results

✅ Profile created successfully
✅ Image uploaded to Supabase Storage
✅ Image URL saved in database
✅ Image accessible via public URL
✅ Image displays in frontend

## Next Steps

Once testing is complete:

1. **Set up proper authentication** - Currently using Spring Security defaults
2. **Add RLS policies** - For better security (see SUPABASE_STORAGE_SETUP.md)
3. **Implement image optimization** - Resize/compress before upload
4. **Add delete old image** - When uploading a new one
5. **Add loading states** - Better UX during upload

## Useful Commands

```bash
# Check if user-service is running
curl http://localhost:8082/actuator/health

# List all profiles
curl http://localhost:8082/api/v1/users/search

# Delete a profile
curl -X DELETE http://localhost:8082/api/v1/users/{profile-id}
```

## Supabase Dashboard Links

- **Storage**: https://supabase.com/dashboard/project/ymihlmgnwmmbjlyaxzii/storage/buckets
- **SQL Editor**: https://supabase.com/dashboard/project/ymihlmgnwmmbjlyaxzii/sql
- **API Settings**: https://supabase.com/dashboard/project/ymihlmgnwmmbjlyaxzii/settings/api
