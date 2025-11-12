-- Create databases for each service
CREATE DATABASE auth_service;
CREATE DATABASE user_service;
CREATE DATABASE project_service;
CREATE DATABASE collaboration_service;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE auth_service TO skillsync;
GRANT ALL PRIVILEGES ON DATABASE user_service TO skillsync;
GRANT ALL PRIVILEGES ON DATABASE project_service TO skillsync;
GRANT ALL PRIVILEGES ON DATABASE collaboration_service TO skillsync;