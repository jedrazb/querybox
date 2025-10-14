# Mode Switching Feature

## Overview

The QueryBox widget now supports seamless switching between Search and Chat modes without closing the panel!

## Features

### 🔄 Mode Switching

- Switch between search and chat modes using toggle buttons in the panel header
- Keyboard shortcuts open the appropriate mode
- No need to close the widget to access the other mode

### 🎯 User Experience

- **⌘K** or **Ctrl+K** - Opens widget in Search mode
- **⌘/** or **Ctrl+/** - Opens widget in Chat mode
- **Mode Toggle Buttons** - Two icon buttons in the header to switch between modes
  - 🔍 Search icon button
  - 💬 Chat icon button
- Active mode is highlighted with the primary color

### 🎨 Visual Design

- Mode switcher placed between the title and close button
- Glassmorphic pill-shaped container with two icon buttons
- Active button highlighted in primary blue with shadow
- Smooth transitions when switching modes
- Hover states for better interactivity

## Implementation

### Architecture Changes

1. **QueryBox.ts**

   - Added `currentMode` state tracking
   - `search()` and `chat()` methods now check current mode
   - New `switchMode()` method handles mode transitions
   - `setupModeSwitch()` creates toggle buttons in panel header
   - `updateModeSwitcherState()` updates active button styling

2. **BasePanel.ts**

   - Added `hide()` method - hides panel without destroying
   - Added `show()` method - shows panel (reuses existing instance)
   - Added `getElement()` method - returns panel DOM element
   - Keeps panel instances alive when switching modes

3. **Styles (main.css)**
   - `.querybox-mode-switcher` - Container for mode buttons
   - `.querybox-mode-btn` - Individual mode button styling
   - `.querybox-mode-btn.active` - Active state with primary color
   - Responsive hover effects

## Usage Example

```javascript
const querybox = new QueryBox({
  host: "https://your-elasticsearch.com",
  apiKey: "your-api-key",
  agentId: "your-agent-id",
  theme: "auto",
});

// Open in search mode
querybox.search();

// User can now:
// 1. Click the chat icon to switch to chat
// 2. Use Cmd+/ to switch to chat
// 3. Panel stays open during switch
```

## Benefits

✅ **Better UX** - No need to close and reopen to switch modes
✅ **Faster** - Panel stays mounted, instant switching
✅ **Intuitive** - Visual toggle makes modes discoverable
✅ **Consistent** - Works with both keyboard shortcuts and clicks
✅ **Efficient** - Reuses panel instances, minimal re-rendering

## Technical Details

### Mode Switching Flow

1. User triggers mode switch (button click or keyboard shortcut)
2. Current panel is hidden (display: none) but not destroyed
3. Target panel is shown (or created if doesn't exist)
4. Mode switcher buttons update active state
5. Focus is maintained on the appropriate input field

### Performance

- Panels are cached and reused
- No DOM destruction/recreation when switching
- Minimal performance impact
- Smooth CSS transitions

## Testing

Visit: http://localhost:5173

1. Press **⌘K** to open search
2. Click the **💬 chat icon** in the header to switch to chat
3. Click the **🔍 search icon** to switch back
4. Try **⌘/** to open directly to chat mode
5. Notice the active mode highlighted in blue

---

**Note:** The mode switcher appears in both search and chat panels, making it always accessible regardless of which mode you started in.
