import { PermissionModule, PermissionAction } from "../constants/permissions";

export type PermissionRequirement = {
  module: PermissionModule;
  action: PermissionAction;
};
