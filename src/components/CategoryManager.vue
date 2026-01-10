<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";

// Tooltip state for fixed positioning (escapes overflow containers)
const tooltipText = ref("");
const tooltipVisible = ref(false);
const tooltipX = ref(0);
const tooltipY = ref(0);

function showTooltip(event: MouseEvent, text: string) {
  const rect = (event.target as HTMLElement).getBoundingClientRect();
  tooltipText.value = text;
  tooltipX.value = rect.left + rect.width / 2;
  tooltipY.value = rect.top - 8;
  tooltipVisible.value = true;
}

function hideTooltip() {
  tooltipVisible.value = false;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
}

// State
const categories = ref<Category[]>([]);
const isLoading = ref(true);
const error = ref("");
const successMessage = ref("");

// Form state
const showForm = ref(false);
const isEditing = ref(false);
const isSaving = ref(false);
const editingId = ref<string | null>(null);
const formData = ref({
  name: "",
  description: "",
  color: "#6c757d",
  icon: "",
});

// Icon picker state
const showIconPicker = ref(false);
const iconSearch = ref("");

// Predefined colors
const colorOptions = [
  "#0d6efd", // primary blue
  "#6610f2", // indigo
  "#6f42c1", // purple
  "#d63384", // pink
  "#dc3545", // red
  "#fd7e14", // orange
  "#ffc107", // yellow
  "#198754", // green
  "#20c997", // teal
  "#0dcaf0", // cyan
  "#6c757d", // gray
];

