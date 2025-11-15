-- Script to add username to existing profile
-- Replace 'your_user_id_here' with your actual user ID
-- Replace 'your_desired_username' with your desired username

-- First, check your current profile
SELECT id, user_id, username, display_name, bio, location 
FROM user_profiles 
WHERE user_id = 'your_user_id_here';

-- Update your profile with a username (replace the values below)
UPDATE user_profiles 
SET username = 'your_desired_username', 
    updated_at = CURRENT_TIMESTAMP
WHERE user_id = 'your_user_id_here';

-- Verify the update
SELECT id, user_id, username, display_name, bio, location 
FROM user_profiles 
WHERE user_id = 'your_user_id_here';