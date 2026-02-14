<!--
  BlockHandle Component

  Displays the + button for adding blocks and ⋮ button for block options.
  Positioned relative to the block being edited.
-->
<script setup lang="ts">
import type { Ref } from 'vue';

interface BlockHandleProps {
  isVisible: Ref<boolean>;
  position: Ref<{ top: number }>;
}

const props = defineProps<BlockHandleProps>();

const emit = defineEmits<{
  addBlock: [];
  toggleOptions: [];
}>();
</script>

<template>
  <Transition name="block-handle-fade">
    <div
      v-if="props.isVisible.value"
      class="block-handle-wrapper"
      :style="{ top: `${props.position.value.top}px` }"
    >
      <div class="block-handle">
        <button
          type="button"
          class="block-handle-button block-handle-add"
          @click="emit('addBlock')"
          title="Add block"
        >
          <span class="bi-plus-lg"></span>
        </button>

        <button
          type="button"
          class="block-handle-button block-handle-dots"
          @click="emit('toggleOptions')"
          title="Block options"
        >
          <span class="bi-three-dots-vertical"></span>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.block-handle-wrapper {
  position: fixed;
  left: 24px;
  z-index: 1003;
  animation: slide-in 0.1s ease-out;
}

.block-handle {
  background: var(--cyber-bg-primary);
  border: 1px solid var(--cyber-editor-divider);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  padding: 0.25rem;
}

.block-handle-button {
  background: transparent;
  border: none;
  color: var(--cyber-text-muted);
  padding: 0.375rem;
  cursor: pointer;
  border-radius: 3px;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.block-handle-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--cyber-editor-text);
}

.block-handle-add {
  margin-right: 0.25rem;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(-5px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.block-handle-fade-enter-active,
.block-handle-fade-leave-active {
  transition: all 0.15s ease-out;
}

.block-handle-fade-enter-from,
.block-handle-fade-leave-to {
  opacity: 0;
  transform: translateX(-5px);
}

.block-handle-fade-leave-from,
.block-handle-fade-enter-to {
  opacity: 1;
  transform: translateX(0);
}
</style>
