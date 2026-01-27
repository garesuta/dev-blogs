# Cyber Tech Theme - Bootstrap 5.3

A modern, cyberpunk-inspired color theme for Bootstrap 5.3 with dark and light variants. Perfect for tech blogs, developer portfolios, and coding-focused websites.

## 🎨 Theme Colors

### Dark Theme (Default)
- **Primary**: `#00ff88` (Neon Green)
- **Secondary**: `#00d9ff` (Cyan)
- **Accent**: `#ff00ff` (Magenta)
- **Background**: `#0a0e27` (Deep Dark Blue)
- **Card Background**: `#151934`
- **Text Primary**: `#e0e6ed`
- **Text Secondary**: `#8892b0`

### Light Theme
- **Primary**: `#00cc6a` (Darker Green)
- **Secondary**: `#00a8cc` (Darker Cyan)
- **Accent**: `#cc00cc` (Darker Magenta)
- **Background**: `#f8fafc` (Light Gray)
- **Card Background**: `#ffffff`
- **Text Primary**: `#0f172a`
- **Text Secondary**: `#475569`

## 📦 Installation

### 1. Include the Theme CSS

Add the theme CSS file in your `<head>` after Bootstrap CSS:

```html
<!DOCTYPE html>
<html lang="en" data-bs-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

    <!-- Cyber Tech Theme -->
    <link href="/src/styles/theme-cyber.css" rel="stylesheet">
</head>
<body>
    <!-- Your content -->
</body>
</html>
```

### 2. Include the Theme Switcher JavaScript

Add the theme switcher script before the closing `</body>` tag:

```html
<body>
    <!-- Your content -->

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

    <!-- Theme Switcher -->
    <script src="/public/theme-switcher.js"></script>
</body>
```

### 3. Add Theme Toggle Button

Add a theme toggle button in your navigation or elsewhere:

```html
<button class="theme-toggle" onclick="toggleCyberTheme()">
    <i class="bi bi-moon-fill"></i>
    <span class="theme-text">Dark</span>
</button>
```

Or with Bootstrap Icons:

```html
<button class="theme-toggle btn" onclick="toggleCyberTheme()">
    <i class="bi bi-moon-fill"></i>
    <span class="theme-text">Dark</span>
</button>
```

## 🎯 Custom Components

### Badge Tech

```html
<span class="badge-tech">
    <i class="bi bi-cpu"></i> Tech Badge
</span>
```

### Cyber Buttons

```html
<!-- Primary Cyber Button -->
<button class="btn btn-cyber">
    <i class="bi bi-rocket"></i> Get Started
</button>

<!-- Outline Cyber Button -->
<button class="btn btn-cyber-outline">
    Learn More
</button>
```

### Topic Tags

```html
<span class="topic-tag tag-ai">AI/ML</span>
<span class="topic-tag tag-coding">Coding</span>
<span class="topic-tag tag-framework">Framework</span>
<span class="topic-tag tag-tech">Tech</span>
```

### Topic Card

```html
<div class="topic-card">
    <div class="topic-icon">
        <i class="bi bi-robot"></i>
    </div>
    <h5 class="fw-bold mb-3">Artificial Intelligence</h5>
    <p class="text-muted mb-0">LLMs, transformers, and practical AI applications.</p>
</div>
```

### Code Snippet

```html
<div class="code-snippet">
const blog = {
    focus: ['AI', 'Coding', 'Frameworks'],
    mission: 'Sharing knowledge',
    updated: new Date()
};
</div>
```

### Stat Card

```html
<div class="stat-card">
    <div class="d-flex justify-content-between align-items-start mb-3">
        <div>
            <div class="stat-number" style="font-size: 3rem; font-weight: 800; background: var(--cyber-gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">150+</div>
            <div style="color: var(--cyber-text-secondary);">Articles</div>
        </div>
        <i class="bi bi-file-code fs-1" style="color: var(--cyber-primary);"></i>
    </div>
</div>
```

### Article Card

```html
<div class="article-card h-100">
    <div class="trending-badge">🔥 Trending</div>
    <img src="your-image.jpg" class="card-img-top" alt="Article">
    <div class="card-body">
        <span class="topic-tag tag-ai">AI/ML</span>
        <h5 class="fw-bold mb-3">Article Title</h5>
        <p class="text-muted">Article description...</p>
    </div>
</div>
```

### Hero Section

```html
<section class="hero-cyber">
    <div class="container position-relative">
        <h1 class="glow-text">Welcome to the Future</h1>
        <p>Exploring technology, AI, and coding.</p>
    </div>
</section>
```

### Newsletter Box

