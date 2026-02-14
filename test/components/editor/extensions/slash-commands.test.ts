/**
 * Slash Commands Extension Unit Tests
 *
 * Tests for custom SlashCommands extension.
 */

import { describe, it, expect, vi } from 'vitest';
import SlashCommandsExtension from '../../../src/components/editor/extensions/slash-commands';
import { DEFAULT_SLASH_COMMANDS, filterSlashCommands } from '../../../src/components/editor/extensions/slash-commands';

// Mock editor with storage
const mockEditor = {
  storage: {
    slashMenu: {
      show: false,
      position: { top: 0, left: 0 },
      query: '',
      selectedIndex: 0,
    },
  },
} as any;

describe('SlashCommands Extension', () => {
  describe('filterSlashCommands', () => {
    it('should return all commands when query is empty', () => {
      const result = filterSlashCommands(DEFAULT_SLASH_COMMANDS, '');
      expect(result).toHaveLength(DEFAULT_SLASH_COMMANDS.length);
    });

    it('should filter commands by title', () => {
      const result = filterSlashCommands(DEFAULT_SLASH_COMMANDS, 'heading');
      expect(result).toEqual([
        { title: 'Heading 1', description: 'Large section heading', icon: 'bi-type-h1' },
        { title: 'Heading 2', description: 'Medium section heading', icon: 'bi-type-h2' },
        { title: 'Heading 3', description: 'Small section heading', icon: 'bi-type-h3' },
      ]);
    });

    it('should filter commands by description', () => {
      const result = filterSlashCommands(DEFAULT_SLASH_COMMANDS, 'list');
      expect(result).toEqual([
        { title: 'Bullet List', description: 'Create a bullet list', icon: 'bi-list-ul' },
        { title: 'Numbered List', description: 'Create a numbered list', icon: 'bi-list-ol' },
      ]);
    });

    it('should be case insensitive', () => {
      const result = filterSlashCommands(DEFAULT_SLASH_COMMANDS, 'CODE BLOCK');
      expect(result).toEqual([
        { title: 'Code Block', description: 'Display code with syntax highlighting', icon: 'bi-code-square' },
      ]);
    });
  });

  describe('getSlashMenuState', () => {
    it('should return default state when storage is empty', () => {
      const result = SlashCommandsExtension.getSlashMenuState({} as any);
      expect(result).toEqual({
        show: false,
        position: { top: 0, left: 0 },
        query: '',
        selectedIndex: 0,
      });
    });

    it('should return existing state from storage', () => {
      const existing = {
        show: true,
        position: { top: 100, left: 200 },
        query: 'test',
        selectedIndex: 2,
      };

      mockEditor.storage = {
        slashMenu: existing,
      } as any;

      const result = SlashCommandsExtension.getSlashMenuState(mockEditor);
      expect(result).toEqual(existing);
    });

    it('should return merged state when updates provided', () => {
      const base = {
        show: false,
        position: { top: 0, left: 0 },
        query: '',
        selectedIndex: 0,
      };

      mockEditor.storage = {
        slashMenu: base,
      } as any;

      const result = SlashCommandsExtension.getSlashMenuState(mockEditor, {
        show: true,
        position: { top: 50, left: 100 },
        query: 'search query',
        selectedIndex: 1,
      });

      expect(result).toEqual({
        show: true,
        position: { top: 50, left: 100 },
        query: 'search query',
        selectedIndex: 1,
      });
    });
  });
});
