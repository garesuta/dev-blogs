<script setup lang="ts">
import { ref, onMounted } from "vue";
import { authClient } from "../lib/auth-client";
import { availableRoles, getRoleDisplayName } from "../lib/permissions";
import type { UserRole } from "../lib/schema";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  banned: boolean;
  createdAt: string;
}

const users = ref<User[]>([]);
const isLoading = ref(true);
const error = ref("");
const updatingUserId = ref<string | null>(null);

onMounted(async () => {
  await loadUsers();
});

async function loadUsers() {
  isLoading.value = true;
  error.value = "";

  try {
    const result = await authClient.admin.listUsers({
      query: {
        limit: 100,
        sortBy: "createdAt",
        sortDirection: "desc",
      },
    });

    if (result.data?.users) {
      users.value = result.data.users as User[];
    }
  } catch (err) {
    error.value = "Failed to load users";
    console.error("Load users error:", err);
  } finally {
    isLoading.value = false;
  }
}

async function updateRole(userId: string, newRole: UserRole) {
  updatingUserId.value = userId;

  try {
    await authClient.admin.setRole({
      userId,
      role: newRole,
    });

    const user = users.value.find((u) => u.id === userId);
    if (user) {
      user.role = newRole;
    }
  } catch (err) {
    error.value = "Failed to update role";
    console.error("Update role error:", err);
  } finally {
    updatingUserId.value = null;
  }
}

async function toggleBan(user: User) {
  updatingUserId.value = user.id;

  try {
    if (user.banned) {
      await authClient.admin.unbanUser({ userId: user.id });
      user.banned = false;
    } else {
      await authClient.admin.banUser({
        userId: user.id,
        banReason: "Banned by admin",
      });
      user.banned = true;
    }
  } catch (err) {
    error.value = "Failed to update ban status";
    console.error("Toggle ban error:", err);
  } finally {
    updatingUserId.value = null;
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getRoleBadgeClass(role: string): string {
  switch (role) {
    case "admin":
      return "bg-danger";
    case "editor":
      return "bg-warning text-dark";
    default:
      return "bg-secondary";
  }
}
</script>

<template>
  <div class="user-list">
    <div v-if="error" class="alert alert-danger" role="alert">
      {{ error }}
      <button type="button" class="btn-close" @click="error = ''"></button>
    </div>

    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="users.length === 0" class="text-center py-5 text-muted">
      No users found
    </div>

    <div v-else class="table-responsive">
      <table class="table table-hover align-middle">
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>
              <div class="d-flex align-items-center gap-2">
                <div v-if="user.image" class="user-avatar">
                  <img :src="user.image" :alt="user.name" />
                </div>
                <div v-else class="user-avatar-placeholder">
                  {{ user.name.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <div class="fw-medium">{{ user.name }}</div>
                  <small class="text-muted">{{ user.email }}</small>
                </div>
              </div>
            </td>
            <td>
              <select
                class="form-select form-select-sm"
                :value="user.role"
                @change="updateRole(user.id, ($event.target as HTMLSelectElement).value as UserRole)"
                :disabled="updatingUserId === user.id"
                style="width: 120px"
              >
                <option v-for="role in availableRoles" :key="role" :value="role">
                  {{ getRoleDisplayName(role) }}
                </option>
              </select>
            </td>
            <td>
              <span v-if="user.banned" class="badge bg-danger">Banned</span>
              <span v-else class="badge bg-success">Active</span>
            </td>
            <td>
              <small>{{ formatDate(user.createdAt) }}</small>
            </td>
            <td>
              <button
                class="btn btn-sm"
                :class="user.banned ? 'btn-outline-success' : 'btn-outline-danger'"
                @click="toggleBan(user)"
                :disabled="updatingUserId === user.id"
              >
                <span v-if="updatingUserId === user.id" class="spinner-border spinner-border-sm"></span>
                <span v-else>{{ user.banned ? "Unban" : "Ban" }}</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--cyber-avatar-bg);
  color: var(--cyber-avatar-text);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}
</style>
