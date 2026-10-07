import { describe, it, expect } from 'vitest'
import { canAccess } from './access'

describe('canAccess', () => {
  it('allows anyone on non-admin paths', () => {
    expect(canAccess('/book', undefined)).toBe(true)
    expect(canAccess('/pets', 'customer')).toBe(true)
  })

  describe('/admin/staff (admin-only)', () => {
    it('allows admin', () => {
      expect(canAccess('/admin/staff', 'admin')).toBe(true)
    })
    it('blocks staff', () => {
      // Regression guard: staff must NOT be able to create other
      // staff accounts — only admins can.
      expect(canAccess('/admin/staff', 'staff')).toBe(false)
    })
    it('blocks customer and logged-out', () => {
      expect(canAccess('/admin/staff', 'customer')).toBe(false)
      expect(canAccess('/admin/staff', undefined)).toBe(false)
    })
  })

  describe('other /admin routes (staff or admin)', () => {
    it('allows staff', () => {
      // Regression guard: this is the bug found during the earlier
      // review — staff were being blocked from their own dashboard
      // pages by an overly broad /admin check.
      expect(canAccess('/admin/slots', 'staff')).toBe(true)
      expect(canAccess('/admin/appointments', 'staff')).toBe(true)
    })
    it('allows admin', () => {
      expect(canAccess('/admin/slots', 'admin')).toBe(true)
    })
    it('blocks customer and logged-out', () => {
      expect(canAccess('/admin/slots', 'customer')).toBe(false)
      expect(canAccess('/admin/slots', undefined)).toBe(false)
    })
  })
})