// Comprehensive icon library for programming/blog categories
// Using actual Bootstrap Icons brand icons with brand colors
const iconCategories = {
  "Programming Languages": [
    { icon: "bi-typescript", label: "TypeScript", color: "#3178c6" },
    { icon: "bi-javascript", label: "JavaScript", color: "#f7df1e" },
    { icon: "bi-p-circle-fill", label: "Python", color: "#3776ab" },
    { icon: "bi-cup-hot-fill", label: "Java", color: "#f89820" },
    { icon: "bi-c-circle-fill", label: "C/C++", color: "#00599c" },
    { icon: "bi-hash", label: "C#", color: "#68217a" },
    { icon: "bi-gem", label: "Ruby", color: "#cc342d" },
    { icon: "bi-p-circle", label: "PHP", color: "#777bb4" },
    { icon: "bi-terminal-fill", label: "Shell/Bash", color: "#4eaa25" },
    { icon: "bi-r-circle-fill", label: "R", color: "#276dc3" },
    { icon: "bi-h-circle-fill", label: "Haskell", color: "#5d4f85" },
    { icon: "bi-gear-wide-connected", label: "Rust", color: "#dea584" },
    { icon: "bi-chevron-double-right", label: "Go", color: "#00add8" },
    { icon: "bi-apple", label: "Swift", color: "#fa7343" },
    { icon: "bi-android2", label: "Kotlin", color: "#7f52ff" },
    { icon: "bi-hexagon-fill", label: "Lua", color: "#000080" },
  ],
  "Web Development": [
    { icon: "bi-globe2", label: "HTML", color: "#e34f26" },
    { icon: "bi-palette2", label: "CSS", color: "#1572b6" },
    { icon: "bi-brush", label: "Sass/SCSS", color: "#cf649a" },
    { icon: "bi-bootstrap", label: "Bootstrap", color: "#7952b3" },
    { icon: "bi-braces", label: "Code", color: "#6c757d" },
    { icon: "bi-code-slash", label: "Web Dev", color: "#17a2b8" },
  ],
  "Frameworks & Platforms": [
    { icon: "bi-rocket-takeoff", label: "Astro", color: "#ff5d01" },
    { icon: "bi-arrow-right-circle-fill", label: "Next.js", color: "#000000" },
    { icon: "bi-lightning-charge-fill", label: "Vite", color: "#646cff" },
    { icon: "bi-node-plus-fill", label: "Node.js", color: "#339933" },
    { icon: "bi-box-seam-fill", label: "Docker", color: "#2496ed" },
    { icon: "bi-server", label: "Backend", color: "#6c757d" },
    { icon: "bi-window-stack", label: "Frontend", color: "#0d6efd" },
    { icon: "bi-phone-fill", label: "Mobile", color: "#6f42c1" },
    { icon: "bi-android2", label: "Android", color: "#3ddc84" },
    { icon: "bi-apple", label: "Apple/iOS", color: "#000000" },
    { icon: "bi-windows", label: "Windows", color: "#0078d4" },
    { icon: "bi-ubuntu", label: "Ubuntu/Linux", color: "#e95420" },
  ],
  "AI & Machine Learning": [
    { icon: "bi-openai", label: "OpenAI", color: "#412991" },
    { icon: "bi-anthropic", label: "Anthropic", color: "#d4a574" },
    { icon: "bi-claude", label: "Claude", color: "#d4a574" },
    { icon: "bi-robot", label: "AI/Bot", color: "#00d9ff" },
    { icon: "bi-cpu-fill", label: "CPU/Processing", color: "#0071c5" },
    { icon: "bi-gpu-card", label: "GPU", color: "#76b900" },
    { icon: "bi-memory", label: "Memory", color: "#ff6600" },
    { icon: "bi-motherboard-fill", label: "Hardware", color: "#00a300" },
    { icon: "bi-nvidia", label: "NVIDIA", color: "#76b900" },
    { icon: "bi-amd", label: "AMD", color: "#ed1c24" },
    { icon: "bi-diagram-3-fill", label: "Neural Network", color: "#ff6f61" },
    { icon: "bi-graph-up-arrow", label: "ML Model", color: "#198754" },
  ],
  "DevOps & Version Control": [
    { icon: "bi-git", label: "Git", color: "#f05032" },
    { icon: "bi-github", label: "GitHub", color: "#181717" },
    { icon: "bi-gitlab", label: "GitLab", color: "#fc6d26" },
    { icon: "bi-terminal-fill", label: "Terminal", color: "#4eaa25" },
    { icon: "bi-database-fill", label: "Database", color: "#336791" },
    { icon: "bi-hdd-network-fill", label: "Network", color: "#0078d4" },
    { icon: "bi-hdd-rack-fill", label: "Server Rack", color: "#6c757d" },
    { icon: "bi-cloud-arrow-up-fill", label: "Deploy", color: "#198754" },
    { icon: "bi-shield-check", label: "Security", color: "#dc3545" },
    { icon: "bi-speedometer2", label: "Performance", color: "#fd7e14" },
    { icon: "bi-bug-fill", label: "Debugging", color: "#dc3545" },
  ],
  "Cloud & Infrastructure": [
    { icon: "bi-cloud-fill", label: "Cloud", color: "#0d6efd" },
    { icon: "bi-amazon", label: "AWS/Amazon", color: "#ff9900" },
    { icon: "bi-microsoft", label: "Azure/Microsoft", color: "#0078d4" },
    { icon: "bi-google", label: "GCP/Google", color: "#4285f4" },
    { icon: "bi-router-fill", label: "Router", color: "#6c757d" },
    { icon: "bi-modem-fill", label: "Modem", color: "#6c757d" },
    { icon: "bi-ethernet", label: "Ethernet", color: "#0dcaf0" },
    { icon: "bi-wifi", label: "WiFi", color: "#0d6efd" },
    { icon: "bi-bluetooth", label: "Bluetooth", color: "#0082fc" },
    { icon: "bi-usb-c-fill", label: "USB", color: "#6c757d" },
    { icon: "bi-hdmi-fill", label: "HDMI", color: "#6c757d" },
    { icon: "bi-device-ssd-fill", label: "SSD", color: "#f05032" },
  ],
  "Social & Brands": [
    { icon: "bi-youtube", label: "YouTube", color: "#ff0000" },
    { icon: "bi-twitch", label: "Twitch", color: "#9146ff" },
    { icon: "bi-twitter-x", label: "X (Twitter)", color: "#000000" },
    { icon: "bi-threads-fill", label: "Threads", color: "#000000" },
    { icon: "bi-mastodon", label: "Mastodon", color: "#6364ff" },
    { icon: "bi-bluesky", label: "Bluesky", color: "#1185fe" },
    { icon: "bi-discord", label: "Discord", color: "#5865f2" },
    { icon: "bi-slack", label: "Slack", color: "#4a154b" },
    { icon: "bi-linkedin", label: "LinkedIn", color: "#0a66c2" },
    { icon: "bi-reddit", label: "Reddit", color: "#ff4500" },
    { icon: "bi-medium", label: "Medium", color: "#000000" },
    { icon: "bi-substack", label: "Substack", color: "#ff6719" },
  ],
  "Design & Creative": [
    { icon: "bi-dribbble", label: "Dribbble", color: "#ea4c89" },
    { icon: "bi-behance", label: "Behance", color: "#1769ff" },
    { icon: "bi-layers-fill", label: "Photoshop", color: "#31a8ff" },
    { icon: "bi-vector-pen", label: "Illustrator", color: "#ff9a00" },
    { icon: "bi-palette-fill", label: "Design", color: "#e91e63" },
    { icon: "bi-brush-fill", label: "Art", color: "#9c27b0" },
    { icon: "bi-image-fill", label: "Image", color: "#4caf50" },
    { icon: "bi-file-earmark-richtext-fill", label: "Document", color: "#f40f02" },
  ],
  "Content Types": [
    { icon: "bi-journal-text", label: "Notes", color: "#6c757d" },
    { icon: "bi-book-fill", label: "Tutorial", color: "#0d6efd" },
    { icon: "bi-mortarboard-fill", label: "Learning", color: "#6f42c1" },
    { icon: "bi-lightbulb-fill", label: "Tips", color: "#ffc107" },
    { icon: "bi-wrench-adjustable", label: "How-to", color: "#6c757d" },
    { icon: "bi-puzzle-fill", label: "Problem", color: "#fd7e14" },
    { icon: "bi-clipboard2-check-fill", label: "Checklist", color: "#198754" },
    { icon: "bi-file-earmark-code-fill", label: "Snippet", color: "#20c997" },
    { icon: "bi-bookmark-star-fill", label: "Best Practice", color: "#ffc107" },
    { icon: "bi-question-circle-fill", label: "FAQ", color: "#0dcaf0" },
    { icon: "bi-exclamation-triangle-fill", label: "Warning", color: "#ffc107" },
    { icon: "bi-info-circle-fill", label: "Info", color: "#0dcaf0" },
  ],
  "Media & Communication": [
    { icon: "bi-play-circle-fill", label: "Video", color: "#dc3545" },
    { icon: "bi-mic-fill", label: "Podcast", color: "#9146ff" },
    { icon: "bi-camera-video-fill", label: "Screencast", color: "#fd7e14" },
    { icon: "bi-calendar-event-fill", label: "Event", color: "#0d6efd" },
    { icon: "bi-people-fill", label: "Conference", color: "#6f42c1" },
    { icon: "bi-broadcast-pin", label: "Live", color: "#dc3545" },
    { icon: "bi-headphones", label: "Audio", color: "#6c757d" },
    { icon: "bi-spotify", label: "Spotify", color: "#1db954" },
    { icon: "bi-telegram", label: "Telegram", color: "#26a5e4" },
    { icon: "bi-whatsapp", label: "WhatsApp", color: "#25d366" },
    { icon: "bi-signal", label: "Signal", color: "#3a76f0" },
    { icon: "bi-microsoft-teams", label: "Teams", color: "#6264a7" },
  ],
  "Gaming & Entertainment": [
    { icon: "bi-steam", label: "Steam", color: "#171a21" },
    { icon: "bi-playstation", label: "PlayStation", color: "#003087" },
    { icon: "bi-nintendo-switch", label: "Nintendo", color: "#e60012" },
    { icon: "bi-controller", label: "Gaming", color: "#6c757d" },
    { icon: "bi-joystick", label: "Joystick", color: "#6c757d" },
    { icon: "bi-headset-vr", label: "VR", color: "#6f42c1" },
    { icon: "bi-film", label: "Film", color: "#6c757d" },
    { icon: "bi-music-note-beamed", label: "Music", color: "#1db954" },
    { icon: "bi-vimeo", label: "Vimeo", color: "#1ab7ea" },
    { icon: "bi-tiktok", label: "TikTok", color: "#000000" },
    { icon: "bi-instagram", label: "Instagram", color: "#e4405f" },
    { icon: "bi-snapchat", label: "Snapchat", color: "#fffc00" },
  ],
  "E-commerce & Payments": [
    { icon: "bi-stripe", label: "Stripe", color: "#635bff" },
    { icon: "bi-paypal", label: "PayPal", color: "#003087" },
    { icon: "bi-credit-card-fill", label: "Credit Card", color: "#0d6efd" },
    { icon: "bi-wallet-fill", label: "Wallet", color: "#6c757d" },
    { icon: "bi-currency-bitcoin", label: "Bitcoin", color: "#f7931a" },
    { icon: "bi-currency-dollar", label: "Dollar", color: "#198754" },
    { icon: "bi-cart-fill", label: "Shopping", color: "#fd7e14" },
    { icon: "bi-bag-fill", label: "Bag", color: "#e91e63" },
    { icon: "bi-shop", label: "Shop", color: "#0d6efd" },
    { icon: "bi-wordpress", label: "WordPress", color: "#21759b" },
    { icon: "bi-receipt", label: "Receipt", color: "#6c757d" },
    { icon: "bi-truck", label: "Shipping", color: "#fd7e14" },
  ],
  "Office & Productivity": [
    { icon: "bi-microsoft", label: "Microsoft", color: "#0078d4" },
    { icon: "bi-file-earmark-word-fill", label: "Word", color: "#2b579a" },
    { icon: "bi-file-earmark-spreadsheet-fill", label: "Excel", color: "#217346" },
    { icon: "bi-file-earmark-slides-fill", label: "PowerPoint", color: "#d24726" },
    { icon: "bi-trello", label: "Trello", color: "#0052cc" },
    { icon: "bi-kanban-fill", label: "Kanban", color: "#6f42c1" },
    { icon: "bi-list-check", label: "Todo", color: "#198754" },
    { icon: "bi-bar-chart-fill", label: "Analytics", color: "#0d6efd" },
  ],
  "General": [
    { icon: "bi-folder-fill", label: "Folder", color: "#ffc107" },
    { icon: "bi-tag-fill", label: "Tag", color: "#6c757d" },
    { icon: "bi-bookmark-fill", label: "Bookmark", color: "#dc3545" },
    { icon: "bi-star-fill", label: "Featured", color: "#ffc107" },
    { icon: "bi-heart-fill", label: "Favorite", color: "#dc3545" },
    { icon: "bi-fire", label: "Trending", color: "#fd7e14" },
    { icon: "bi-trophy-fill", label: "Achievement", color: "#ffc107" },
    { icon: "bi-patch-check-fill", label: "Verified", color: "#0dcaf0" },
    { icon: "bi-pin-angle-fill", label: "Pinned", color: "#dc3545" },
    { icon: "bi-archive-fill", label: "Archive", color: "#6c757d" },
    { icon: "bi-globe", label: "Web", color: "#0d6efd" },
    { icon: "bi-link-45deg", label: "Link", color: "#6c757d" },
  ],
};

