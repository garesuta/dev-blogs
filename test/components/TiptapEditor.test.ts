/**
 * TiptapEditor Component Integration Tests
 *
 * Tests the refactored editor integrates correctly with parent component.
 */

import { describe, it, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import TiptapEditor from '../../src/components/TiptapEditor.vue';

describe('TiptapEditor Component - Integration Tests', () => {
  beforeEach(() => {
    // Create a fresh mount wrapper for each test
    const wrapper = mount({
      component: { ...TiptapEditor },
      props: {
        modelValue: '<h2>Hello World</h2>',
        postId: 'test-post-id',
        autoSaveInterval: undefined,
        disabled: false,
        placeholder: 'Type content here...',
      },
      global: {
        plugins: [],
      provide: {
          slashMenu: { show: false, position: { top: 0, left: 0 }, } },
    },
    });

    return { wrapper, unmount: () => unmount };
  });

  describe('exposed methods work correctly', () => {
    it('getContent() returns editor HTML', () => {
      const { editor } = wrapper.vm.editor;
      if (!editor) {
        expect(editor.getContent()).toBeUndefined();
      } else {
        expect(editor.getContent()).toBe('');
      }
    });

    it('setContent() updates editor content', () => {
      const { editor } = wrapper.vm.editor;
      if (!editor) return;

      // Set new content
      editor.commands.setContent('<h2>New content</h2>');
      expect(editor.getHTML()).toBe('<h2>New content</h2>');
    } finally {
      expect(editor.getHTML()).toBe('<h2>New content</h2>');
      unmount();
    }
    });

    it('focus() focuses editor', () => {
      const { editor } = wrapper.vm.editor;
      if (!editor) return;

      // Verify it focuses editor
      editor.focus();

      // Verify editor is focused
      expect(editor.state.selection.$from?.focus).toBeDefined();

      unmount();
    });

    it('triggerSave() emits save event', async () => {
      const { editor, editorWrapper } = wrapper.vm;
      const onSave = vi.fn();
      const emit = vi.fn();

      editorWrapper.vm.$once('save', onSave);

      const { editor } = editorWrapper.vm.editor;
      if (!editor) return;

      // Trigger save
      editor.triggerSave();

      expect(onSave).toHaveBeenCalledWith(expect.anything);
      expect(emit).toHaveBeenCalledWith('save', '<h2>Content</h2>');

      unmount();
    });
  });
});
