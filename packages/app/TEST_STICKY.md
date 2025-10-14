# Testing Sticky Sidebar

## Current CSS for .sidebar:

```css
.sidebar {
  position: sticky;
  top: 70px;
  align-self: flex-start;
  width: 280px;
  max-height: calc(100vh - 70px);
  padding: 2rem 1.5rem;
  border-right: 1px solid var(--border);
  background: rgba(15, 23, 42, 0.5);
  overflow-y: auto;
  flex-shrink: 0;
}
```

## To test:

1. **Hard refresh** the browser: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. Go to `/docs`
3. Scroll down
4. The sidebar should stay at the top, 70px from the top edge

## If still not working, check:

- Browser DevTools → Elements → `.sidebar` → Computed styles
- Look for `position: sticky` in computed styles
- Check if any parent has `overflow: hidden`
