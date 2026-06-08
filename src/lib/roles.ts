export const OWNER_DISCORD_ID = import.meta.env.VITE_OWNER_DISCORD_ID || '210768103594917888';

export const FULL_PERMISSIONS = [
  'view_management',
  'invite_users',
  'assign_roles',
  'manage_users',
  'manage_content',
  'manage_categories',
  'add_content',
  'edit_content',
  'delete_content',
  'manage_credits',
  'manage_announcements',
  'manage_branding'
];

export const CONTENT_PERMISSIONS = [
  'view_management',
  'manage_content',
  'manage_categories',
  'add_content',
  'edit_content',
  'delete_content'
];

export interface RoleDefinition {
  role_name: string;
  role_level: number;
  permissions: string[];
  description: string;
  full_access: boolean;
}

export const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    role_name: 'Web Owner',
    role_level: 100,
    permissions: FULL_PERMISSIONS,
    description: 'Built-in owner role for the configured Discord user ID. This role is not assignable from the dashboard.',
    full_access: true
  },
  {
    role_name: 'Broken Blade Staff',
    role_level: 80,
    permissions: FULL_PERMISSIONS,
    description: 'Full management access for trusted Broken Blade staff.',
    full_access: true
  },
  {
    role_name: 'Web Admin',
    role_level: 70,
    permissions: FULL_PERMISSIONS,
    description: 'Full management access, including user access and role assignment below their own rank.',
    full_access: true
  },
  {
    role_name: 'Web Mod',
    role_level: 40,
    permissions: CONTENT_PERMISSIONS,
    description: 'Can add, edit, and delete content boards, categories, and posts.',
    full_access: false
  }
];

export const normalizeDiscordId = (discordId?: string | null) => (discordId || '').trim();
export const normalizeEmail = (email?: string | null) => (email || '').trim().toLowerCase();

export const getRoleByName = (roleName?: string | null) => {
  return ROLE_DEFINITIONS.find((role) => role.role_name === roleName) || null;
};

export const getBuiltInRoleForDiscordId = (discordId?: string | null) => {
  return normalizeDiscordId(discordId) === OWNER_DISCORD_ID ? ROLE_DEFINITIONS[0] : null;
};

export const getAssignableRoles = (currentRoleLevel: number) => {
  return ROLE_DEFINITIONS.filter((role) => role.role_level < currentRoleLevel);
};

export const hasPermission = (permissions: string[] = [], permission: string) => {
  return permissions.includes(permission);
};
