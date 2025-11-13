# How to Use the SkillSync UI

## ✅ What I Just Added

I've updated the dashboard with a complete UI that includes:

1. **Navigation Bar** - Access all features from any page
2. **Dashboard Cards** - Quick access to profile and search
3. **Quick Actions** - One-click buttons for common tasks
4. **Consistent Navigation** - Same menu on all pages

## 🎯 How to Access Features

### From the Dashboard (http://localhost:3000/dashboard)

You'll now see:

1. **My Profile Card** - Click to view/edit your profile
2. **Discover Developers Card** - Click to search for developers
3. **Account Info Card** - Shows your user details
4. **Quick Actions Buttons**:
   - Edit Profile
   - Add Skills
   - Upload Photo
   - Find Developers

### Navigation Menu (Top of every page)

- **Dashboard** - Return to main dashboard
- **My Profile** - View/edit your profile
- **Discover** - Search for developers

## 📋 Step-by-Step: Create Your Profile

Since you just logged in, you need to create your profile first:

### Option 1: Using the UI (Recommended)

1. **Click "My Profile"** in the navigation menu
2. You'll see "Profile not found" - this is normal for new users
3. We need to create your profile first using the API

### Option 2: Create Profile via API

Run this command (replace the email with yours):

```powershell
# Get your user ID from the dashboard (it's shown in the Account Info card)
# Then run:

$userId = "5c84baca-90d7-4428-a0fa-cf066a01b4da"  # Your User ID from dashboard

curl -X POST http://localhost:8082/api/v1/users `
  -H "Content-Type: application/json" `
  -d "{`"userId`":`"$userId`",`"displayName`":`"Your Name`",`"visibility`":`"PUBLIC`"}"
```

Or use the PowerShell test script:

```powershell
.\test-profile-upload.ps1
```

## 🚀 Complete Workflow

### 1. Create Your Profile (First Time Only)

```bash
# Use your actual User ID from the dashboard
curl -X POST http://localhost:8082/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"userId":"YOUR-USER-ID","displayName":"Your Name","bio":"Your bio","visibility":"PUBLIC"}'
```

### 2. Access Your Profile

1. Click **"My Profile"** in the navigation
2. You should now see your profile page
3. Click **"Edit Profile"** to update your information

### 3. Upload Profile Picture

1. On your profile page, click **"Change Photo"**
2. Select an image (max 10MB)
3. Image uploads directly to Supabase
4. Displays immediately

### 4. Add Skills

1. On your profile page, click **"Add Skill"**
2. Enter skill name (e.g., "React", "Java")
3. Select proficiency level
4. Enter years of experience
5. Click **"Add Skill"**

### 5. Search for Developers

1. Click **"Discover"** in the navigation
2. Use filters:
   - Search by name/bio
   - Filter by skills
   - Filter by location
   - Filter by proficiency level
3. Click **"Search"**
4. Click on any profile card to view details

## 🎨 What You'll See

### Dashboard
- Welcome message
- 3 feature cards (Profile, Discover, Account Info)
- 4 quick action buttons
- Navigation bar at top

### Profile Page
- Profile picture (with upload button if it's your profile)
- Display name, location, bio, website
- Social links (GitHub, LinkedIn, Twitter)
- Skills section with all your skills
- Edit buttons (only on your own profile)

### Search Page
- Search filters sidebar
- Grid of developer profile cards
- Pagination controls
- Result count

## 🔧 Troubleshooting

### "Profile not found" error

**Solution**: You need to create a profile first. Use the API command above or the test script.

### Can't see "Edit Profile" button

**Solution**: You can only edit your own profile. Make sure you're viewing your profile (User ID matches).

### Image upload fails

**Solution**: 
1. Make sure the Supabase bucket `profile-images` exists
2. Make sure it's set to **Public**
3. Check the browser console for errors

### Navigation links don't work

**Solution**: Make sure the frontend is running on http://localhost:3000

## 📱 Quick Reference

| Feature | URL | Description |
|---------|-----|-------------|
| Dashboard | `/dashboard` | Main dashboard with quick actions |
| My Profile | `/profile/{your-user-id}` | View/edit your profile |
| Search | `/search` | Find other developers |
| Any Profile | `/profile/{user-id}` | View any user's profile |

## 🎯 Next Steps

1. ✅ Refresh your dashboard page (http://localhost:3000/dashboard)
2. ✅ Create your profile using the API
3. ✅ Click "My Profile" to view it
4. ✅ Upload a profile picture
5. ✅ Add your skills
6. ✅ Search for other developers

The UI is now fully functional! Just refresh your browser to see the new dashboard.
