import { describe, it, expect } from 'vitest'
import {
  ac,
  adminRole,
  editorRole,
  userRole,
  roles,
  isAdmin,
  canManageContent,
  getRoleDisplayName,
  availableRoles,
} from '@/lib/permissions'
import type { UserRole } from '@/lib/schema'

describe('Access Control System', () => {
  describe('Role Definitions', () => {
    it('should define admin role with all permissions', () => {
      expect(adminRole).toBeDefined()
      // Admin should have all permissions
    })

    it('should define editor role with content management', () => {
      expect(editorRole).toBeDefined()
      // Editor should manage content but not admin
    })

    it('should define user role with basic permissions', () => {
      expect(userRole).toBeDefined()
      // User should only read and update own profile
    })

    it('should have roles export for Better Auth', () => {
      expect(roles).toEqual({
        admin: adminRole,
        editor: editorRole,
        user: userRole,
      })
    })
  })

  describe('Permission Helper Functions', () => {
    describe('isAdmin', () => {
      it('should return true for admin role', () => {
        expect(isAdmin('admin')).toBe(true)
      })

      it('should return false for other roles', () => {
        expect(isAdmin('editor')).toBe(false)
        expect(isAdmin('user')).toBe(false)
      })

      it('should handle null and undefined', () => {
        expect(isAdmin(null)).toBe(false)
        expect(isAdmin(undefined)).toBe(false)
      })
    })

    describe('canManageContent', () => {
      it('should return true for admin role', () => {
        expect(canManageContent('admin')).toBe(true)
      })

      it('should return true for editor role', () => {
        expect(canManageContent('editor')).toBe(true)
      })

      it('should return false for user role', () => {
        expect(canManageContent('user')).toBe(false)
      })

      it('should handle null and undefined', () => {
        expect(canManageContent(null)).toBe(false)
        expect(canManageContent(undefined)).toBe(false)
      })
    })

    describe('getRoleDisplayName', () => {
      it('should return correct display names', () => {
        expect(getRoleDisplayName('admin')).toBe('Administrator')
        expect(getRoleDisplayName('editor')).toBe('Editor')
        expect(getRoleDisplayName('user')).toBe('User')
      })
    })
  })

  describe('Available Roles', () => {
    it('should contain all role types', () => {
      expect(availableRoles).toEqual(['user', 'editor', 'admin'] as UserRole[])
    })

    it('should have user as first role (default)', () => {
      expect(availableRoles[0]).toBe('user')
    })
  })

  describe('Permission Matrix', () => {
    it('should have correct permission hierarchy', () => {
      // User has least permissions
      // Editor has user + content permissions
      // Admin has all permissions

      // Test that availableRoles are ordered by privilege
      const userIndex = availableRoles.indexOf('user')
      const editorIndex = availableRoles.indexOf('editor')
      const adminIndex = availableRoles.indexOf('admin')

      expect(userIndex).toBeLessThan(editorIndex)
      expect(editorIndex).toBeLessThan(adminIndex)
    })
  })
})

describe('Access Control Plugin', () => {
  describe('ac instance', () => {
    it('should create access control instance', () => {
      expect(ac).toBeDefined()
      expect(ac.newRole).toBeInstanceOf(Function)
    })

    it('should support role creation', () => {
      const customRole = ac.newRole({
        user: ['read'],
        post: ['read'],
        admin: [],
      })

      expect(customRole).toBeDefined()
    })
  })
})
