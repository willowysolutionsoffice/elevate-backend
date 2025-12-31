export const PERMISSION_MODULES = {
  ROLE: "Role",
  BRANCH: "Branch",
  USER: "User",
  PERMISSION: "Permission",
  PROPOSAL: "Proposal",
} as const;

export const PERMISSION_ACTIONS = {
  CREATE: "create",
  VIEW: "view",
  UPDATE: "update",
  DELETE: "delete",
} as const;

export type PermissionModule =
  (typeof PERMISSION_MODULES)[keyof typeof PERMISSION_MODULES];
export type PermissionAction =
  (typeof PERMISSION_ACTIONS)[keyof typeof PERMISSION_ACTIONS];