// Flatten all icons for search
const allIcons = computed(() => {
  const icons: { icon: string; label: string; category: string }[] = [];
  for (const [category, categoryIcons] of Object.entries(iconCategories)) {
    for (const iconItem of categoryIcons) {
      icons.push({ ...iconItem, category });
    }
  }
  return icons;
});

// Filtered icons based on search
const filteredIcons = computed(() => {
  if (!iconSearch.value.trim()) {
    return iconCategories;
  }

  const search = iconSearch.value.toLowerCase();
  const result: Record<string, { icon: string; label: string }[]> = {};

  for (const [category, icons] of Object.entries(iconCategories)) {
    const filtered = icons.filter(
      (i) =>
        i.label.toLowerCase().includes(search) ||
        i.icon.toLowerCase().includes(search)
    );
    if (filtered.length > 0) {
      result[category] = filtered;
    }
  }

  return result;
});

// Load categories
async function loadCategories() {
  isLoading.value = true;
  error.value = "";

  try {
    const response = await fetch("/api/categories");
    if (!response.ok) throw new Error("Failed to load categories");

    const data = await response.json();
    categories.value = data.categories;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to load categories";
  } finally {
    isLoading.value = false;
  }
}

// Reset form
function resetForm() {
  formData.value = { name: "", description: "", color: "#6c757d", icon: "" };
  isEditing.value = false;
  editingId.value = null;
  showForm.value = false;
  showIconPicker.value = false;
  iconSearch.value = "";
}

