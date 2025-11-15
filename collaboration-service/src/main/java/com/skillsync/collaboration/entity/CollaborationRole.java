package com.skillsync.collaboration.entity;

import java.util.Set;

public enum CollaborationRole {
    VIEWER(Set.of(Permission.READ)),
    EDITOR(Set.of(Permission.READ, Permission.WRITE));

    private final Set<Permission> defaultPermissions;

    CollaborationRole(Set<Permission> defaultPermissions) {
        this.defaultPermissions = defaultPermissions;
    }

    public Set<Permission> getDefaultPermissions() {
        return defaultPermissions;
    }

    public boolean hasPermission(Permission permission) {
        return defaultPermissions.contains(permission);
    }
}
