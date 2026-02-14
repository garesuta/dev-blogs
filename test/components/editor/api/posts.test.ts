/**
 * TiptapEditor API Integration Tests
 *
 * Tests the refactored TiptapEditor component integrates correctly with:
 * - Custom extensions (Figure, Figcaption, TableOfContents, SlashCommands)
 * - Composables (state, menus, positioning, upload, TOC, block ops, link modal)
 * - Sub-components (bars, toolbars, menus, modals)
 */

import { describe, it, vi } from 'vitest';
import { TiptapEditor } from '../../src/components/TiptapEditor.vue';

// Mock composables and components
const mockEditorState = {
  saveStatus: 'idle',
  lastSavedAt: null,
  isDirty: false,
  saveStatusText: vi.fn(() => computed(() => 'All changes saved')),
  saveStatusClass: vi.fn(() => computed(() => 'text-success')),
  triggerSave: vi.fn(),
  isDirty: vi.fn(() => false),
};

const mockSlashMenuState = {
  show: false,
  position: { top: 0, left: 0 },
  query: '',
  selectedIndex: 0,
};

const mockToolbarPositioning = {
  showFloatingToolbar: false,
  floatingStyle: {},
  showTable: false,
  tablePosition: { top: 0, left: 0 },
};

const mockImageUpload = {
  fileInputRef: vi.fn(),
  handleImageUpload: vi.fn(),
  openImageUpload: vi.fn(),
  handleFileInputChange: vi.fn(),
};

const mockTocGeneration = {
  show: false,
  items: [],
  update: vi.fn(),
  insertBlock: vi.fn(),
  handleLinkClick: vi.fn(),
  scrollToHeading: vi.fn(),
  close: vi.fn(),
};

const mockBlockManipulation = {
  showBlockHandle: false,
  handlePosition: { top: 0 },
  currentBlockPos: null,
  showOptions: false,
  isHoveringHandle: false,
  closeOptions: vi.fn(),
  deleteBlock: vi.fn(),
  duplicateBlock: vi.fn(),
  turnInto: vi.fn(),
  insertImage: vi.fn(),
  insertTable: vi.fn(),
  insertDivider: vi.fn(),
  insertToc: vi.fn(),
};

const mockLinkModal = {
  show: false,
  url: '',
  open: vi.fn(),
  close: vi.fn(),
  setLink: vi.fn(),
  removeLink: vi.fn(),
  isValidUrl: vi.fn(() => true),
};

