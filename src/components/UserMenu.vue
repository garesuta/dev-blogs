<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
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

const isInEditorArea = computed(() => {
  if (typeof window === "undefined") return false;
  return window.location.pathname.startsWith("/editor");
});

const isAdminOrEditor = computed(() => {
  const role = user.value?.role?.toLowerCase();
  return role === "admin" || role === "editor";
});

const isAdmin = computed(() => {
  return user.value?.role?.toLowerCase() === "admin";
});

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
  switch (role?.toLowerCase()) {
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

  <div v-else-if="user" class="user-menu-container">
    <!-- CMS Button for Admin/Editor (hidden when already in editor) -->
    <a
      v-if="isAdminOrEditor && !isInEditorArea"
      href="/editor/posts"
      class="btn-cms"
      title="Open Content Management"
    >
      <i class="bi bi-pencil-square"></i>
      <span>CMS</span>
    </a>

    <!-- User Dropdown -->
    <div class="dropdown">
      <button
        class="user-trigger"
        type="button"
        data-bs-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
      >
        <span class="user-trigger__name d-none d-md-inline">{{ user.name }}</span>
        <div v-if="user.image" class="user-trigger__avatar">
          <img :src="user.image" :alt="user.name" />
        </div>
        <div v-else class="user-trigger__avatar">
          {{ getInitials(user.name) }}
        </div>
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
        <li v-if="isAdminOrEditor">
          <a class="dropdown-item" href="/editor">
            <i class="bi bi-pencil me-2"></i>Editor
          </a>
        </li>
        <li v-if="isAdmin">
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
  </div>

  <div v-else class="auth-buttons">
    <a href="/login" class="btn-auth-signin">Sign In</a>
    <a href="/register" class="btn-auth-signup">Sign Up</a>
  </div>
</template>

<style scoped>
.user-menu-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* --- CMS Button --- */
.btn-cms {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.2);
  border-radius: 8px;
  color: var(--cyber-primary);
  text-decoration: none;
  font-size: 0.8125rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-cms:hover {
  background: rgba(0, 255, 136, 0.15);
  border-color: var(--cyber-primary);
  color: var(--cyber-primary);
}

/* --- User Trigger (pill) --- */
.user-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 4px 4px 12px;
  background: transparent;
  border: 1px solid var(--cyber-border-color, rgba(0, 255, 136, 0.1));
  border-radius: 24px;
  color: var(--cyber-text-primary, #e0e6ed);
  cursor: pointer;
  transition: border-color 0.2s;
  text-decoration: none;
}

.user-trigger:hover {
  border-color: var(--cyber-border-hover, rgba(0, 255, 136, 0.3));
}

.user-trigger__name {
  font-size: 0.8125rem;
  font-weight: 500;
}

.user-trigger__avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--cyber-gradient-primary, linear-gradient(135deg, #00ff88, #00d9ff));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: #000;
  overflow: hidden;
}

.user-trigger__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dropdown-toggle::after {
  display: none;
}

/* --- Auth Buttons --- */
.auth-buttons {
  display: flex;
  gap: 8px;
}

.btn-auth-signin {
  padding: 6px 14px;
  border: 1px solid var(--cyber-border-color, rgba(0, 255, 136, 0.1));
  border-radius: 8px;
  background: transparent;
  color: var(--cyber-text-primary, #e0e6ed);
  text-decoration: none;
  font-size: 0.8125rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-auth-signin:hover {
  border-color: var(--cyber-primary, #00ff88);
  color: var(--cyber-primary, #00ff88);
}

.btn-auth-signup {
  padding: 6px 14px;
  border: none;
  border-radius: 8px;
  background: var(--cyber-gradient-primary, linear-gradient(135deg, #00ff88, #00d9ff));
  color: #000;
  text-decoration: none;
  font-size: 0.8125rem;
  font-weight: 600;
  transition: opacity 0.2s;
}

.btn-auth-signup:hover {
  opacity: 0.9;
  color: #000;
}

@media (max-width: 575px) {
  .btn-cms span {
    display: none;
  }
}
</style>
