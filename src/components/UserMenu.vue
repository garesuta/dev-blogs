<script setup lang="ts">
import { ref, onMounted } from "vue";
import { authClient } from "../lib/auth-client";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
}

const user = ref<User | null>(null);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const session = await authClient.getSession();
    if (session.data?.user) {
      user.value = session.data.user as User;
    }
  } catch (err) {
    console.error("Failed to get session:", err);
  } finally {
    isLoading.value = false;
  }
});

async function handleSignOut() {
  try {
    await authClient.signOut();
    window.location.href = "/";
  } catch (err) {
    console.error("Sign out error:", err);
  }
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
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
  <div v-if="isLoading" class="user-menu-loading">
    <span class="spinner-border spinner-border-sm" role="status"></span>
  </div>

  <div v-else-if="user" class="dropdown">
    <button
      class="btn btn-link dropdown-toggle d-flex align-items-center gap-2 text-decoration-none"
      type="button"
      data-bs-toggle="dropdown"
      aria-expanded="false"
    >
      <div v-if="user.image" class="user-avatar">
        <img :src="user.image" :alt="user.name" />
      </div>
      <div v-else class="user-avatar-placeholder">
        {{ getInitials(user.name) }}
      </div>
      <span class="d-none d-md-inline">{{ user.name }}</span>
    </button>

    <ul class="dropdown-menu dropdown-menu-end">
      <li class="dropdown-header">
        <div class="fw-bold">{{ user.name }}</div>
        <small class="text-muted">{{ user.email }}</small>
        <div class="mt-1">
          <span class="badge" :class="getRoleBadgeClass(user.role)">
            {{ user.role }}
          </span>
        </div>
      </li>
      <li><hr class="dropdown-divider" /></li>
      <li>
        <a class="dropdown-item" href="/profile">
          <i class="bi bi-person me-2"></i>Profile
        </a>
      </li>
      <li v-if="user.role === 'admin' || user.role === 'editor'">
        <a class="dropdown-item" href="/editor">
          <i class="bi bi-pencil me-2"></i>Editor
        </a>
      </li>
      <li v-if="user.role === 'admin'">
        <a class="dropdown-item" href="/admin">
          <i class="bi bi-gear me-2"></i>Admin
        </a>
      </li>
      <li><hr class="dropdown-divider" /></li>
      <li>
        <button class="dropdown-item text-danger" @click="handleSignOut">
          <i class="bi bi-box-arrow-right me-2"></i>Sign Out
        </button>
      </li>
    </ul>
  </div>

  <div v-else class="auth-links d-flex gap-2">
    <a href="/login" class="btn btn-outline-primary btn-sm">Sign In</a>
    <a href="/register" class="btn btn-primary btn-sm">Sign Up</a>
  </div>
</template>

<style scoped>
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #6c757d;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.dropdown-toggle::after {
  display: none;
}
</style>
