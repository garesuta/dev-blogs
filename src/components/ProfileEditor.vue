<script setup lang="ts">
import { ref, computed } from "vue";

const props = defineProps<{
  initialNickname: string | null;
  initialBio: string | null;
  initialWebsite: string | null;
  initialTwitter: string | null;
  initialGithub: string | null;
  initialLinkedin: string | null;
  initialIsPublic: boolean | null;
}>();

const nickname = ref(props.initialNickname || "");
const bio = ref(props.initialBio || "");
const website = ref(props.initialWebsite || "");
const twitter = ref(props.initialTwitter || "");
const github = ref(props.initialGithub || "");
const linkedin = ref(props.initialLinkedin || "");
const isPublic = ref(props.initialIsPublic || false);

const isSaving = ref(false);
const message = ref<{ type: "success" | "error"; text: string } | null>(null);

// Validation patterns
const usernamePattern = /^[a-zA-Z0-9_]*$/;
const nicknamePattern = /^[a-zA-Z0-9_\s\-]*$/;
const urlPattern = /https?:\/\/[^\s]+/gi;

// Nickname validation
const nicknameError = computed(() => {
  if (!nickname.value) return null;
  const trimmed = nickname.value.trim();
  if (trimmed !== nickname.value) {
    return "Remove leading or trailing spaces";
  }
  if (trimmed.length < 2) {
    return "Nickname must be at least 2 characters";
  }
  if (trimmed.length > 50) {
    return "Nickname must be 50 characters or less";
  }
  if (!nicknamePattern.test(trimmed)) {
    return "Only letters, numbers, spaces, underscores, and hyphens allowed";
  }
  return null;
});

// Bio validation
const bioError = computed(() => {
  if (!bio.value) return null;
  if (bio.value.length > 0 && bio.value.length < 10) {
    return "Bio must be at least 10 characters if provided";
  }
  if (bio.value.length > 500) {
    return "Bio must be 500 characters or less";
  }
  if (urlPattern.test(bio.value)) {
    return "URLs are not allowed in bio";
  }
  return null;
});

// Website validation
const websiteError = computed(() => {
  if (!website.value) return null;
  try {
    const url = new URL(website.value);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return "URL must start with http:// or https://";
    }
    return null;
  } catch {
    return "Please enter a valid URL (e.g., https://example.com)";
  }
});

// Twitter validation
const twitterError = computed(() => {
  if (!twitter.value) return null;
  if (!usernamePattern.test(twitter.value)) {
    return "Only letters, numbers, and underscores allowed";
  }
  if (twitter.value.length < 1) {
    return "Username must be at least 1 character";
  }
  if (twitter.value.length > 15) {
    return "Twitter username must be 15 characters or less";
  }
  return null;
});

// GitHub validation
const githubError = computed(() => {
  if (!github.value) return null;
  if (!usernamePattern.test(github.value)) {
    return "Only letters, numbers, and underscores allowed";
  }
  if (github.value.length < 1) {
    return "Username must be at least 1 character";
  }
  if (github.value.length > 39) {
    return "GitHub username must be 39 characters or less";
  }
  return null;
});

// LinkedIn validation
const linkedinError = computed(() => {
  if (!linkedin.value) return null;
  const linkedinPattern = /^[a-zA-Z0-9\-]*$/;
  if (!linkedinPattern.test(linkedin.value)) {
    return "Only letters, numbers, and hyphens allowed";
  }
  if (linkedin.value.length < 3) {
    return "LinkedIn username must be at least 3 characters";
  }
  if (linkedin.value.length > 100) {
    return "LinkedIn username must be 100 characters or less";
  }
  return null;
});

const hasValidationErrors = computed(() => {
  return !!(
    nicknameError.value ||
    bioError.value ||
    websiteError.value ||
    twitterError.value ||
    githubError.value ||
    linkedinError.value
  );
});

