# Quick Start Guide - Profile Image Upload

## ✅ User Service is Running

The user-service is now running on **http://localhost:8082**

## 🚀 How to Test Profile Image Upload

### Option 1: Automated Test Script (Easiest)

```powershell
# Run the test script
.\test-profile-upload.ps1

# Or with an image
.\test-profile-upload.ps1 -ImagePath "C:\path\to\your\image.jpg"
```

This will:
- Create a test profile
- Upload an image (if provided)
- Display the results
- Give you URLs to test in browser

### Option 2: Manual API Testing

#### 1. Create a Profile

```bash
curl -X POST http://localhost:8082/api/v1/users \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"550e8400-e29b-41d4-a716-446655440000\",\"displayName\":\"Test User\",\"visibility\":\"PUBLIC\"}"
```

Save the `id` from the response.

#### 2. Upload an Image

```bash
curl -X POST http://localhost:8082/api/v1/users/{profile-id}/avatar \
  -F "file=@image.jpg"
```

#### 3. View the Profile

```bash
curl http://localhost:8082/api/v1/users/{profile-id}
```

### Option 3: Frontend Testing

1. **Start the frontend:**
   ```bash
   cd Frontend
   npm run dev
   ```

2. **Create `.env.local`:**
   ```bash
   cp .env.example .env.local
   ```

3. **Open in browser:**
   - Go to: http://localhost:3000/profile/{user-id}
   - Click "Change Photo"
   - Upload an image

## ⚠️ Important: Create Supabase Bucket First!

Before testing, you MUST create the storage bucket:

1. Go to: https://supabase.com/dashboard/project/ymihlmgnwmmbjlyaxzii/storage/buckets
2. Click **"New bucket"**
3. Name: `profile-images`
4. Toggle **"Public bucket"** to ON ✅
5. Click **"Create bucket"**

## 📋 What's Working

✅ User service running on port 8082
✅ Profile CRUD operations
✅ Skill card management
✅ User search with filters
✅ Supabase Storage integration
✅ Image upload (backend & frontend)
✅ Profile visibility controls

## 🔍 Useful Endpoints

- **Health Check**: http://localhost:8082/actuator/health
- **Create Profile**: POST http://localhost:8082/api/v1/users
- **Get Profile**: GET http://localhost:8082/api/v1/users/{id}
- **Update Profile**: PUT http://localhost:8082/api/v1/users/{id}
- **Upload Avatar**: POST http://localhost:8082/api/v1/users/{id}/avatar
- **Search Users**: GET http://localhost:8082/api/v1/users/search?query=test

## 📚 Documentation

- **Full Testing Guide**: `docs/TESTING_PROFILE_IMAGES.md`
- **Supabase Setup**: `docs/SUPABASE_STORAGE_SETUP.md`
- **API Documentation**: Check the controllers in `user-service/src/main/java/com/skillsync/user/controller/`

## 🐛 Troubleshooting

### "Bucket not found" error
→ Create the `profile-images` bucket in Supabase (see above)

### "403 Forbidden" error
→ Make sure the bucket is set to **Public**

### Image uploads but doesn't display
→ Check the bucket is public and the URL is correct

### Service won't start
→ Make sure PostgreSQL is running on localhost:5432

## 🎯 Next Steps

1. ✅ Create the Supabase bucket
2. ✅ Run the test script
3. ✅ Test via frontend
4. Set up authentication (currently using default Spring Security)
5. Add RLS policies for better security
6. Implement image optimization

## 📞 Need Help?

Check the detailed guides in the `docs/` folder or review the implementation in:
- Backend: `user-service/src/main/java/com/skillsync/user/`
- Frontend: `Frontend/src/components/features/profile/`
