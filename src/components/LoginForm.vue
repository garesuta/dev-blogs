<script setup lang="ts">
import { ref, computed } from "vue";
import { authClient } from "../lib/auth-client";

const email = ref("");
const password = ref("");
const isLoading = ref(false);
const error = ref("");

const isValid = computed(() => {
  return email.value.length > 0 && password.value.length >= 8;
});

async function handleSubmit() {
  if (!isValid.value) return;

  isLoading.value = true;
  error.value = "";

  try {
    const result = await authClient.signIn.email({
      email: email.value,
      password: password.value,
      callbackURL: getRedirectUrl(),
    });

    if (result.error) {
      error.value = result.error.message || "Sign in failed";
    }
  } catch (err) {
    error.value = "An unexpected error occurred";
    console.error("Sign in error:", err);
  } finally {
    isLoading.value = false;
  }
}

function getRedirectUrl(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get("redirect") || "/";
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="login-form">
    <div v-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>

    <div class="mb-3">
      <label for="email" class="form-label">Email address</label>
      <input
        type="email"
        class="form-control"
        id="email"
        v-model="email"
        required
        autocomplete="email"
        :disabled="isLoading"
      />
    </div>

    <div class="mb-3">
      <label for="password" class="form-label">Password</label>
      <input
        type="password"
        class="form-control"
        id="password"
        v-model="password"
        required
        minlength="8"
        autocomplete="current-password"
        :disabled="isLoading"
      />
    </div>

    <button
      type="submit"
      class="btn btn-primary w-100"
      :disabled="!isValid || isLoading"
    >
      <span v-if="isLoading">
        <span class="spinner-border spinner-border-sm me-2" role="status"></span>
        Signing in...
      </span>
      <span v-else>Sign In</span>
    </button>
  </form>
</template>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 0 auto;
}
</style>
