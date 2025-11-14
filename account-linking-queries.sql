-- ============================================
-- Account Linking SQL Queries
-- ============================================

-- 1. Find users with multiple authentication methods
SELECT 
    u.id,
    u.email,
    CASE WHEN u.password_hash IS NOT NULL THEN 'Yes' ELSE 'No' END as has_password,
    COUNT(uop.provider) as oauth_provider_count,
    STRING_AGG(uop.provider, ', ') as oauth_providers
FROM users u
LEFT JOIN user_oauth_providers uop ON u.id = uop.user_id
GROUP BY u.id, u.email, u.password_hash
HAVING (u.password_hash IS NOT NULL AND COUNT(uop.provider) > 0)
    OR COUNT(uop.provider) > 1
ORDER BY oauth_provider_count DESC, u.email;

-- 2. Find users with only OAuth (no password)
SELECT 
    u.id,
    u.email,
    STRING_AGG(uop.provider, ', ') as oauth_providers,
    u.created_at
FROM users u
INNER JOIN user_oauth_providers uop ON u.id = uop.user_id
WHERE u.password_hash IS NULL
GROUP BY u.id, u.email, u.created_at
ORDER BY u.created_at DESC;

-- 3. Find users with only password (no OAuth)
SELECT 
    u.id,
    u.email,
    u.created_at,
    u.last_login_at
FROM users u
LEFT JOIN user_oauth_providers uop ON u.id = uop.user_id
WHERE u.password_hash IS NOT NULL
    AND uop.provider IS NULL
ORDER BY u.created_at DESC;

-- 4. Count authentication methods distribution
SELECT 
    CASE 
        WHEN u.password_hash IS NOT NULL AND oauth_count > 0 THEN 'Password + OAuth'
        WHEN u.password_hash IS NOT NULL AND oauth_count = 0 THEN 'Password Only'
        WHEN u.password_hash IS NULL AND oauth_count > 0 THEN 'OAuth Only'
        ELSE 'No Auth (Error)'
    END as auth_type,
    COUNT(*) as user_count
FROM users u
LEFT JOIN (
    SELECT user_id, COUNT(*) as oauth_count
    FROM user_oauth_providers
    GROUP BY user_id
) oauth ON u.id = oauth.user_id
GROUP BY auth_type
ORDER BY user_count DESC;

-- 5. Find potential duplicate accounts (same email pattern)
-- Useful for finding accounts created before linking was implemented
SELECT 
    LOWER(TRIM(email)) as normalized_email,
    COUNT(*) as account_count,
    STRING_AGG(id::text, ', ') as user_ids,
    STRING_AGG(
        CASE 
            WHEN password_hash IS NOT NULL THEN 'password' 
            ELSE 'oauth' 
        END, 
        ', '
    ) as auth_methods
FROM users
GROUP BY LOWER(TRIM(email))
HAVING COUNT(*) > 1;

-- 6. Check specific user's authentication methods
-- Replace 'user@example.com' with actual email
SELECT 
    u.id,
    u.email,
    CASE WHEN u.password_hash IS NOT NULL THEN 'Yes' ELSE 'No' END as has_password,
    COALESCE(STRING_AGG(uop.provider, ', '), 'None') as oauth_providers,
    u.is_active,
    u.created_at,
    u.last_login_at
FROM users u
LEFT JOIN user_oauth_providers uop ON u.id = uop.user_id
WHERE u.email = 'user@example.com'
GROUP BY u.id, u.email, u.password_hash, u.is_active, u.created_at, u.last_login_at;

-- 7. Find users who recently linked OAuth to existing password account
-- (Assumes you have audit logging or can check updated_at)
SELECT 
    u.id,
    u.email,
    u.password_hash IS NOT NULL as has_password,
    STRING_AGG(uop.provider, ', ') as oauth_providers,
    u.updated_at,
    u.created_at,
    EXTRACT(DAY FROM u.updated_at - u.created_at) as days_until_oauth_linked
FROM users u
INNER JOIN user_oauth_providers uop ON u.id = uop.user_id
WHERE u.password_hash IS NOT NULL
    AND u.updated_at > u.created_at + INTERVAL '1 day'
GROUP BY u.id, u.email, u.password_hash, u.updated_at, u.created_at
ORDER BY u.updated_at DESC
LIMIT 50;

-- 8. OAuth provider popularity
SELECT 
    provider,
    COUNT(DISTINCT user_id) as user_count,
    ROUND(COUNT(DISTINCT user_id) * 100.0 / (SELECT COUNT(*) FROM users), 2) as percentage
FROM user_oauth_providers
GROUP BY provider
ORDER BY user_count DESC;

-- 9. Find inactive users with only OAuth (potential security risk)
SELECT 
    u.id,
    u.email,
    STRING_AGG(uop.provider, ', ') as oauth_providers,
    u.last_login_at,
    EXTRACT(DAY FROM NOW() - u.last_login_at) as days_since_login
FROM users u
INNER JOIN user_oauth_providers uop ON u.id = uop.user_id
WHERE u.password_hash IS NULL
    AND u.last_login_at < NOW() - INTERVAL '90 days'
GROUP BY u.id, u.email, u.last_login_at
ORDER BY u.last_login_at ASC;

-- 10. Manually link OAuth provider to existing user
-- Use this if you need to manually fix account linking issues
-- Replace values with actual user_id and provider
DO $$
DECLARE
    target_user_id UUID := 'your-user-id-here';
    oauth_provider VARCHAR := 'github';
