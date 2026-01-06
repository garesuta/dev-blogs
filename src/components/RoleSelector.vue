<script setup lang="ts">
import { ref } from "vue";
import { authClient } from "../lib/auth-client";
import { availableRoles, getRoleDisplayName } from "../lib/permissions";
import type { UserRole } from "../lib/schema";

interface Props {
  userId: string;
  currentRole: UserRole;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "roleChanged", role: UserRole): void;
}>();

const selectedRole = ref<UserRole>(props.currentRole);
const isLoading = ref(false);
const error = ref("");
const success = ref(false);

async function handleRoleChange() {
  if (selectedRole.value === props.currentRole) return;

  isLoading.value = true;
  error.value = "";
  success.value = false;

  try {
    await authClient.admin.setRole({
      userId: props.userId,
      role: selectedRole.value,
    });

    success.value = true;
    emit("roleChanged", selectedRole.value);

    setTimeout(() => {
      success.value = false;
    }, 2000);
  } catch (err) {
    error.value = "Failed to update role";
    console.error("Role update error:", err);
    selectedRole.value = props.currentRole;
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="role-selector d-flex align-items-center gap-2">
    <select
      v-model="selectedRole"
      class="form-select form-select-sm"
      :disabled="isLoading"
      @change="handleRoleChange"
    >
      <option v-for="role in availableRoles" :key="role" :value="role">
        {{ getRoleDisplayName(role) }}
      </option>
    </select>

    <span v-if="isLoading" class="spinner-border spinner-border-sm"></span>
    <span v-if="success" class="text-success">
      <i class="bi bi-check-circle"></i>
    </span>
    <span v-if="error" class="text-danger small">{{ error }}</span>
  </div>
</template>

<style scoped>
.role-selector {
  min-width: 150px;
}

.form-select-sm {
  width: auto;
}
</style>
