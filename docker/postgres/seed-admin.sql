-- Seed Data Script for SkillSync
-- Creates a default admin user

-- Insert default admin user (password: admin123)
-- Password hash is bcrypt hash of "admin123"
INSERT INTO users (id, email, password_hash, is_active, created_at)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'admin@skillsync.com',
    '$2a$10$rN7VcMKz/mYhYQMQXL5zHOxN7VxZ8fQQxQxQxQxQxQxQxQxQxQxQx',
    true,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

-- Grant admin role to default admin user
INSERT INTO user_roles (user_id, role)
VALUES ('a0000000-0000-0000-0000-000000000001', 'ROLE_USER')
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role)
VALUES ('a0000000-0000-0000-0000-000000000001', 'ROLE_ADMIN')
ON CONFLICT DO NOTHING;

-- Create user profile for admin
INSERT INTO user_profiles (id, user_id, username, display_name, visibility, created_at, updated_at)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'admin',
    'System Administrator',
    'PUBLIC',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (user_id) DO NOTHING;
