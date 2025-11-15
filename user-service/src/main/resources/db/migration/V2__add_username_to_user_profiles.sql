-- Add username column to user_profiles table
ALTER TABLE user_profiles ADD COLUMN username VARCHAR(30);

-- Create unique index on username
CREATE UNIQUE INDEX idx_user_profiles_username ON user_profiles(username);

-- For existing users, generate temporary usernames from display_name
-- You'll need to manually update these to proper usernames
UPDATE user_profiles 
SET username = LOWER(REPLACE(REPLACE(display_name, ' ', '_'), '.', '_'))
WHERE username IS NULL;

-- Make username NOT NULL after populating
ALTER TABLE user_profiles ALTER COLUMN username SET NOT NULL;
