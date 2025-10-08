# Preact Spatial Navigation

A comprehensive Preact library for TV-style spatial navigation, powered by [js-spatial-navigation](https://github.com/luke-chang/js-spatial-navigation). Perfect for building Smart TV apps, Set-top boxes, and any application requiring directional pad (D-pad) navigation.

## Features

✨ **Complete Feature Set**
- 🎯 Full spatial navigation with directional keys
- 🔄 Auto-scrolling focused elements into view
- 📱 Device type detection (TV, Desktop, Mobile, Tablet)
- ♿ Built-in accessibility support with ARIA attributes
- 🚀 Virtualized lists/grids for massive datasets (10,000+ items)
- 🎮 Custom remote control key mappings
- 🔒 Lock/unlock navigation programmatically
- 🎨 Flexible styling with focus states
- 📦 TypeScript support with full type definitions
- 🔌 Two APIs: Simple (legacy) and Advanced (new)

## Installation

```bash
npm install js-spatial-navigation mitt
```

## Quick Start

### Simple API (Legacy - Still Supported)

```tsx
import { SpatialNavigationProvider, useFocusable } from './lib';

function MyButton() {
  const { ref, focused } = useFocusable({
    onEnterPress: () => console.log('Pressed!')
  });
  
  return (
    <button
      ref={ref}
      className={`button focusable ${focused ? 'focused' : ''}`}
    >
      Click Me
    </button>
  );
}

function App() {
  return (
    <SpatialNavigationProvider>
      <MyButton />
      <MyButton />
      <MyButton />
    </SpatialNavigationProvider>
  );
}
```

### Advanced API (New - Full Power)

```tsx
import {
  SpatialNavigationRoot,
  SpatialNavigationNode,
  SpatialNavigationView,
  SpatialNavigationScrollView,
} from './lib';

function App() {
  return (
    <SpatialNavigationRoot
      isActive={true}
      onDirectionHandledWithoutMovement={(direction) => {
        console.log('Reached border:', direction);
      }}
    >
      <SpatialNavigationView direction="horizontal">
        <SpatialNavigationNode
          isFocusable={true}
          onSelect={() => alert('Selected!')}
          onLongSelect={() => alert('Long pressed!')}
        >
          {({ isFocused, isActive, isRootActive }) => (
            <div className={isFocused ? 'focused' : ''}>
              Button {isFocused && '★'}
            </div>
          )}
        </SpatialNavigationNode>
        
        <SpatialNavigationNode isFocusable={true}>
          {({ isFocused }) => (
            <div className={isFocused ? 'focused' : ''}>
              Another Button
            </div>
          )}
        </SpatialNavigationNode>
      </SpatialNavigationView>
    </SpatialNavigationRoot>
  );
}
```

## Core Components

### 1. SpatialNavigationRoot (Provider)

The root component that initializes and manages spatial navigation.

```tsx
<SpatialNavigationRoot
  isActive={true}
  onDirectionHandledWithoutMovement={(direction) => {
    // Called when navigation reaches a border
    console.log('Reached', direction, 'border');
  }}
>
  {children}
</SpatialNavigationRoot>
```

**Props:**
- `isActive` (boolean): Enable/disable navigation
- `onDirectionHandledWithoutMovement` (function): Border event callback
- `config` (object): js-spatial-navigation configuration

### 2. SpatialNavigationNode

Core building block for focusable elements and containers.

```tsx
<SpatialNavigationNode
  isFocusable={true}
  orientation="horizontal"
  onFocus={() => {}}
  onBlur={() => {}}
  onSelect={() => {}}
  onLongSelect={() => {}}
  onActive={() => {}}
  onInactive={() => {}}
>
  {({ isFocused, isActive, isRootActive }) => (
    <div>Content</div>
  )}
</SpatialNavigationNode>
```

**Props:**
- `isFocusable` (boolean): Whether this node is focusable
- `orientation` ('vertical' | 'horizontal'): Layout direction
- `children` (function | ReactNode): Render function or elements
- `onFocus`, `onBlur`, `onSelect`, `onLongSelect`: Event callbacks
- `onActive`, `onInactive`: Container active state callbacks

### 3. SpatialNavigationView

Simple wrapper for creating non-focusable layouts.

```tsx
<SpatialNavigationView direction="horizontal">
  <Button1 />
  <Button2 />
  <Button3 />
</SpatialNavigationView>
```

### 4. SpatialNavigationFocusableView

Focusable wrapper with auto-focus on hover (for web TV pointers).

```tsx
<SpatialNavigationFocusableView
  onSelect={() => alert('Selected!')}
  style={{ padding: '20px' }}
>
  {({ isFocused }) => (
    <div>{isFocused ? 'Focused!' : 'Normal'}</div>
  )}
</SpatialNavigationFocusableView>
```

### 5. SpatialNavigationScrollView

Auto-scrolling container that keeps focused elements visible.

```tsx
<SpatialNavigationScrollView
  horizontal={false}
  offsetFromStart={20}
  style={{ maxHeight: '400px' }}
>
  {/* Long list of items */}
</SpatialNavigationScrollView>
```

**Props:**
- `horizontal` (boolean): Scroll direction
- `offsetFromStart` (number): Margin from top/left
- `ascendingArrow`, `descendingArrow`: Scroll arrows for cursors
- `pointerScrollSpeed` (number): Pixels per 10ms on hover

### 6. SpatialNavigationVirtualizedList

Virtualized list for rendering massive datasets efficiently.

```tsx
const data = Array.from({ length: 10000 }, (_, i) => ({ id: i, title: `Item ${i}` }));

<SpatialNavigationVirtualizedList
  data={data}
  itemHeight={60}
  orientation="vertical"
  overscan={5}
  renderItem={(item, index, isFocused) => (
    <div style={{ height: '60px' }}>
      {item.title} {isFocused && '★'}
    </div>
  )}
  onItemSelect={(item) => console.log('Selected:', item)}
/>
```

### 7. SpatialNavigationVirtualizedGrid

Virtualized grid for large datasets.

```tsx
<SpatialNavigationVirtualizedGrid
  data={data}
  columns={5}
  itemHeight={150}
  itemWidth={200}
  gap={10}
  renderItem={(item, index, isFocused) => (
    <div>{item.title}</div>
  )}
/>
```

## Utility Components & Hooks

### DefaultFocus

Auto-focuses the first element on mount.

```tsx
<SpatialNavigationRoot>
  <DefaultFocus />
  <MyContent />
</SpatialNavigationRoot>
```

### useLockSpatialNavigation

Lock/unlock navigation programmatically.

```tsx
function MyModal() {
  const { lock, unlock, isLocked } = useLockSpatialNavigation();
  
  useEffect(() => {
    lock(); // Lock when modal opens
    return () => unlock();
  }, []);
  
  return <div>Modal content</div>;
}
```

### useDeviceType

Detect device type.

```tsx
function MyComponent() {
  const { isTv, deviceType } = useDeviceType();
  
  return (
    <div>
      {isTv ? 'TV Interface' : 'Standard Interface'}
    </div>
  );
}

// With provider
<SpatialNavigationDeviceTypeProvider deviceType="tv">
  <App />
</SpatialNavigationDeviceTypeProvider>
```

### useSpatialNavigatorFocusableAccessibilityProps

Generate ARIA attributes for accessibility.

```tsx
const a11yProps = useSpatialNavigatorFocusableAccessibilityProps({
  label: 'Play Movie',
  hint: 'Press Enter to play',
  isSelected: isFocused,
});

<div {...a11yProps}>Play</div>
```

### configureRemoteControl

Custom key mappings for TV remotes.

```tsx
import { configureRemoteControl, TV_REMOTE_KEYS } from 'preact-spatial-navigation';

configureRemoteControl({
  up: [38, 'ArrowUp'],
  down: [40, 'ArrowDown'],
  left: [37, 'ArrowLeft'],
  right: [39, 'ArrowRight'],
  enter: [13, 'Enter'],
  back: [TV_REMOTE_KEYS.SAMSUNG_BACK], // Samsung-specific
});
```

## Legacy API

The original simple API is still fully supported:

```tsx
import { Grid, List, useFocusable } from 'preact-spatial-navigation';

<Grid columns={3}>
  <Item1 />
  <Item2 />
  <Item3 />
</Grid>

<List orientation="horizontal">
  <Item1 />
  <Item2 />
</List>
```

## Critical: The `focusable` Class

⚠️ **IMPORTANT**: Always include the `focusable` class in your elements' `className` when using `useFocusable`:

```tsx
// ✅ CORRECT
<div className={`my-button focusable ${focused ? 'focused' : ''}`}>

// ❌ WRONG - focusable class will be removed when focused
<div className={focused ? 'my-button focused' : 'my-button focusable'}>
```

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type {
  Direction,
  Orientation,
  NodeChildParams,
  SpatialNavigationNodeProps,
  DeviceType,
  RemoteControlConfig,
  // ... and many more
} from 'preact-spatial-navigation';
```

## Styling

Basic CSS for focus styles:

```css
.focusable {
  outline: none;
  transition: all 0.2s;
}

.focused {
  border: 3px solid #ffd700;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  transform: scale(1.05);
}
```

## Demo

Run the demo application:

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` and use arrow keys to navigate. Toggle between Legacy and New API demos.

## Build for Production

```bash
npm run build
```

Outputs:
- `dist/index.mjs` - ESM bundle
- `dist/index.cjs` - CommonJS bundle
- `dist/index.d.ts` - TypeScript definitions

## Platform Support

- ✅ Samsung Tizen
- ✅ LG webOS
- ✅ Android TV
- ✅ Apple TV (with web support)
- ✅ Generic HTML5 Smart TVs
- ✅ Desktop browsers (testing)
- ✅ Web TV simulators

## Browser Support

- Modern browsers with ES2022 support
- Smart TV browsers (Samsung, LG, etc.)
- Chrome, Firefox, Safari, Edge

## Contributing

Contributions are welcome! Please read the implementation plan in `/preact-spatial-navigation-library.plan.md`.

## License

MIT

## Credits

- Built with [Preact](https://preactjs.com/)
- Powered by [js-spatial-navigation](https://github.com/luke-chang/js-spatial-navigation)
- Event bus using [mitt](https://github.com/developit/mitt)
- Inspired by [react-tv-space-navigation](https://github.com/bamlab/react-tv-space-navigation)

---

**Happy TV app building!** 📺✨
