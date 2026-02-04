<script setup lang="ts">
import { ref, computed, reactive } from "vue";
import { authClient } from "../lib/auth-client";
import { registerSchema, getFieldError } from "../lib/validations";
import type { z } from "zod";

const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const isLoading = ref(false);
const error = ref("");
const validationErrors = ref<z.ZodIssue[]>([]);

// Track which fields have been touched (blurred)
const touched = reactive({
  name: false,
  email: false,
  password: false,
  confirmPassword: false,
});

type FieldName = "name" | "email" | "password" | "confirmPassword";

// Validate form and return result
function validate() {
  const result = registerSchema.safeParse({
    name: name.value,
    email: email.value,
    password: password.value,
    confirmPassword: confirmPassword.value,
  });
  validationErrors.value = result.success ? [] : result.error.issues;
  return result.success;
}

// Get error for a specific field (only if touched)
function getError(field: FieldName): string | undefined {
  if (!touched[field]) return undefined;
  return getFieldError(validationErrors.value, field);
}

// Computed validation state for each field
const nameError = computed(() => getError("name"));
const emailError = computed(() => getError("email"));
const passwordError = computed(() => getError("password"));
const confirmPasswordError = computed(() => getError("confirmPassword"));

const isValid = computed(() => {
  const result = registerSchema.safeParse({
    name: name.value,
    email: email.value,
    password: password.value,
    confirmPassword: confirmPassword.value,
  });
  return result.success;
});

// Handle field blur - mark as touched and validate
function handleBlur(field: FieldName) {
  touched[field] = true;
  validate();
}

async function handleSubmit() {
  // Mark all fields as touched on submit
  touched.name = true;
  touched.email = true;
  touched.password = true;
  touched.confirmPassword = true;

  if (!validate()) return;

  isLoading.value = true;
  error.value = "";

  try {
    const result = await authClient.signUp.email({
      name: name.value,
      email: email.value,
      password: password.value,
    });

    if (result.error) {
      error.value = result.error.message || "Registration failed";
    } else {
      // Success - redirect to home page
      if (typeof window !== "undefined") window.location.href = "/";
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
        :class="{
          'is-invalid': nameError,
          'is-valid': touched.name && !nameError && name,
        }"
        id="name"
        v-model="name"
        autocomplete="name"
        :disabled="isLoading"
        @blur="handleBlur('name')"
      />
      <div v-if="nameError" class="invalid-feedback">
        {{ nameError }}
      </div>
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
        autocomplete="new-password"
        :disabled="isLoading"
        @blur="handleBlur('password')"
      />
      <div v-if="passwordError" class="invalid-feedback">
        {{ passwordError }}
      </div>
      <div class="form-text">Minimum 8 characters</div>
    </div>

    <div class="mb-3">
      <label for="confirmPassword" class="form-label">Confirm Password</label>
      <input
        type="password"
        class="form-control"
        :class="{
          'is-invalid': confirmPasswordError,
          'is-valid': touched.confirmPassword && !confirmPasswordError && confirmPassword,
        }"
        id="confirmPassword"
        v-model="confirmPassword"
        autocomplete="new-password"
        :disabled="isLoading"
        @blur="handleBlur('confirmPassword')"
      />
      <div v-if="confirmPasswordError" class="invalid-feedback">
        {{ confirmPasswordError }}
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