BEGIN
    -- Check if user exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = target_user_id) THEN
        RAISE EXCEPTION 'User not found: %', target_user_id;
    END IF;
    
    -- Check if provider already linked
    IF EXISTS (
        SELECT 1 FROM user_oauth_providers 
        WHERE user_id = target_user_id AND provider = oauth_provider
    ) THEN
        RAISE NOTICE 'Provider % already linked to user %', oauth_provider, target_user_id;
    ELSE
        -- Link provider
        INSERT INTO user_oauth_providers (user_id, provider)
        VALUES (target_user_id, oauth_provider);
        
        RAISE NOTICE 'Successfully linked % to user %', oauth_provider, target_user_id;
    END IF;
END $$;

-- 11. Manually unlink OAuth provider (with safety check)
-- Replace values with actual user_id and provider
DO $$
DECLARE
    target_user_id UUID := 'your-user-id-here';
    oauth_provider VARCHAR := 'github';
    has_password BOOLEAN;
    other_providers_count INT;
BEGIN
    -- Get user's auth status
    SELECT 
        password_hash IS NOT NULL,
        (SELECT COUNT(*) FROM user_oauth_providers WHERE user_id = target_user_id) - 1
    INTO has_password, other_providers_count
    FROM users
    WHERE id = target_user_id;
    
    -- Safety check: ensure user has alternative auth method
    IF NOT has_password AND other_providers_count = 0 THEN
        RAISE EXCEPTION 'Cannot unlink last authentication method for user %', target_user_id;
    END IF;
    
    -- Unlink provider
    DELETE FROM user_oauth_providers
    WHERE user_id = target_user_id AND provider = oauth_provider;
    
    IF FOUND THEN
        RAISE NOTICE 'Successfully unlinked % from user %', oauth_provider, target_user_id;
    ELSE
        RAISE NOTICE 'Provider % was not linked to user %', oauth_provider, target_user_id;
    END IF;
END $$;

-- 12. Merge duplicate accounts (DANGEROUS - use with caution)
-- This merges user2 into user1, transferring all OAuth providers
-- Replace with actual user IDs
DO $$
DECLARE
    keep_user_id UUID := 'user-id-to-keep';
    merge_user_id UUID := 'user-id-to-merge';
BEGIN
    -- Start transaction
    BEGIN
        -- Transfer OAuth providers
        UPDATE user_oauth_providers
        SET user_id = keep_user_id
        WHERE user_id = merge_user_id
            AND provider NOT IN (
                SELECT provider FROM user_oauth_providers WHERE user_id = keep_user_id
            );
        
        -- Transfer user profiles (if exists)
        UPDATE user_profiles
        SET user_id = keep_user_id
        WHERE user_id = merge_user_id
            AND NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = keep_user_id);
        
        -- Delete duplicate user
        DELETE FROM users WHERE id = merge_user_id;
        
        RAISE NOTICE 'Successfully merged user % into %', merge_user_id, keep_user_id;
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Merge failed: %', SQLERRM;
    END;
END $$;

-- 13. Audit: Recent account linking activity
-- Requires audit table (optional enhancement)
/*
CREATE TABLE IF NOT EXISTS auth_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50),
    provider VARCHAR(50),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT 
    aal.created_at,
    aal.action,
    aal.provider,
    u.email,
    aal.ip_address
FROM auth_audit_log aal
JOIN users u ON aal.user_id = u.id
WHERE aal.action IN ('oauth_linked', 'oauth_unlinked', 'password_set')
ORDER BY aal.created_at DESC
LIMIT 100;
*/

-- 14. Health check: Find accounts with issues
SELECT 
    'No auth method' as issue,
    COUNT(*) as count
FROM users u
LEFT JOIN user_oauth_providers uop ON u.id = uop.user_id
WHERE u.password_hash IS NULL AND uop.provider IS NULL

UNION ALL

SELECT 
    'Inactive with OAuth only' as issue,
    COUNT(*) as count
FROM users u
INNER JOIN user_oauth_providers uop ON u.id = uop.user_id
WHERE u.password_hash IS NULL 
    AND NOT u.is_active

UNION ALL

SELECT 
    'Duplicate emails' as issue,
    COUNT(*) as count
FROM (
    SELECT email
    FROM users
    GROUP BY LOWER(TRIM(email))
    HAVING COUNT(*) > 1
) duplicates;

-- 15. Generate account linking report
SELECT 
    'Total Users' as metric,
    COUNT(*)::text as value
FROM users

UNION ALL

SELECT 
    'Users with Password',
    COUNT(*)::text
FROM users
WHERE password_hash IS NOT NULL

UNION ALL

SELECT 
    'Users with OAuth',
    COUNT(DISTINCT user_id)::text
FROM user_oauth_providers

UNION ALL

SELECT 
    'Users with Both',
    COUNT(*)::text
FROM users u
INNER JOIN user_oauth_providers uop ON u.id = uop.user_id
WHERE u.password_hash IS NOT NULL

UNION ALL

SELECT 
    'GitHub Users',
    COUNT(DISTINCT user_id)::text
FROM user_oauth_providers
WHERE provider = 'github'

UNION ALL

SELECT 
    'Average Auth Methods per User',
    ROUND(AVG(auth_count), 2)::text
FROM (
    SELECT 
        u.id,
        (CASE WHEN u.password_hash IS NOT NULL THEN 1 ELSE 0 END) +
        COALESCE((SELECT COUNT(*) FROM user_oauth_providers WHERE user_id = u.id), 0) as auth_count
    FROM users u
) auth_counts;