// Open form for new category
function openNewForm() {
  resetForm();
  showForm.value = true;
}

// Open form for editing
function openEditForm(category: Category) {
  formData.value = {
    name: category.name,
    description: category.description || "",
    color: category.color || "#6c757d",
    icon: category.icon || "",
  };
  isEditing.value = true;
  editingId.value = category.id;
  showForm.value = true;
}

// Select icon
function selectIcon(iconClass: string) {
  formData.value.icon = iconClass;
  showIconPicker.value = false;
  iconSearch.value = "";
}

// Clear icon
function clearIcon() {
  formData.value.icon = "";
}

// Save category (create or update)
async function saveCategory() {
  if (!formData.value.name.trim()) {
    error.value = "Name is required";
    return;
  }

  isSaving.value = true;
  error.value = "";

  try {
    const url = isEditing.value ? `/api/categories/${editingId.value}` : "/api/categories";
    const method = isEditing.value ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.value.name.trim(),
        description: formData.value.description.trim() || null,
        color: formData.value.color,
        icon: formData.value.icon || null,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to save category");
    }

    successMessage.value = isEditing.value ? "Category updated" : "Category created";
    setTimeout(() => (successMessage.value = ""), 3000);

    resetForm();
    await loadCategories();
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to save category";
  } finally {
    isSaving.value = false;
  }
}

