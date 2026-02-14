/**
 * useLinkModal Composable
 *
 * Manages link insertion and removal with protocol validation.
 *
 * Security: Strict protocol whitelist prevents javascript: and data: injection
 */

import { ref, type Ref } from 'vue';
import type { Editor } from '@tiptap/core';

/**
 * Allowed URI protocols for links
 * SECURITY: Only safe protocols allowed to prevent XSS
 */
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:', '#']);

/**
 * Regex pattern for valid protocols
 */
const PROTOCOL_PATTERN = /^([a-z][a-z0-9+\-.]*):/i;

interface UseLinkModalOptions {
  editor: Ref<Editor | null>;
}

interface LinkModalReturn {
  show: Ref<boolean>;
  url: Ref<string>;
  open: () => void;
  close: () => void;
  setLink: (url: string) => void;
  removeLink: () => void;
  isValidUrl: (url: string) => boolean;
}

/**
 * Validate URL protocol
 * SECURITY: Only allows safe protocols, rejects dangerous ones
 */
export function isValidProtocol(url: string): boolean {
  if (!url || url.startsWith('#')) {
    return true; // Internal anchors are always valid
  }

  const match = url.match(PROTOCOL_PATTERN);
  if (!match) return false;

  const protocol = match[1].toLowerCase();
  return ALLOWED_PROTOCOLS.has(protocol);
}

/**
 * Validate URL is safe for link insertion
 */
export function isValidUrl(url: string): boolean {
  if (!url) return false;

  // Check protocol first (most common attack vector)
  if (!isValidProtocol(url)) {
    return false;
  }

  // Basic URL format check
  try {
    // Handle internal anchors
    if (url.startsWith('#')) {
      return url.length > 1; // At least "#a"
    }

    // For external URLs, try to parse
    if (url.startsWith('http')) {
      new URL(url);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract protocol from URL for display
 */
function getProtocolFromUrl(url: string): string | null {
  if (url.startsWith('#')) return null;
  const match = url.match(PROTOCOL_PATTERN);
  return match ? match[1] : null;
}

export function useLinkModal(options: UseLinkModalOptions): LinkModalReturn {
  const { editor } = options;

  const show = ref(false);
  const url = ref("");

  /**
   * Open link modal with current link URL if available
   */
  function open(): void {
    if (!editor.value) return;

    const previousUrl = editor.value.getAttributes("link").href || "";
    url.value = previousUrl;
    show.value = true;
  }

  /**
   * Close link modal
   */
  function close(): void {
    show.value = false;
    url.value = "";
  }

  /**
   * Set link with protocol validation
   * SECURITY: Validates protocol before insertion
   */
  function setLink(linkUrl: string): void {
    if (!editor.value) return;

    // SECURITY: Validate URL before insertion
    if (!isValidUrl(linkUrl)) {
      const protocol = getProtocolFromUrl(linkUrl);
      const errorMsg = protocol
        ? `Protocol "${protocol}" is not allowed. Use http, https, mailto, tel, or internal anchors (#).`
        : "Invalid URL format";
      alert(errorMsg);
      return;
    }

    if (linkUrl) {
      editor.value.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
    } else {
      editor.value.chain().focus().extendMarkRange("link").unsetLink().run();
    }

    close();
  }

  /**
   * Remove link from current selection
   */
  function removeLink(): void {
    if (!editor.value) return;

    editor.value.chain().focus().extendMarkRange("link").unsetLink().run();
    close();
  }

  return {
    show,
    url,
    open,
    close,
    setLink,
    removeLink,
    isValidUrl,
  };
}
