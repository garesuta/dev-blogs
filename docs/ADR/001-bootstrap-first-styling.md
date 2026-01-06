# ADR-001: Bootstrap-First Styling Approach

**Status:** Accepted
**Date:** 2026-01-06
**Decision Makers:** Project Team

---

## Context

The project needs a consistent UI styling approach for components, layouts, and pages. Options considered:

1. **Custom CSS only** - Write all styles from scratch
2. **Tailwind CSS** - Utility-first CSS framework
3. **Bootstrap** - Component-based CSS framework
4. **CSS-in-JS** - Styled components or similar

## Decision

**Adopt Bootstrap as the primary styling framework, with custom CSS added only when necessary.**

### Implementation

- Bootstrap 5.3.x loaded globally via CDN in `BaseHead.astro`
- Bootstrap Icons included for iconography
- All components should use Bootstrap classes first
- Custom CSS allowed only for:
  - Component-specific adjustments not covered by Bootstrap
  - Brand-specific overrides (colors, fonts)
  - Edge cases where Bootstrap classes are insufficient

### Loading Strategy

Bootstrap is installed as a dependency and imported in Astro components:

```ts
// In src/components/BaseHead.astro (CSS)
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// In src/components/Footer.astro (JS)
<script>
  import "bootstrap/dist/js/bootstrap.bundle.min.js";
</script>
```

**Packages:**
- `bootstrap` - Core framework (CSS + JS)
- `bootstrap-icons` - Icon library

## Rationale

### Pros

1. **Rapid Development** - Pre-built components reduce development time
2. **Consistency** - Unified look and feel across all pages
3. **Documentation** - Extensive Bootstrap docs and community resources
4. **Responsiveness** - Built-in responsive grid and utilities
5. **Accessibility** - Bootstrap components have good a11y defaults
6. **Team Familiarity** - Bootstrap is widely known

### Cons

1. **Bundle Size** - Full Bootstrap CSS is ~25KB gzipped (acceptable trade-off)
2. **Generic Look** - Default Bootstrap styling can look generic (mitigated by custom overrides later)

## Consequences

### Must Do

- Use Bootstrap classes for all new components
- Avoid writing custom CSS that duplicates Bootstrap functionality
- Follow Bootstrap naming conventions (e.g., `btn`, `card`, `d-flex`)

### Must Not Do

- Do not create custom button styles when Bootstrap buttons suffice
- Do not duplicate Bootstrap grid with custom flexbox/grid
- Do not load Bootstrap multiple times on different pages

### Component Guidelines

```vue
<!-- Good: Use Bootstrap classes -->
<button class="btn btn-primary btn-sm">Submit</button>
<div class="d-flex gap-2 align-items-center">...</div>
<div class="card shadow-sm">...</div>

<!-- Bad: Custom CSS for things Bootstrap handles -->
<button class="custom-button">Submit</button>
<div class="my-flex-container">...</div>
```

## Future Considerations

1. **Custom Theme** - Can create custom Bootstrap theme with SASS variables
2. **Partial Import** - Can use Bootstrap's modular SASS for tree-shaking
3. **Migration Path** - If moving away from Bootstrap, document component mappings

## References

- [Bootstrap 5 Documentation](https://getbootstrap.com/docs/5.3/)
- [Bootstrap Icons](https://icons.getbootstrap.com/)
- [Bootstrap CDN](https://www.bootstrapcdn.com/)
