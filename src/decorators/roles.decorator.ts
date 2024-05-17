import { Role } from '../types/user';
import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
/**
 * This adds a metadata value to the request body called roles as an array of allowed roles
 * @param {Roles[]} roles - The list of allowed roles separated by coma
 * @returns {CustomDecorator<string>}  A custom decorator
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