// Delete category
async function deleteCategory(category: Category) {
  if (!confirm(`Are you sure you want to delete "${category.name}"? This cannot be undone.`)) {
    return;
  }

  error.value = "";

  try {
    const response = await fetch(`/api/categories/${category.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to delete category");
    }

    successMessage.value = "Category deleted";
    setTimeout(() => (successMessage.value = ""), 3000);

    categories.value = categories.value.filter((c) => c.id !== category.id);
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to delete category";
  }
}

// Initialize
onMounted(() => {
  loadCategories();
});
</script>

<template>
  <div class="category-manager">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0">
        <i class="bi bi-folder me-2"></i>
        Categories
      </h5>
      <button class="btn btn-primary btn-sm" @click="openNewForm" :disabled="showForm">
        <i class="bi bi-plus-lg me-1"></i>
        Add Category
      </button>
    </div>

    <!-- Messages -->
    <div v-if="error" class="alert alert-danger py-2 small">
      {{ error }}
      <button type="button" class="btn-close btn-sm float-end" @click="error = ''"></button>
    </div>

    <div v-if="successMessage" class="alert alert-success py-2 small">
      <i class="bi bi-check-circle me-1"></i>
      {{ successMessage }}
    </div>

    <!-- Form -->
    <div v-if="showForm" class="card mb-3">
      <div class="card-body">
        <h6 class="card-title">
          <i :class="['bi', 'me-1', isEditing ? 'bi-pencil' : 'bi-plus-circle']"></i>
          {{ isEditing ? "Edit Category" : "New Category" }}
        </h6>

        <div class="mb-3">
          <label class="form-label">Name *</label>
          <input
            type="text"
            class="form-control"
            v-model="formData.name"
            placeholder="Category name"
          />
        </div>

        <div class="mb-3">
          <label class="form-label">Description</label>
          <textarea
            class="form-control"
            v-model="formData.description"
            rows="2"
            placeholder="Optional description"
          ></textarea>
        </div>

        <div class="mb-3">
          <label class="form-label">Color</label>
          <div class="d-flex align-items-center gap-3">
            <!-- Custom color picker -->
            <div class="color-picker-wrapper">
              <input
                type="color"
                class="color-picker-input"
                v-model="formData.color"
                :title="formData.color"
              />
              <div
                class="color-picker-preview"
                :style="{ backgroundColor: formData.color }"
              ></div>
            </div>
            <!-- Hex input -->
            <div class="flex-grow-1">
              <input
                type="text"
                class="form-control form-control-sm"
                v-model="formData.color"
                placeholder="#000000"
                maxlength="7"
              />
            </div>
          </div>
          <!-- Quick color presets -->
          <div class="d-flex flex-wrap gap-1 mt-2">
            <button
              v-for="color in colorOptions"
              :key="color"
              type="button"
              class="color-preset"
              :class="{ active: formData.color === color }"
              :style="{ backgroundColor: color }"
              @click="formData.color = color"
              :title="color"
            ></button>
          </div>
          <small class="text-muted">Click the color box or use presets below</small>
        </div>

        <!-- Icon Picker Section -->
        <div class="mb-3">
          <label class="form-label">Icon</label>

          <!-- Selected icon preview -->
          <div class="d-flex align-items-center gap-2 mb-2">
            <div
              class="icon-preview d-flex align-items-center justify-content-center"
              :style="{ borderColor: formData.color }"
            >
              <i v-if="formData.icon" :class="`bi ${formData.icon}`" :style="{ color: formData.color }"></i>
              <i v-else class="bi bi-image text-muted"></i>
            </div>
            <div class="flex-grow-1">
              <input
                type="text"
                class="form-control form-control-sm"
                v-model="formData.icon"
                placeholder="e.g., bi-rocket-takeoff"
              />
            </div>
            <button
              v-if="formData.icon"
              type="button"
              class="btn btn-outline-secondary btn-sm"
              @click="clearIcon"
              title="Clear icon"
            >
              <i class="bi bi-x-lg"></i>
            </button>
            <button
              type="button"
              class="btn btn-outline-primary btn-sm"
              @click="showIconPicker = !showIconPicker"
            >
              <i class="bi bi-grid-3x3-gap me-1"></i>
              {{ showIconPicker ? 'Close' : 'Browse' }}
            </button>
          </div>

          <!-- Icon picker dropdown -->
          <div v-if="showIconPicker" class="icon-picker-panel">
            <!-- Search -->
            <div class="mb-3">
              <div class="input-group input-group-sm">
                <span class="input-group-text">
                  <i class="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  class="form-control"
                  v-model="iconSearch"
                  placeholder="Search icons..."
                />
              </div>
            </div>

            <!-- Icon categories -->
            <div class="icon-categories">
              <div v-for="(icons, category) in filteredIcons" :key="category" class="mb-3">
                <div class="small text-muted mb-2 fw-semibold">{{ category }}</div>
                <div class="d-flex flex-wrap gap-1">
                  <button
                    v-for="iconItem in icons"
                    :key="iconItem.icon"
                    type="button"
                    class="icon-btn"
                    :class="{ active: formData.icon === iconItem.icon }"
                    @mouseenter="showTooltip($event, iconItem.label)"
                    @mouseleave="hideTooltip"
                    @click="selectIcon(iconItem.icon)"
                  >
                    <i :class="`bi ${iconItem.icon}`" :style="{ color: iconItem.color }"></i>
                  </button>
                </div>
              </div>

              <div v-if="Object.keys(filteredIcons).length === 0" class="text-muted text-center py-3">
                <i class="bi bi-search me-1"></i>
                No icons found for "{{ iconSearch }}"
              </div>
            </div>

            <!-- Fixed position tooltip (escapes overflow containers) -->
            <Teleport to="body">
              <div
                v-if="tooltipVisible"
                class="icon-tooltip-fixed"
                :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }"
              >
                {{ tooltipText }}
              </div>
            </Teleport>

            <!-- Help text -->
            <div class="small text-muted mt-2 pt-2 border-top">
              <i class="bi bi-info-circle me-1"></i>
              Browse all icons at <a href="https://icons.getbootstrap.com/" target="_blank" rel="noopener">icons.getbootstrap.com</a>
            </div>
          </div>
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-primary btn-sm" @click="saveCategory" :disabled="isSaving">
            <i :class="['bi', 'me-1', isSaving ? 'bi-hourglass-split' : 'bi-check-lg']"></i>
            {{ isSaving ? "Saving..." : isEditing ? "Update" : "Create" }}
          </button>
          <button class="btn btn-outline-secondary btn-sm" @click="resetForm">
            <i class="bi bi-x-lg me-1"></i>
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-4">
      <div class="spinner-border spinner-border-sm text-primary"></div>
      <span class="ms-2 text-muted">Loading...</span>
    </div>

    <!-- Empty state -->
    <div v-else-if="categories.length === 0" class="text-center py-4 text-muted">
      <i class="bi bi-folder-x fs-1 d-block mb-2"></i>
      <p class="mb-0">No categories yet</p>
      <small>Create your first category to organize your posts</small>
    </div>

    <!-- Categories list -->
    <div v-else class="list-group">
      <div
        v-for="category in categories"
        :key="category.id"
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <div class="d-flex align-items-center gap-2">
          <!-- Icon -->
          <span
            v-if="category.icon"
            class="category-icon"
            :style="{ color: category.color || '#6c757d' }"
          >
            <i :class="`bi ${category.icon}`"></i>
          </span>
          <!-- Badge with name -->
          <span
            class="badge"
            :style="{ backgroundColor: category.color || '#6c757d' }"
          >
            {{ category.name }}
          </span>
          <small v-if="category.description" class="text-muted">
            {{ category.description }}
          </small>
        </div>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-secondary" @click="openEditForm(category)">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-outline-danger" @click="deleteCategory(category)">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Color picker styles */
.color-picker-wrapper {
  position: relative;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}

.color-picker-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.color-picker-preview {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  border: 2px solid #dee2e6;
  pointer-events: none;
  transition: all 0.15s ease;
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.3);
}

.color-picker-wrapper:hover .color-picker-preview {
  border-color: #adb5bd;
  transform: scale(1.05);
}

/* Color presets (smaller quick-select buttons) */
.color-preset {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  padding: 0;
}

.color-preset:hover {
  transform: scale(1.15);
}

.color-preset.active {
  border-color: #212529;
  box-shadow: 0 0 0 1px white, 0 0 0 3px #212529;
}

.icon-preview {
  width: 48px;
  height: 48px;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.icon-picker-panel {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.icon-categories {
  max-height: 280px;
  overflow-y: auto;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all 0.15s ease;
  position: relative;
}

.icon-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
  transform: scale(1.1);
}


.icon-btn.active {
  background: #0d6efd;
  border-color: #0d6efd;
  color: white;
}

.category-icon {
  font-size: 1.25rem;
  width: 28px;
  text-align: center;
}
</style>

<!-- Global styles for teleported tooltip (not scoped) -->
<style>
.icon-tooltip-fixed {
  position: fixed;
  transform: translateX(-50%) translateY(-100%);
  background: #212529;
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  z-index: 999999;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  animation: tooltipFadeIn 0.1s ease;
}

.icon-tooltip-fixed::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: #212529;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-90%);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(-100%);
  }
}
</style>
