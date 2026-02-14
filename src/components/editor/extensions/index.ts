/**
 * Tiptap Editor Extensions
 *
 * Barrel export for all custom Tiptap extensions.
 *
 * Security Note: All extensions implement proper input sanitization
 * to prevent XSS and injection attacks.
 */

// Custom extensions
export { default as Figure } from './figure';
export { default as Figcaption } from './figcaption';
export { default as TableOfContents } from './table-of-contents';
export { default as SlashCommandsExtension } from './slash-commands';

// Slash commands utilities (for Vue component integration)
export type { SlashCommandItem } from './slash-commands';
export {
  DEFAULT_SLASH_COMMANDS,
  getSlashMenuState,
  updateSlashMenuState,
  resetSlashMenuState,
  filterSlashCommands,
} from './slash-commands';

// Re-export Tiptap extensions for convenience
export { default as StarterKit } from '@tiptap/starter-kit';
export { default as Heading } from '@tiptap/extension-heading';
export { default as Image } from '@tiptap/extension-image';
export { default as Link } from '@tiptap/extension-link';
export { default as Placeholder } from '@tiptap/extension-placeholder';
export { default as CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
export {
  Table,
  TableRow,
  TableCell,
  TableHeader,
} from '@tiptap/extension-table';
