<!--
  SlashMenu Component

  Displays available slash commands in a floating menu.
  Filters commands based on user input.
-->
<script setup lang="ts">
import type { Ref, type ComputedRef } from 'vue';
import type { SlashCommandItem } from '../../extensions/slash-commands';

interface SlashMenuProps {
  items: ComputedRef<SlashCommandItem[]>;
  isVisible: Ref<boolean>;
  position: Ref<{ top: number; left: number }>;
  selectedIndex: Ref<number>;
}

const props = defineProps<SlashMenuProps>();

const emit = defineEmits<{
  select: [command: SlashCommandItem]: void;
  hover: [index: number]: void;
  close: [];
}>();

/**
 * Scroll selected item into view
 */
function scrollToItem(index: number): void {
  const items = document.querySelectorAll('.slash-menu-item');
  const target = items[index] as HTMLElement;
  if (target) {
    target.scrollIntoView({ block: 'nearest', inline: 'start' });
  }
}

/**
 * Handle keyboard navigation in menu
 */
function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    emit('hover', Math.min(props.selectedIndex.value + 1, props.items.value.length - 1));
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    emit('hover', Math.max(props.selectedIndex.value - 1, 0));
  } else if (event.key === 'Enter') {
    event.preventDefault();
    if (props.items.value[props.selectedIndex.value]) {
      emit('select', props.items.value[props.selectedIndex.value]);
    }
  } else if (event.key === 'Escape') {
    event.preventDefault();
    emit('close');
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="slash-menu-fade">
      <div
        v-if="props.isVisible"
        class="slash-menu"
        :style="{
          top: `${props.position.value.top}px`,
          left: `${props.position.value.left}px`
        }"
        @keydown="handleKeydown"
      >
        <div class="slash-menu-list">
          <div
            v-for="(item, index) in props.items.value"
            :key="item.title"
            class="slash-menu-item"
            :class="{ 'is-selected': index === props.selectedIndex.value }"
            @click="emit('select', item)"
            @mouseenter="emit('hover', index)"
          >
            <span class="slash-menu-icon">
              <span :class="item.icon"></span>
            </span>
            <div class="slash-menu-info">
              <span class="slash-menu-title">{{ item.title }}</span>
              <span class="slash-menu-description">{{ item.description }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.slash-menu {
  position: fixed;
  z-index: 1002;
  background: var(--cyber-bg-primary);
  border: 1px solid var(--cyber-editor-divider);
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
  max-height: 300px;
  overflow-y: auto;
  animation: slide-up 0.15s ease-out;
}

.slash-menu-list {
  padding: 0.5rem;
}

.slash-menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.1s;
}

.slash-menu-item:hover,
.slash-menu-item.is-selected {
  background: rgba(0, 255, 255, 0.15);
}

.slash-menu-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 1.25rem;
  color: var(--cyber-text-muted);
}

.slash-menu-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.slash-menu-title {
  font-weight: 600;
  color: var(--cyber-editor-text);
}

.slash-menu-description {
  font-size: 0.875rem;
  color: var(--cyber-text-muted);
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slash-menu-fade-enter-active,
.slash-menu-fade-leave-active {
  transition: all 0.15s;
}

.slash-menu-fade-enter-from,
.slash-menu-fade-leave-to {
  opacity: 0;
  transform: translateY(5px);
}

.slash-menu-fade-leave-from,
.slash-menu-fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}
</style>
