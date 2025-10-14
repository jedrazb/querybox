# Styling & Design Guide

The QueryBox widget features a stunning **Apple glassmorphism design** with frosted glass effects, smooth animations, and modern aesthetics.

## 🎨 Design Philosophy

Inspired by macOS Big Sur/Monterey and iOS 14+:

- **Frosted Glass Effect** - Backdrop blur with semi-transparent backgrounds
- **Depth & Layering** - Multi-layered shadows and borders
- **Smooth Animations** - Refined transitions and micro-interactions
- **Responsive** - Beautiful on desktop and mobile
- **Light & Dark Modes** - Automatic theme switching

## ✨ Glassmorphism Effect

The signature glass effect is achieved with:

```css
background: rgba(255, 255, 255, 0.7);
backdrop-filter: blur(40px) saturate(180%);
-webkit-backdrop-filter: blur(40px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.3);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08),
  inset 0 1px 0 rgba(255, 255, 255, 0.5);
```

**Key Elements:**

- **backdrop-filter: blur(40px)** - Creates frosted glass
- **saturate(180%)** - Enhances colors behind glass
- **Multiple shadows** - Adds depth and dimension
- **Inset highlight** - Simulates light reflection

## 🌈 Color System

### Light Mode

```css
--querybox-primary: #007aff; /* iOS blue */
--querybox-glass-bg: rgba(255, 255, 255, 0.7); /* Frosted white */
--querybox-text: #1d1d1f; /* Apple text */
--querybox-text-secondary: #86868b; /* Muted text */
```

### Dark Mode

```css
--querybox-primary: #0a84ff; /* iOS blue (dark) */
--querybox-glass-bg: rgba(30, 30, 30, 0.7); /* Frosted dark */
--querybox-text: #f5f5f7; /* Light text */
--querybox-text-secondary: #a1a1a6; /* Muted text */
```

## 🎨 Customization

### Override Colors

```css
:root {
  --querybox-primary: #ff2d55; /* Custom pink */
  --querybox-radius: 16px; /* Less rounded */
  --querybox-blur: 60px; /* More blur */
}
```

### Custom Color Themes

**Teal Theme:**

```css
:root {
  --querybox-primary: #5ac8fa;
  --querybox-primary-hover: #32ade6;
  --querybox-primary-rgb: 90, 200, 250;
}
```

**Purple Theme:**

```css
:root {
  --querybox-primary: #af52de;
  --querybox-primary-hover: #9b44c8;
  --querybox-primary-rgb: 175, 82, 222;
}
```

### Apply Custom Classes

```javascript
const querybox = new QueryBox({
  classNames: {
    panel: "my-custom-panel",
    searchPanel: "my-search-panel",
    chatPanel: "my-chat-panel",
    overlay: "my-overlay",
  },
});
```

```css
.my-custom-panel {
  --querybox-glass-bg: rgba(255, 100, 200, 0.7);
  border: 2px solid gold;
}
```

## 📐 Layout & Spacing

### Panel Dimensions

```css
--querybox-panel-width: 600px;
--querybox-panel-height: 70vh;
```

### Border Radius

```css
--querybox-radius: 20px; /* Panels */
--querybox-radius-sm: 12px; /* Cards, inputs */
```

### Spacing System

| Element  | Padding   | Margin      |
| -------- | --------- | ----------- |
| Header   | 24px 28px | -           |
| Content  | 20px 28px | -           |
| Cards    | 18px 20px | 12px bottom |
| Messages | 14px 18px | 18px gap    |
| Inputs   | 14px 18px | -           |

## 🎬 Animations

### Panel Opening

```
Scale: 0.96 → 1.0
Opacity: 0 → 1
Duration: 300ms
Easing: cubic-bezier(0.4, 0, 0.2, 1)
```

### Interactive States

- **Cards lift on hover**: `translateY(-2px)`
- **Buttons scale on hover**: `scale(1.05)`
- **Buttons press on active**: `scale(0.95)`

### Staggered Fade In

```css
@keyframes querybox-fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## 🌗 Theme Switching

Auto-detect system preference:

```javascript
const querybox = new QueryBox({
  theme: "auto", // Default
});
```

Force a specific theme:

```javascript
theme: "dark"; // or 'light'
```

## 📱 Responsive Design

### Desktop (> 768px)

- Panel: 600px wide, 70vh high
- Centered with backdrop overlay
- Rounded corners (20px)

### Mobile (≤ 768px)

- Panel: Full screen (100vw × 100vh)
- No rounded corners
- Maintains glass effect

## 🖥️ Browser Support

| Browser      | Support     | Notes                          |
| ------------ | ----------- | ------------------------------ |
| Safari 14+   | ✅ Full     | Native backdrop-filter         |
| Chrome 76+   | ✅ Full     | Full support                   |
| Firefox 103+ | ✅ Full     | Recent support                 |
| Edge 79+     | ✅ Full     | Chromium-based                 |
| Old Browsers | ⚠️ Graceful | Falls back to semi-transparent |

### Graceful Degradation

On unsupported browsers:

- Semi-transparent backgrounds (still looks good!)
- Standard shadows
- All functionality intact

## 🎯 Best Practices

### ✅ Do's

- Use CSS variables for consistency
- Test both light and dark modes
- Include `-webkit-backdrop-filter` for Safari
- Keep animations smooth (300ms)
- Maintain visual hierarchy

### ❌ Don'ts

- Don't use solid backgrounds (breaks glass effect)
- Don't disable backdrop-filter
- Don't use heavy shadows (keep subtle)
- Don't forget mobile breakpoints
- Don't override timing curves

## 🔍 Visual Reference

### Search Panel

```
┌─────────────────────────────────┐
│  ✨ Frosted Glass (40px blur)  │
│  ┌───────────────────────────┐ │
│  │  🔍  Search...            │ │
│  └───────────────────────────┘ │
│                                 │
│  ┌─────────────────────────┐   │
│  │  📄 Result Title        │   │
│  │  Description here...    │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

### Chat Panel

```
┌─────────────────────────────────┐
│  ✨ Frosted Glass (40px blur)  │
│                                 │
│      ┌──────────────────┐      │
│      │  Hello! 👋       │      │
│      └──────────────────┘      │
│                                 │
│               ┌──────────────┐ │
│               │  Hi there!   │ │
│               └──────────────┘ │
│                                 │
│  ┌────────────────────────┐    │
│  │  Type message...   🚀  │    │
│  └────────────────────────┘    │
└─────────────────────────────────┘
```

## 💡 Inspiration

Design inspired by:

- macOS Big Sur/Monterey/Sonoma UI
- iOS 14+ design language
- Apple.com product overlays
- Apple Music & Messages apps
- Spotlight Search interface

## 📚 Resources

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [backdrop-filter on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter)
- [Glassmorphism in UI](https://uxdesign.cc/glassmorphism-in-user-interfaces-1f39bb1308c9)

---

**Experience the beautiful glass effect!** ✨
Run `pnpm dev` to see it in action.
