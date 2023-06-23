const ROLES = {
  USERS: {
    VIEWER: ["READ"],
    COLLABORATOR: ["READ", "ADD"],
    ADMIN: ["READ", "ADD", "EDIT", "REMOVE"],
  },
  EVENTS: {
    VIEWER: ["READ"],
    COLLABORATOR: ["READ", "ADD"],
    ADMIN: ["READ", "ADD", "EDIT", "REMOVE"],
  },
  SUBSCRIBERS: {
    VIEWER: ["READ"],
    COLLABORATOR: ["READ", "ADD"],
    ADMIN: ["READ", "ADD", "EDIT", "REMOVE"],
  },
  FEEDS: {
    VIEWER: ["READ"],
    COLLABORATOR: ["READ", "ADD"],
    ADMIN: ["READ", "ADD", "EDIT", "REMOVE"],
  },
};

const hasPermissionForResource = (user, resource, permission) => {
  if (user.superAdmin) return true;
  const resourceRoles = ROLES[resource];
  const rolePermissions = resourceRoles[user.roles[resource]];
  return rolePermissions ? rolePermissions.includes(permission) : false;
};

module.exports.ROLES = ROLES;
module.exports.hasPermissionForResource = hasPermissionForResource;
