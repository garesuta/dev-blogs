<script setup lang="ts">
import { ref, computed } from "vue";
import { authClient } from "../lib/auth-client";

const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const isLoading = ref(false);
const error = ref("");

const passwordsMatch = computed(() => {
  return password.value === confirmPassword.value;
});

const isValid = computed(() => {
  return (
    name.value.length > 0 &&
    email.value.length > 0 &&
    password.value.length >= 8 &&
    passwordsMatch.value
  );
});

async function handleSubmit() {
  if (!isValid.value) return;

  isLoading.value = true;
  error.value = "";

  try {
    const result = await authClient.signUp.email({
      name: name.value,
      email: email.value,
      password: password.value,
      callbackURL: "/",
    });

    if (result.error) {
      error.value = result.error.message || "Registration failed";
    }
  } catch (err) {
    error.value = "An unexpected error occurred";
    console.error("Sign up error:", err);
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="register-form">
    <div v-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>

    <div class="mb-3">
      <label for="name" class="form-label">Full Name</label>
      <input
        type="text"
        class="form-control"
        id="name"
        v-model="name"
        required
        autocomplete="name"
        :disabled="isLoading"
      />
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
        autocomplete="new-password"
        :disabled="isLoading"
      />
      <div class="form-text">Minimum 8 characters</div>
    </div>

    <div class="mb-3">
      <label for="confirmPassword" class="form-label">Confirm Password</label>
      <input
        type="password"
        class="form-control"
        :class="{ 'is-invalid': confirmPassword && !passwordsMatch }"
        id="confirmPassword"
        v-model="confirmPassword"
        required
        autocomplete="new-password"
        :disabled="isLoading"
      />
      <div v-if="confirmPassword && !passwordsMatch" class="invalid-feedback">
        Passwords do not match
      </div>
    </div>

    <button
      type="submit"
      class="btn btn-primary w-100"
      :disabled="!isValid || isLoading"
    >
      <span v-if="isLoading">
        <span class="spinner-border spinner-border-sm me-2" role="status"></span>
        Creating account...
      </span>
      <span v-else>Create Account</span>
    </button>
  </form>
</template>

<style scoped>
.register-form {
  max-width: 400px;
  margin: 0 auto;
}
</style>