```html
<div class="newsletter-box">
    <h2>Subscribe to Newsletter</h2>
    <p>Get the latest tech insights</p>
    <input type="email" class="form-control" placeholder="your@email.com">
</div>
```

## 🎨 Utility Classes

```html
<!-- Background Colors -->
<div class="bg-cyber-primary">Primary Background</div>
<div class="bg-cyber-secondary">Secondary Background</div>
<div class="bg-cyber-accent">Accent Background</div>

<!-- Text Colors -->
<span class="text-cyber-primary">Primary Text</span>
<span class="text-cyber-secondary">Secondary Text</span>
<span class="text-cyber-accent">Accent Text</span>

<!-- Border -->
<div class="border-cyber">Cyber Border</div>

<!-- Gradient Text -->
<h1 class="gradient-text">Gradient Heading</h1>

<!-- Glow Text -->
<h1 class="glow-text">Glowing Heading</h1>
```

## 🌙 Theme Switching

The theme automatically:
1. Detects system color scheme preference (dark/light)
2. Saves user preference in localStorage
3. Persists theme across page loads
4. Provides smooth transitions between themes

### Manual Theme Control

```javascript
// Set dark theme
document.documentElement.setAttribute('data-bs-theme', 'dark');

// Set light theme
document.documentElement.setAttribute('data-bs-theme', 'light');

// Toggle theme
toggleCyberTheme();
```

## 🎯 CSS Custom Properties

Access theme colors in your custom CSS:

```css
.custom-element {
  background: var(--cyber-bg-primary);
  color: var(--cyber-text-primary);
  border: 1px solid var(--cyber-border-color);
}

.custom-button {
  background: var(--cyber-gradient-primary);
  color: #000;
}
```

## 📱 Responsive Design

The theme is fully responsive and includes:
- Mobile-first approach
- Breakpoint adjustments
- Touch-friendly targets
- Optimized spacing for small screens

## ♿ Accessibility

- **Focus Visible**: Clear focus indicators for keyboard navigation
- **Reduced Motion**: Respects `prefers-reduced-motion` setting
- **High Contrast**: Enhanced borders for high contrast mode
- **WCAG AA**: Color ratios meet accessibility standards

## 🎨 Customization

### Override Colors

Create a custom CSS file and override specific variables:

```css
:root {
  /* Override primary color */
  --cyber-primary: #00ff00;

  /* Override background */
  --cyber-bg-primary: #000000;
}

[data-bs-theme="light"] {
  /* Light theme overrides */
  --cyber-primary: #00cc00;
}
```

### Add Custom Gradients

```css
:root {
  --cyber-gradient-custom: linear-gradient(135deg, #yourcolor1, #yourcolor2);
}
```

## 🚀 Usage with Astro

In your Astro project:

1. **Import in Base Layout** (`src/layouts/BaseLayout.astro`):

```astro
---
// BaseLayout.astro
import BaseHead from '../components/BaseHead.astro';
---

<!doctype html>
<html lang="en" data-bs-theme="dark">
<head>
    <BaseHead />
    <link href="/src/styles/theme-cyber.css" rel="stylesheet">
</head>
<body>
    <slot />
    <script src="/public/theme-switcher.js"></script>
</body>
</html>
```

2. **Import in Pages**:

```astro
---
// src/pages/index.astro
---

<div class="hero-cyber">
    <h1 class="glow-text">Welcome</h1>
</div>
```

## 📦 File Structure

```
hobbyproject/
├── src/
│   └── styles/
│       └── theme-cyber.css          # Main theme file
├── public/
│   └── theme-switcher.js            # Theme switcher script
└── docs/
    └── mock_design/
        └── design-2-variant-tech-news.html  # Reference design
```

## 🎯 Best Practices

1. **Always use semantic HTML** with proper heading hierarchy
2. **Use utility classes** for quick styling
3. **Customize variables** rather than overriding styles
4. **Test both themes** during development
5. **Check accessibility** with keyboard navigation
6. **Validate contrast ratios** for text readability

## 🔧 Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Opera: ✅ Full support

## 📄 License

This theme is part of the hobby project and follows the same license.

## 🤝 Contributing

To modify or extend the theme:

1. Edit `src/styles/theme-cyber.css` for style changes
2. Edit `public/theme-switcher.js` for behavior changes
3. Test in both dark and light modes
4. Check accessibility compliance

---

**Inspired by**: design-2-variant-tech-news.html
**Built with**: Bootstrap 5.3, CSS Custom Properties, Vanilla JavaScript
**Theme**: Cyberpunk/Developer-focused aesthetic