async function saveProfile() {
  if (hasValidationErrors.value) {
    message.value = { type: "error", text: "Please fix the validation errors before saving" };
    return;
  }

  isSaving.value = true;
  message.value = null;

  try {
    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nickname: nickname.value || null,
        bio: bio.value || null,
        website: website.value || null,
        twitter: twitter.value || null,
        github: github.value || null,
        linkedin: linkedin.value || null,
        isPublic: isPublic.value,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to save profile");
    }

    message.value = { type: "success", text: "Profile updated successfully!" };
    setTimeout(() => {
      message.value = null;
    }, 3000);
  } catch (error) {
    message.value = {
      type: "error",
      text: error instanceof Error ? error.message : "Failed to save profile",
    };
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <div class="profile-editor">
    <h5 class="editor-title">
      <i class="bi bi-pencil-square me-2"></i>
      Edit Profile
    </h5>

    <!-- Success/Error Toast -->
    <transition name="slide-fade">
      <div v-if="message" :class="['toast-message', message.type]">
        <i :class="message.type === 'success' ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-circle-fill'"></i>
        {{ message.text }}
      </div>
    </transition>

    <form @submit.prevent="saveProfile">
      <!-- Display Name -->
      <div class="form-group">
        <label for="nickname" class="form-label-custom">
          <i class="bi bi-person-badge me-1"></i>
          Display Name
        </label>
        <p class="form-description">
          This name will be shown on your blog posts and public profile.
        </p>
        <div class="input-wrapper">
          <input
            id="nickname"
            v-model="nickname"
            type="text"
            class="form-input"
            :class="{ 'input-error': nicknameError }"
            placeholder="Enter a display name..."
            maxlength="50"
          />
          <span class="char-counter" :class="{ 'near-limit': nickname.length > 40 }">
            {{ nickname.length }}/50
          </span>
        </div>
        <p v-if="nicknameError" class="form-error">
          <i class="bi bi-exclamation-triangle me-1"></i>
          {{ nicknameError }}
        </p>
        <p v-else class="form-hint">
          <i class="bi bi-info-circle me-1"></i>
          Leave empty to use your account name instead.
        </p>
      </div>

      <!-- Bio -->
      <div class="form-group">
        <label for="bio" class="form-label-custom">
          <i class="bi bi-file-text me-1"></i>
          Bio
        </label>
        <p class="form-description">
          Tell readers a bit about yourself.
        </p>
        <div class="input-wrapper textarea-wrapper">
          <textarea
            id="bio"
            v-model="bio"
            class="form-input form-textarea"
            :class="{ 'input-error': bioError }"
            placeholder="Write a short bio about yourself..."
            maxlength="500"
            rows="4"
          ></textarea>
          <span class="char-counter textarea-counter" :class="{ 'near-limit': bio.length > 450 }">
            {{ bio.length }}/500
          </span>
        </div>
        <p v-if="bioError" class="form-error">
          <i class="bi bi-exclamation-triangle me-1"></i>
          {{ bioError }}
        </p>
      </div>

      <!-- Social Links Section -->
      <div class="form-section">
        <h6 class="section-title">
          <i class="bi bi-share me-2"></i>
          Social Links
        </h6>
        <p class="section-description">
          Add your social profiles to help readers connect with you.
        </p>

        <!-- Website -->
        <div class="form-group">
          <label for="website" class="form-label-custom form-label-small">
            <i class="bi bi-globe me-1"></i>
            Website
          </label>
          <div class="input-wrapper">
            <input
              id="website"
              v-model="website"
              type="url"
              class="form-input"
              :class="{ 'input-error': websiteError }"
              placeholder="https://yourwebsite.com"
            />
          </div>
          <p v-if="websiteError" class="form-error">
            <i class="bi bi-exclamation-triangle me-1"></i>
            {{ websiteError }}
          </p>
        </div>

        <!-- Twitter -->
        <div class="form-group">
          <label for="twitter" class="form-label-custom form-label-small">
            <i class="bi bi-twitter-x me-1"></i>
            Twitter / X
          </label>
          <div class="input-wrapper input-with-prefix">
            <span class="input-prefix">@</span>
            <input
              id="twitter"
              v-model="twitter"
              type="text"
              class="form-input with-prefix"
              :class="{ 'input-error': twitterError }"
              placeholder="username"
            />
          </div>
          <p v-if="twitterError" class="form-error">
            <i class="bi bi-exclamation-triangle me-1"></i>
            {{ twitterError }}
          </p>
        </div>

        <!-- GitHub -->
        <div class="form-group">
          <label for="github" class="form-label-custom form-label-small">
            <i class="bi bi-github me-1"></i>
            GitHub
          </label>
          <div class="input-wrapper input-with-prefix">
            <span class="input-prefix">github.com/</span>
            <input
              id="github"
              v-model="github"
              type="text"
              class="form-input with-prefix"
              :class="{ 'input-error': githubError }"
              placeholder="username"
            />
          </div>
          <p v-if="githubError" class="form-error">
            <i class="bi bi-exclamation-triangle me-1"></i>
            {{ githubError }}
          </p>
        </div>

        <!-- LinkedIn -->
        <div class="form-group">
          <label for="linkedin" class="form-label-custom form-label-small">
            <i class="bi bi-linkedin me-1"></i>
            LinkedIn
          </label>
          <div class="input-wrapper input-with-prefix">
            <span class="input-prefix">linkedin.com/in/</span>
            <input
              id="linkedin"
              v-model="linkedin"
              type="text"
              class="form-input with-prefix"
              :class="{ 'input-error': linkedinError }"
              placeholder="username"
            />
          </div>
          <p v-if="linkedinError" class="form-error">
            <i class="bi bi-exclamation-triangle me-1"></i>
            {{ linkedinError }}
          </p>
        </div>
      </div>

      <!-- Privacy Section -->
      <div class="form-section">
        <h6 class="section-title">
          <i class="bi bi-shield-lock me-2"></i>
          Privacy
        </h6>

        <div class="toggle-group">
          <div class="toggle-info">
            <span class="toggle-label">Public Profile</span>
            <p class="toggle-description">
              When enabled, other users can view your profile and published posts at your public author page.
            </p>
          </div>
          <label class="toggle-switch">
            <input
              type="checkbox"
              v-model="isPublic"
            />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div class="form-actions">
        <button
          type="submit"
          class="save-btn"
          :disabled="isSaving || hasValidationErrors"
        >
          <span v-if="isSaving" class="btn-content">
            <span class="spinner"></span>
            Saving...
          </span>
          <span v-else class="btn-content">
            <i class="bi bi-check-lg"></i>
            Save Changes
          </span>
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.profile-editor {
  padding: 0;
}

.editor-title {
  font-size: 1rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e9ecef;
}

.toast-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.toast-message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.toast-message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

.form-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.section-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.25rem;
}

