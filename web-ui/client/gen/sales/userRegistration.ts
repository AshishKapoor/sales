/**
 * Generated by orval v7.10.0 🍺
 * Do not edit manually.
 * Sales Cookbook API
 * Sales Cookbook API Documentation - A comprehensive sales management system
 * OpenAPI spec version: 1.0.0
 */
import type { RoleEnum } from './roleEnum';

export interface UserRegistration {
  readonly id: number;
  /** @maxLength 254 */
  email?: string;
  /**
   * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
   * @maxLength 150
   * @pattern ^[\w.@+-]+$
   */
  username?: string;
  password: string;
  confirm_password: string;
  /** @maxLength 150 */
  first_name?: string;
  /** @maxLength 150 */
  last_name?: string;
  role?: RoleEnum;
}
