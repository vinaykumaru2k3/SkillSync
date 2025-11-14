-- Add table to store OAuth provider-specific IDs
-- This allows tracking the same user across different OAuth providers
-- and prevents duplicate accounts if email changes

CREATE TABLE IF NOT EXISTS user_oauth_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    provider_email VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user_oauth_identities_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT uk_provider_user_id 
        UNIQUE (provider, provider_user_id)
);

-- Index for faster lookups
CREATE INDEX idx_user_oauth_identities_user_id ON user_oauth_identities(user_id);
CREATE INDEX idx_user_oauth_identities_provider ON user_oauth_identities(provider);

-- Add comments for documentation
COMMENT ON TABLE user_oauth_identities IS 'Stores OAuth provider-specific identities for account linking';
COMMENT ON COLUMN user_oauth_identities.provider IS 'OAuth provider name (e.g., github, google)';
COMMENT ON COLUMN user_oauth_identities.provider_user_id IS 'User ID from the OAuth provider';
COMMENT ON COLUMN user_oauth_identities.provider_email IS 'Email from OAuth provider at time of linking';
