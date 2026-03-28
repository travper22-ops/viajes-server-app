// ============================================
// MODELO DE USUARIO - TRAVEL AGENCY
// ============================================

import { USER_ROLES, USER_STATUS, IUser, IUserCreate, IUserUpdate } from '../types/index.js';

// ============================================
// CONSTANTES
// ============================================

export const USER_ROLES_ENUM = {
  ADMIN: 'admin',
  AGENT: 'agent',
  USER: 'user',
  GUEST: 'guest'
} as const;

export const USER_STATUS_ENUM = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending'
} as const;

// ============================================
// CAMPOS DEL MODELO
// ============================================

export const userFields = {
  id: 'string',
  email: 'string',
  name: 'string',
  lastName: 'string',
  phone: 'string?',
  role: 'string',
  status: 'string',
  avatar: 'string?',
  documentId: 'string?',
  documentType: 'string?',
  birthDate: 'string?',
  nationality: 'string?',
  passwordHash: 'string',
  createdAt: 'string',
  updatedAt: 'string'
};

export const userRequiredFields = [
  'email',
  'name',
  'lastName',
  'passwordHash'
];

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

/**
 * Crea un objeto de usuario válido para Supabase
 */
export function createUserObject(data: IUserCreate, passwordHash: string): Record<string, unknown> {
  return {
    email: data.email.toLowerCase().trim(),
    name: data.name.trim(),
    lastName: data.lastName.trim(),
    phone: data.phone?.trim(),
    role: data.role || USER_ROLES.USER,
    status: USER_STATUS.PENDING,
    documentId: data.documentId?.trim(),
    documentType: data.documentType?.trim(),
    birthDate: data.birthDate,
    nationality: data.nationality?.trim(),
    passwordHash,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Actualiza un objeto de usuario
 */
export function updateUserObject(data: IUserUpdate): Record<string, unknown> {
  const updateData: Record<string, unknown> = {
    updatedAt: new Date().toISOString()
  };

  if (data.email) updateData.email = data.email.toLowerCase().trim();
  if (data.name) updateData.name = data.name.trim();
  if (data.lastName) updateData.lastName = data.lastName.trim();
  if (data.phone) updateData.phone = data.phone.trim();
  if (data.avatar) updateData.avatar = data.avatar.trim();
  if (data.documentId) updateData.documentId = data.documentId.trim();
  if (data.documentType) updateData.documentType = data.documentType.trim();
  if (data.birthDate) updateData.birthDate = data.birthDate;
  if (data.nationality) updateData.nationality = data.nationality.trim();
  if (data.status) updateData.status = data.status;
  if (data.role) updateData.role = data.role;

  return updateData;
}

/**
 * Sanitiza un usuario para enviar al cliente (sin datos sensibles)
 */
export function sanitizeUser(user: Record<string, unknown>): Partial<IUser> {
  const { passwordHash, ...safeUser } = user;
  return safeUser as Partial<IUser>;
}

/**
 * Valida el rol del usuario
 */
export function isValidRole(role: string): boolean {
  return Object.values(USER_ROLES_ENUM).includes(role as typeof USER_ROLES_ENUM[keyof typeof USER_ROLES_ENUM]);
}

/**
 * Valida el estado del usuario
 */
export function isValidStatus(status: string): boolean {
  return Object.values(USER_STATUS_ENUM).includes(status as typeof USER_STATUS_ENUM[keyof typeof USER_STATUS_ENUM]);
}

export default {
  USER_ROLES_ENUM,
  USER_STATUS_ENUM,
  userFields,
  userRequiredFields,
  createUserObject,
  updateUserObject,
  sanitizeUser,
  isValidRole,
  isValidStatus
};
