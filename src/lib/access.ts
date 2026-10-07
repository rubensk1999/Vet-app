export type Role = 'customer' | 'staff' | 'admin' | undefined

/**
 * Returns true if a session with this role may access this path.
 * Rules:
 *  - /admin/staff: admin only (creating staff accounts)
 *  - everything else under /admin: staff or admin
 *  - anything outside /admin: always allowed (public or handled
 *    by the route itself)
 */
export function canAccess(path: string, role: Role): boolean {
  if (path.startsWith('/admin/staff')) {
    return role === 'admin'
  }
  if (path.startsWith('/admin')) {
    return role === 'staff' || role === 'admin'
  }
  return true
}
