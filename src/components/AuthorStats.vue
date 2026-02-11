<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  postCount: number;
  memberSince: string;
  isPublic: boolean;
}>();

const memberDate = computed(() => {
  const date = new Date(props.memberSince);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
});
</script>

<template>
  <div class="author-stats-card">
    <h5 class="stats-title">
      <i class="bi bi-bar-chart-line me-2"></i>
      Your Stats
    </h5>

    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-value">{{ postCount }}</div>
        <div class="stat-label">Posts</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">
          <i class="bi" :class="isPublic ? 'bi-globe' : 'bi-lock'"></i>
        </div>
        <div class="stat-label">{{ isPublic ? 'Public' : 'Private' }}</div>
      </div>
    </div>

    <div class="member-since">
      <i class="bi bi-calendar-heart me-1"></i>
      Member since {{ memberDate }}
    </div>
  </div>
</template>

<style scoped>
.author-stats-card {
  background: var(--cyber-surface);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--cyber-shadow-sm);
  border: 1px solid var(--cyber-neutral-200);
  margin-bottom: 1rem;
}

.stats-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--cyber-text-secondary);
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--cyber-neutral-200);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem 0.5rem;
  background: var(--cyber-info-bg);
  border-radius: 10px;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--cyber-secondary);
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-value i {
  font-size: 1.5rem;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--cyber-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.member-since {
  text-align: center;
  font-size: 0.85rem;
  color: var(--cyber-text-muted);
  padding-top: 0.75rem;
  border-top: 1px dashed var(--cyber-neutral-200);
}

.member-since i {
  color: var(--cyber-secondary);
}
</style>
