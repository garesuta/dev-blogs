/**
 * UserMenu Component Tests - Command Bar Design
 * Tests for the redesigned user menu with pill trigger and computed role checks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import UserMenu from '@/components/UserMenu.vue';

// Mock auth client
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    getSession: vi.fn(),
    signOut: vi.fn(),
  },
}));

import { authClient } from '@/lib/auth-client';
const mockAuthClient = vi.mocked(authClient);

describe('UserMenu Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading state', () => {
    it('should show spinner while loading', () => {
      mockAuthClient.getSession.mockReturnValue(new Promise(() => {})); // never resolves
      const wrapper = mount(UserMenu);
      expect(wrapper.find('.spinner-border').exists()).toBe(true);
    });
  });

  describe('Unauthenticated state', () => {
    it('should show Sign In and Sign Up buttons when not logged in', async () => {
      mockAuthClient.getSession.mockResolvedValue({ data: null } as any);
      const wrapper = mount(UserMenu);
      await flushPromises();

      expect(wrapper.find('.btn-auth-signin').exists() || wrapper.find('[href="/login"]').exists()).toBe(true);
      expect(wrapper.find('.btn-auth-signup').exists() || wrapper.find('[href="/register"]').exists()).toBe(true);
    });
  });

  describe('Authenticated state', () => {
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
    };

    beforeEach(() => {
      mockAuthClient.getSession.mockResolvedValue({
        data: { user: mockUser },
      } as any);
    });

    it('should display user avatar with initials', async () => {
      const wrapper = mount(UserMenu);
      await flushPromises();

      const avatar = wrapper.find('.user-trigger__avatar, .user-avatar-placeholder');
      expect(avatar.exists()).toBe(true);
      expect(avatar.text()).toContain('JD');
    });

    it('should display user name', async () => {
      const wrapper = mount(UserMenu);
      await flushPromises();

      expect(wrapper.text()).toContain('John Doe');
    });

    it('should show CMS button for admin users', async () => {
      const wrapper = mount(UserMenu);
      await flushPromises();

      const cmsLink = wrapper.find('.btn-cms, [href="/editor/posts"]');
      expect(cmsLink.exists()).toBe(true);
    });

    it('should show CMS button for editor users', async () => {
      mockAuthClient.getSession.mockResolvedValue({
        data: { user: { ...mockUser, role: 'editor' } },
      } as any);
      const wrapper = mount(UserMenu);
      await flushPromises();

      const cmsLink = wrapper.find('.btn-cms, [href="/editor/posts"]');
      expect(cmsLink.exists()).toBe(true);
    });

    it('should NOT show CMS button for regular users', async () => {
      mockAuthClient.getSession.mockResolvedValue({
        data: { user: { ...mockUser, role: 'user' } },
      } as any);
      const wrapper = mount(UserMenu);
      await flushPromises();

      const cmsButton = wrapper.find('.btn-cms');
      expect(cmsButton.exists()).toBe(false);
    });

    it('should show dropdown with user info', async () => {
      const wrapper = mount(UserMenu);
      await flushPromises();

      expect(wrapper.text()).toContain('John Doe');
      expect(wrapper.text()).toContain('john@example.com');
    });

    it('should show role badge in dropdown', async () => {
      const wrapper = mount(UserMenu);
      await flushPromises();

      const badge = wrapper.find('.badge');
      expect(badge.exists()).toBe(true);
      expect(badge.text().toLowerCase()).toContain('admin');
    });

    it('should show admin link for admin users', async () => {
      const wrapper = mount(UserMenu);
      await flushPromises();

      const adminLink = wrapper.find('[href="/admin"]');
      expect(adminLink.exists()).toBe(true);
    });

    it('should NOT show admin link for non-admin users', async () => {
      mockAuthClient.getSession.mockResolvedValue({
        data: { user: { ...mockUser, role: 'editor' } },
      } as any);
      const wrapper = mount(UserMenu);
      await flushPromises();

      const adminLink = wrapper.find('[href="/admin"]');
      expect(adminLink.exists()).toBe(false);
    });

    it('should have sign out button', async () => {
      const wrapper = mount(UserMenu);
      await flushPromises();

      const signOutBtn = wrapper.find('.text-danger');
      expect(signOutBtn.exists()).toBe(true);
      expect(signOutBtn.text()).toContain('Sign Out');
    });

    it('should call signOut on click', async () => {
      mockAuthClient.signOut.mockResolvedValue({} as any);
      const wrapper = mount(UserMenu);
      await flushPromises();

      const signOutBtn = wrapper.find('.text-danger');
      await signOutBtn.trigger('click');
      await flushPromises();

      expect(mockAuthClient.signOut).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle session error gracefully', async () => {
      mockAuthClient.getSession.mockRejectedValue(new Error('Network error'));
      const wrapper = mount(UserMenu);
      await flushPromises();

      // Should show unauthenticated state (sign in / sign up)
      expect(wrapper.find('.spinner-border').exists()).toBe(false);
    });
  });
});
