/**
 * Slash Commands Extension Unit Tests
 *
 * Tests for custom SlashCommands extension.
 */

import { describe, it, expect, vi } from 'vitest';
import SlashCommandsExtension, {
  DEFAULT_SLASH_COMMANDS,
  filterSlashCommands,
  getSlashMenuState,
  type SlashMenuState,
  type SlashCommandItem,
} from '@/components/editor/extensions/slash-commands';

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
  describe('Extension creation', () => {
    it('should create extension with correct name', () => {
      expect(SlashCommandsExtension.name).toBe('slashCommands');
    });
  });

  describe('filterSlashCommands', () => {
    it('should return all commands when query is empty', () => {
      const result = filterSlashCommands(DEFAULT_SLASH_COMMANDS, '');
      expect(result).toHaveLength(DEFAULT_SLASH_COMMANDS.length);
    });

    it('should filter commands by title', () => {
      const result = filterSlashCommands(DEFAULT_SLASH_COMMANDS, 'heading');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((cmd: SlashCommandItem) => cmd.title.toLowerCase().includes('heading'))).toBe(true);
    });

    it('should filter commands by description', () => {
      const result = filterSlashCommands(DEFAULT_SLASH_COMMANDS, 'list');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((cmd: SlashCommandItem) =>
        cmd.title.toLowerCase().includes('list') ||
        cmd.description.toLowerCase().includes('list')
      )).toBe(true);
    });

    it('should be case insensitive', () => {
      const result = filterSlashCommands(DEFAULT_SLASH_COMMANDS, 'CODE BLOCK');
      expect(result.length).toBe(1);
      expect(result[0]?.title).toBe('Code Block');
    });
  });

  describe('getSlashMenuState', () => {
    it('should return default state when storage is empty', () => {
      const result = getSlashMenuState({ storage: undefined } as any);
      expect(result).toEqual({
        show: false,
        position: { top: 0, left: 0 },
        query: '',
        selectedIndex: 0,
      });
    });

    it('should return existing state from storage', () => {
      const existing: SlashMenuState = {
        show: true,
        position: { top: 100, left: 200 },
        query: 'test',
        selectedIndex: 2,
      };

      mockEditor.storage = {
        slashMenu: existing,
      } as any;

      const result = getSlashMenuState(mockEditor);
      expect(result).toEqual(existing);
    });
  });

  describe('DEFAULT_SLASH_COMMANDS', () => {
    it('should have all required command properties', () => {
      DEFAULT_SLASH_COMMANDS.forEach((cmd: SlashCommandItem) => {
        expect(cmd).toHaveProperty('title');
        expect(cmd).toHaveProperty('description');
        expect(cmd).toHaveProperty('icon');
        expect(cmd).toHaveProperty('command');
        expect(typeof cmd.command).toBe('function');
      });
    });

    it('should have expected commands', () => {
      const titles = DEFAULT_SLASH_COMMANDS.map((cmd: SlashCommandItem) => cmd.title);
      expect(titles).toContain('Text');
      expect(titles).toContain('Heading 1');
      expect(titles).toContain('Heading 2');
      expect(titles).toContain('Heading 3');
      expect(titles).toContain('Bullet List');
      expect(titles).toContain('Code Block');
      expect(titles).toContain('Quote');
      expect(titles).toContain('Divider');
      expect(titles).toContain('Table');
    });
  });
});
