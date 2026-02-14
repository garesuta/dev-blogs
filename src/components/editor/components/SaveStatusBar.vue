<!--
  SaveStatusBar Component

  Displays the save status with visual indicator.
-->
<script setup lang="ts">
import { type ComputedRef } from 'vue';

interface SaveStatusBarProps {
  saveStatus: ComputedRef<"idle" | "saving" | "saved" | "error">;
  lastSavedAt: ComputedRef<Date | null>;
  isDirty: ComputedRef<boolean>;
}

const props = defineProps<SaveStatusBarProps>();
</script>

<template>
  <div class="notion-status-bar">
    <small :class="[
      'spinner-border',
      'spinner-border-sm',
      'me-1',
      { 'd-none': props.saveStatus !== 'saving' }
    ]"></small>

    <span :class="[
      'text-muted',
      props.saveStatusClass
    ]">
      {{ props.saveStatusText }}
    </span>

    <small class="text-muted">
      Type <kbd>/</kbd> for commands &bull; <kbd>Ctrl</kbd>+<kbd>S</kbd> to save
    </small>
  </div>
</template>

<style scoped>
.spinner-border {
  display: inline-block;
  width: 1em;
  height: 1em;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-bottom-color: transparent;
  animation: spin 1s linear infinite;
}

.spinner-border-sm {
  width: 1em;
  height: 1em;
  border-width: 0.15em;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

:notion-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: var(--cyber-bg-tertiary);
  border-bottom: 1px solid var(--cyber-editor-divider);
}
</style>