.section-description {
  color: #6c757d;
  font-size: 0.85rem;
  margin: 0 0 1.25rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label-custom {
  display: block;
  font-weight: 600;
  color: #212529;
  margin-bottom: 0.25rem;
  font-size: 0.95rem;
}

.form-label-small {
  font-size: 0.875rem;
  font-weight: 500;
}

.form-description {
  color: #6c757d;
  font-size: 0.85rem;
  margin: 0 0 0.75rem;
}

.input-wrapper {
  position: relative;
}

.textarea-wrapper {
  display: flex;
  flex-direction: column;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: 4rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #f8f9fa;
}

.form-textarea {
  padding-right: 1rem;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input::placeholder {
  color: #adb5bd;
}

.form-input.input-error {
  border-color: #dc3545;
}

.form-input.input-error:focus {
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

.input-with-prefix {
  display: flex;
  align-items: stretch;
}

.input-prefix {
  display: flex;
  align-items: center;
  background: #e9ecef;
  padding: 0 0.75rem;
  border: 2px solid #e9ecef;
  border-right: none;
  border-radius: 10px 0 0 10px;
  font-size: 0.875rem;
  color: #6c757d;
  white-space: nowrap;
}

.form-input.with-prefix {
  border-radius: 0 10px 10px 0;
  padding-right: 1rem;
}

.char-counter {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.75rem;
  color: #adb5bd;
  font-weight: 500;
}

.char-counter.textarea-counter {
  position: static;
  transform: none;
  align-self: flex-end;
  margin-top: 0.25rem;
}

.char-counter.near-limit {
  color: #ffc107;
}

.form-hint {
  margin: 0.5rem 0 0;
  font-size: 0.8rem;
  color: #6c757d;
}

.form-error {
  margin: 0.5rem 0 0;
  font-size: 0.8rem;
  color: #dc3545;
}

/* Toggle Switch */
.toggle-group {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #e9ecef;
}

.toggle-info {
  flex: 1;
}

.toggle-label {
  font-weight: 600;
  color: #212529;
  font-size: 0.95rem;
}

.toggle-description {
  color: #6c757d;
  font-size: 0.85rem;
  margin: 0.25rem 0 0;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 28px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.toggle-switch input:checked + .toggle-slider {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.save-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 150px;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
