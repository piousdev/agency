/**
 * Auth Components - Client-Side UI Guards
 *
 * ⚠️  SECURITY WARNING: These are UI helpers ONLY.
 * Real authorization MUST happen server-side.
 *
 * Reference: apps/web/ARCHITECTURE.md - Client-Side Auth State Management
 */

export { EnhancedLoginForm } from './login-form';
export { IdleTimeoutProvider } from './idle-timeout';
export { type ClientType, RequireClientType } from './require-client-type';
export { RequirePermission } from './require-permission';
export { RequireRole } from './require-role';
export { UserMenu } from './user-menu';
