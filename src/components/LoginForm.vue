<script setup lang="ts">
import { ref, computed, reactive } from "vue";
import { authClient } from "../lib/auth-client";
import { loginSchema, getFieldError } from "../lib/validations";
import type { z } from "zod";

const email = ref("");
const password = ref("");
const isLoading = ref(false);
const error = ref("");
const validationErrors = ref<z.ZodIssue[]>([]);

// Track which fields have been touched (blurred)
const touched = reactive({
  email: false,
  password: false,
});

// Validate form and return result
function validate() {
  const result = loginSchema.safeParse({
    email: email.value,
    password: password.value,
  });
  validationErrors.value = result.success ? [] : result.error.issues;
  return result.success;
}

// Get error for a specific field (only if touched)
function getError(field: "email" | "password"): string | undefined {
  if (!touched[field]) return undefined;
  return getFieldError(validationErrors.value, field);
}

// Computed validation state for each field
const emailError = computed(() => getError("email"));
const passwordError = computed(() => getError("password"));

const isValid = computed(() => {
  const result = loginSchema.safeParse({
    email: email.value,
    password: password.value,
  });
  return result.success;
});

// Handle field blur - mark as touched and validate
function handleBlur(field: "email" | "password") {
  touched[field] = true;
  validate();
}

async function handleSubmit() {
  // Mark all fields as touched on submit
  touched.email = true;
  touched.password = true;

  if (!validate()) return;

  isLoading.value = true;
  error.value = "";

  try {
    const result = await authClient.signIn.email({
      email: email.value,
      password: password.value,
    });

    if (result.error) {
      error.value = result.error.message || "Sign in failed";
    } else {
      // Success - redirect to home or requested page
      window.location.href = getRedirectUrl();
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
        :class="{
          'is-invalid': emailError,
          'is-valid': touched.email && !emailError && email,
        }"
        id="email"
        v-model="email"
        autocomplete="email"
        :disabled="isLoading"
        @blur="handleBlur('email')"
      />
      <div v-if="emailError" class="invalid-feedback">
        {{ emailError }}
      </div>
    </div>

    <div class="mb-3">
      <label for="password" class="form-label">Password</label>
      <input
        type="password"
        class="form-control"
        :class="{
          'is-invalid': passwordError,
          'is-valid': touched.password && !passwordError && password,
        }"
        id="password"
        v-model="password"
        autocomplete="current-password"
        :disabled="isLoading"
        @blur="handleBlur('password')"
      />
      <div v-if="passwordError" class="invalid-feedback">
        {{ passwordError }}
      </div>
      <div class="form-text">Minimum 8 characters</div>
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
