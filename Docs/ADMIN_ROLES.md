# Admin Role Management

This document explains how to manage admin roles in SkillSync.

## Features

### 1. Admin API Endpoints

The `auth-service` provides the following admin endpoints:

- **GET** `/api/v1/admin/users/{userId}/roles` - Get user roles
- **POST** `/api/v1/admin/users/{userId}/roles` - Add role to user
- **DELETE** `/api/v1/admin/users/{userId}/roles/{role}` - Remove role from user

All endpoints require `ROLE_ADMIN` permission.

### 2. Admin UI

Navigate to `/admin/users` to manage user roles:

- **Grant Admin**: Click to grant `ROLE_ADMIN` to a user
- **Revoke Admin**: Click to remove `ROLE_ADMIN` from a user
- **Suspend/Activate**: Toggle user account status

### 3. Creating Admin Users

#### Option A: Using Seed Data (Recommended for Development)

Run the seed script to create a default admin user:

```bash
docker exec skillsync-postgres psql -U skillsync -d auth_service -f /docker-entrypoint-initdb.d/seed-admin.sql
```

**Default Admin Credentials:**
- Email: `admin@skillsync.com`
- Password: `admin123`

#### Option B: Manual Database Update

To grant admin role to an existing user:

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('<user-id-here>', 'ROLE_ADMIN');
```

Example:
```bash
docker exec skillsync-postgres psql -U skillsync -d auth_service -c \
  "INSERT INTO user_roles (user_id, role) VALUES ('5c845ec6-90d7-4429-a0fa-cf06ea01b4de', 'ROLE_ADMIN');"
```

#### Option C: Using the API (Requires Existing Admin)

```bash
curl -X POST http://localhost:8080/api/v1/auth/admin/users/{userId}/roles \
  -H "Authorization: Bearer {admin-token}" \
  -H "Content-Type: application/json" \
  -d '{"role": "ROLE_ADMIN"}'
```

## Security Notes

- Admin endpoints are protected by `@PreAuthorize("hasRole('ADMIN')")`
- Only users with `ROLE_ADMIN` can grant or revoke admin roles
- Users must log out and log back in for role changes to take effect

## Future Enhancements

- Email notifications when roles are changed
- Audit log for role changes
- Bulk role management
- Custom role creation
