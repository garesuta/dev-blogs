<!--
  LinkModal Component

  Modal for inserting/editing links with protocol validation.
  Uses Teleport to render at body level for proper z-index stacking.
-->
<script setup lang="ts">
import { ref, computed, type Ref, watch, onUnmounted } from 'vue';
import type { Editor } from '@tiptap/core';

interface LinkModalProps {
  isVisible: Ref<boolean>;
  currentUrl: Ref<string>;
  isLinkActive: Ref<boolean>;
}

const props = defineProps<LinkModalProps>();

const emit = defineEmits<{
  confirm: [url: string]: void;
  remove: [];
  close: [];
}>();

const urlInput = ref(props.currentUrl.value);

// Sync input when currentUrl changes
watch(() => props.currentUrl.value, (newUrl) => {
  urlInput.value = newUrl;
});

/**
 * Handle Enter key in input
 */
function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter') {
    event.preventDefault();
    handleConfirm();
  } else if (event.key === 'Escape') {
    emit('close');
  }
}

/**
 * Confirm and insert link
 */
function handleConfirm(): void {
  const url = urlInput.value.trim();
  emit('confirm', url);
}

/**
 * Remove current link
 */
function handleRemove(): void {
  emit('remove');
  emit('close');
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="props.isVisible.value"
        class="link-modal-backdrop"
        @click.self="emit('close')"
      >
        <div class="link-modal" @click.stop>
          <div class="link-modal-header">
            <h3 class="link-modal-title">Insert Link</h3>
            <button type="button" class="link-modal-close" @click="emit('close')">
              <span class="bi-x-lg"></span>
            </button>
          </div>

          <div class="link-modal-body">
            <div class="mb-3">
              <label for="link-url" class="form-label">URL</label>
              <input
                id="link-url"
                ref="urlInput"
                v-model="urlInput"
                type="text"
                class="form-input"
                placeholder="https://example.com"
                @keydown="handleKeydown"
              />
            </div>

            <div class="link-modal-actions">
              <button
                type="button"
                class="btn btn-primary"
                :disabled="!urlInput.trim()"
                @click="handleConfirm"
              >
                Insert
              </button>

              <button
                v-if="props.isLinkActive.value"
                type="button"
                class="btn btn-outline-danger"
                @click="handleRemove"
              >
                Remove Link
              </button>

              <button
                type="button"
                class="btn btn-secondary"
                @click="emit('close')"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.link-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.link-modal {
  background: var(--cyber-bg-primary);
  border: 1px solid var(--cyber-editor-divider);
  border-radius: 12px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 450px;
}

.link-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1rem;
  border-bottom: 1px solid var(--cyber-editor-divider);
}

.link-modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: var(--cyber-editor-text);
}

.link-modal-close {
  background: transparent;
  border: none;
  color: var(--cyber-text-muted);
  cursor: pointer;
  padding: 0.375rem;
  border-radius: 4px;
  transition: all 0.15s;
}

.link-modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--cyber-editor-text);
}

.link-modal-body {
  padding: 1rem 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--cyber-editor-text);
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--cyber-neutral-300);
  border-radius: 4px;
  font-size: 0.95rem;
  background: var(--cyber-bg-secondary);
  color: var(--cyber-editor-text);
  transition: all 0.15s;
}

.form-input:focus {
  outline: none;
  border-color: var(--cyber-accent);
  box-shadow: 0 0 0 3px rgba(var(--cyber-accent), 0.2);
}

.link-modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  border: none;
  font-size: 0.95rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--cyber-accent);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  filter: brightness(1.1);
}

.btn-outline-danger {
  background: transparent;
  border: 1px solid var(--cyber-danger);
  color: var(--cyber-danger);
}

.btn-outline-danger:hover {
  background: var(--cyber-danger);
  color: white;
}

.btn-secondary {
  background: var(--cyber-neutral-200);
  color: var(--cyber-editor-text);
}

.btn-secondary:hover {
  background: var(--cyber-neutral-300);
}

@keyframes modal-fade {
  from {
    opacity: 0;
  transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.2s ease-out;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.modal-fade-leave-from,
.modal-fade-enter-to {
  opacity: 1;
  transform: scale(1);
}
</style>