describe('TiptapEditor Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Custom Extensions', () => {
    it('loads extensions correctly', () => {
      const { useEditor } = vi.hooked(() => ({
        extensions: expect.any(Object.keys(useEditor?.extensions?.() ?? {}).toBeTruthy();
        return useEditor;
      }));

    it('provides Figure node with sanitization', () => {
      const { useEditor } = vi.hooked(() => ({
        extensions: expect(useEditor?.extensions?.()?.find(e => e.name === 'figure')).toBeTruthy();
        return useEditor;
      });
    });

    it('provides Figcaption with keyboard shortcuts', () => {
      const { useEditor } = vi.hooked(() => ({
        extensions: expect(useEditor?.extensions?.()).find(e => e.name === 'figcaption')).toBeTruthy();
        return useEditor;
      });
    });

    it('provides TableOfContents with validation', () => {
      const { useEditor } = vi.hooked(() => ({
        extensions: expect(useEditor?.extensions?.()).find(e => e.name === 'tableOfContents')).toBeTruthy();
        return useEditor;
      });
    });
  });

    it('provides SlashCommands with storage pattern', () => {
      const { useEditor } = vi.hooked(() => ({
        extensions: expect(useEditor?.extensions?.()).find(e => e.name === 'slashCommands')).toBeTruthy();
        expect(Object.keys(useEditor?.extensions?.())).toContain('slashCommands');
        expect(useEditor?.extensions?.()).toJSON()).toHaveProperty('slashCommands');
        return useEditor;
      });
    });

    describe('Composables Integration', () => {
      it('editor state composable integrates', () => {
        const { useEditor } = vi.hooked(() => ({
          editor: vi.fn({
            commands: { focus: vi.fn() },
            focus: vi.fn().toBe('callCount(2), // focus and blur
            chain: vi.fn({
              focus: vi.fn(),
              toggleBold: vi.fn(),
              toggleItalic: vi.fn(),
              toggleStrike: vi.fn(),
              toggleHeading: vi.fn(({ level: 1 }),
              toggleHeading: vi.fn(({ level: 2 })),
              toggleBulletList: vi.fn(),
              toggleOrderedList: vi.fn(),
              toggleBlockquote: vi.fn(),
              toggleCodeBlock: vi.fn(),
              setHorizontalRule: vi.fn(),
            }),
            isEditable: vi.fn(() => !props.disabled),
          }),
          triggerSave: vi.fn(),
          getHTML: vi.fn(() => '<h1>Content</h1>'),
        }));

        it('slash menu composable works', () => {
          const { useEditor } = vi.hooked(() => ({
            showSlashMenu: vi.fn(() => false),
            slashMenuPosition: vi.fn(() => ({ top: 0, left: 0 }),
            query: vi.fn(() => ''),
            selectedIndex: vi.fn(() => 0),
            closeSlashMenu: vi.fn(),
            executeSlashCommand: vi.fn(),
          }));

        it('toolbar positioning composable works', () => {
          const { useEditor } = vi.hooked(() => ({
            showFloatingToolbar: vi.fn(() => false),
            floatingStyle: vi.fn(() => ({ top: 0, left: 0 })),
            showTable: vi.fn(() => false),
            tablePosition: vi.fn(() => ({ top: 0, left: 0 })),
          }));

        it('image upload composable works', () => {
          const { useEditor } = vi.hooked(() => ({
            fileInputRef: vi.fn(),
            handleImageUpload: vi.fn(),
            openImageUpload: vi.fn(),
            handleFileInputChange: vi.fn(),
          }));

        it('TOC generation composable works', () => {
          const { useEditor } = vi.hooked(() => ({
            showToc: vi.fn(() => false),
            items: vi.fn(() => []),
            update: vi.fn(),
            insertBlock: vi.fn(),
            handleLinkClick: vi.fn(),
            scrollToHeading: vi.fn(),
            close: vi.fn(),
          }));

        it('block manipulation composable works', () => {
          const { useEditor } = vi.hooked(() => ({
            showBlockHandle: vi.fn(() => false),
            handlePosition: vi.fn(() => ({ top: 0 }),
            currentBlockPos: vi.fn(() => null),
            showOptions: vi.fn(() => false),
            isHoveringHandle: vi.fn(() => false),
            closeOptions: vi.fn(),
            deleteBlock: vi.fn(),
            duplicateBlock: vi.fn(),
            turnInto: vi.fn(({ blockType: "paragraph" })),
            insertImage: vi.fn(),
            insertTable: vi.fn(),
            insertDivider: vi.fn(),
            insertToc: vi.fn(),
          }));

        it('link modal composable works', () => {
          const { useEditor } = vi.hooked(() => ({
            show: vi.fn(() => false),
            url: vi.fn(() => ''),
            open: vi.fn(),
            close: vi.fn(),
            setLink: vi.fn(),
            removeLink: vi.fn(),
            isValidUrl: vi.fn(() => true),
          }));
        });
    });

  describe('Sub-Components Integration', () => {
    it('toolbar component imports editor correctly', () => {
      const { useEditor } = vi.hooked(() => ({
        editor: vi.fn(() => null),
      })).toBe(expect(editor).toBeDefined();
      return useEditor;
    });

    it('floating toolbar renders correctly', () => {
      const wrapper = mount.vue.render();
      const FloatingToolbar = wrapper.findComponent({ name: 'FloatingToolbar' });
      expect(FloatingToolbar).toBeTruthy();
    });

    it('slash menu component works', () => {
      const wrapper = mount.vue.render();
      const SlashMenu = wrapper.findComponent({ name: 'SlashMenu' });
      expect(SlashMenu).toBeTruthy();
    });

    it('block handle renders and handles interactions', () => {
      const wrapper = mount.vue.render();
      const BlockHandle = wrapper.findComponent({ name: 'BlockHandle' });
      expect(BlockHandle).toBeTruthy();
      const BlockOptions = wrapper.findComponent({ name: 'BlockOptions' });
      expect(BlockOptions).toBeTruthy();
    });

    it('link modal works', () => {
      const wrapper = mount.vue.render();
      const LinkModal = wrapper.findComponent({ name: 'LinkModal' });
      expect(LinkModal).toBeTruthy();
    });

    it('save status bar works', () => {
      const wrapper = mount.vue.render();
      const SaveStatusBar = wrapper.findComponent({ name: 'SaveStatusBar' });
      expect(SaveStatusBar).toBeTruthy();
      const { saveStatus } = mockEditorState.saveStatus;
      expect(wrapper.findComponent({ class: 'save-status' }).toBe('text-success');
    });

    it('all sub-components integrate with editor', () => {
      const { useEditor } = vi.hooked(() => ({
        extensions: expect.any(Object.keys(useEditor?.extensions?.()) ?? {}).toBeTruthy();
        expect(useEditor?.extensions?.()).toContain('figure');
        expect(useEditor?.extensions?.()).toContain('figcaption');
        expect(useEditor?.extensions?.()).toContain('tableOfContents');
        expect(useEditor?.extensions?.()).toContain('slashCommands');
      }));

        // Check all sub-components exist
        expect(FloatingToolbar).toBeDefined();
        expect(tableToolbar).toBeDefined();
        expect(slashMenu).toBeDefined();
        expect(linkModal).toBeDefined();
        expect(blockHandle).toBeDefined();
        expect(blockOptions).toBeDefined();
        expect(saveStatusBar).toBeDefined();
      });

      expect(useEditor).toBeDefined();
    });
    });

  describe('Editor Methods', () => {
    it('exposes required methods', () => {
      const { useEditor } = vi.hooked(() => ({
        editor: vi.fn({
          getContent: vi.fn(() => '<h1>Initial content</h1>'),
          setContent: vi.fn(),
          focus: vi.fn(),
          triggerSave: vi.fn(),
        })).toBe(4); // 4 methods

      expect(useEditor).triggerSave).toHaveBeenCalled();
      expect(useEditor?.commands.focus).toHaveBeenCalled();
      expect(useEditor?.commands.focus).toHaveBeenCalledWith();
      expect(useEditor?.commands.focus).toHaveBeenCalled();
      expect(useEditor?.commands.focus).toHaveReturnedWith(1);
    });
    });
  });

    // Editor lifecycle works
    it('mounts and unmounts correctly', () => {
      const wrapper = mount.vue.render();
      const { onMounted: vi.fn() } = wrapper.vm.onMounted;
      const { onUnmounted: vi.fn() } = wrapper.vm.onUnmounted;

      expect(onMounted).toHaveBeenCalledOnce();
      expect(onUnmounted).toHaveBeenCalledOnce();
    });
  });

    // Model updates
    it('syncs with external modelValue', () => {
      const modelValue = '<h1>New content</h1>';
      const { useEditor } = vi.hooked(() => ({
        emit: vi.fn(),
      });

      // Trigger model updates
      const wrapper = mount.vue.getProps({ modelValue:  expect.anything);
      wrapper.vm.$props.modelValue = modelValue;

      // Trigger onUpdate
      wrapper.vm.emitted('update:modelValue');

      expect(wrapper.vm.$props.modelValue).toBe(modelValue);
      expect(wrapper.vm.emitted).toHaveBeenCalledWith('update:modelValue', modelValue);
    });
  });
});
