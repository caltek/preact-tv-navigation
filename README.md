# Preact Spatial Navigation

A powerful, production-ready Preact library for TV-style spatial navigation using the LRUD algorithm from [@bam.tech/lrud](https://github.com/bamlab/lrud). Perfect for Smart TV apps, Set-top boxes, and any application requiring directional pad (D-pad) navigation.

**Ported from [react-tv-space-navigation](https://github.com/bamlab/react-tv-space-navigation)** to Preact with web optimizations.

## ✨ Features

- 🎯 **LRUD-based spatial navigation** - Intelligent directional navigation
- 📺 **Smart TV ready** - Works on Tizen, webOS, Android TV, and more
- ⚡ **Virtualized lists & grids** - Handle 10,000+ items smoothly
- 🎨 **Render props pattern** - Full control over UI and focus states
- 🔄 **Auto-scrolling** - Keeps focused items visible automatically
- 📱 **Device type aware** - Keyboard, remote, and pointer support
- 🎮 **Flexible remote control** - Easy key mapping configuration
- ♿ **Accessibility built-in** - ARIA attributes out of the box
- 📦 **TypeScript first** - Complete type definitions
- 🌐 **Old browser support** - Chrome 35+ (ES2015)

## 📦 Installation

```bash
npm install preact-spatial-navigation
# or
yarn add preact-spatial-navigation
```

**Peer dependencies:**
```bash
npm install preact@^10.0.0
```

## 🚀 Quick Start

### 1. Configure Remote Control

```tsx
import { configureRemoteControl, createKeyboardRemoteControl } from 'preact-spatial-navigation';

// For web development (keyboard arrows)
const { subscriber, unsubscriber } = createKeyboardRemoteControl();
configureRemoteControl({
  remoteControlSubscriber: subscriber,
  remoteControlUnsubscriber: unsubscriber,
});
```

### 2. Basic Navigation

```tsx
import {
  SpatialNavigationRoot,
  SpatialNavigationNode,
  DefaultFocus,
} from 'preact-spatial-navigation';

function App() {
  return (
    <SpatialNavigationRoot isActive={true}>
      <DefaultFocus />
      
      <SpatialNavigationNode
        isFocusable
        onSelect={() => console.log('Selected!')}
      >
        {({ isFocused }) => (
          <button style={{
            backgroundColor: isFocused ? '#E91E63' : '#333',
            border: isFocused ? '3px solid white' : 'none',
          }}>
            Click Me {isFocused && '★'}
          </button>
        )}
      </SpatialNavigationNode>
    </SpatialNavigationRoot>
  );
}
```

## 📚 Core Components

### SpatialNavigationRoot

The root provider that manages navigation state.

```tsx
<SpatialNavigationRoot
  isActive={true}
  onDirectionHandledWithoutMovement={(direction) => {
    console.log('Reached border:', direction);
  }}
>
  {children}
</SpatialNavigationRoot>
```

### SpatialNavigationNode

The core building block - can be focusable or a container.

```tsx
// Focusable node
<SpatialNavigationNode
  isFocusable
  onFocus={() => console.log('Focused')}
  onSelect={() => console.log('Selected')}
>
  {({ isFocused, isActive }) => (
    <div>{isFocused ? 'FOCUSED' : 'Normal'}</div>
  )}
</SpatialNavigationNode>

// Container node
<SpatialNavigationNode orientation="horizontal">
  {({ isActive }) => (
    <div style={{ opacity: isActive ? 1 : 0.5 }}>
      <ChildNodes />
    </div>
  )}
</SpatialNavigationNode>
```

**Props:**
- `isFocusable`: Whether node can receive focus
- `orientation`: 'vertical' | 'horizontal'
- `onFocus`, `onBlur`, `onSelect`, `onLongSelect`: Callbacks
- `onActive`, `onInactive`: Container state changes
- `alignInGrid`: Enable grid alignment
- `children`: Render function or elements

### SpatialNavigationView

Simple layout wrapper.

```tsx
<SpatialNavigationView direction="horizontal">
  <Item1 />
  <Item2 />
  <Item3 />
</SpatialNavigationView>
```

### SpatialNavigationScrollView

Auto-scrolling container.

```tsx
<SpatialNavigationScrollView
  horizontal={false}
  offsetFromStart={100}
>
  <LongListOfItems />
</SpatialNavigationScrollView>
```

### SpatialNavigationVirtualizedList

Efficiently render thousands of items.

```tsx
<SpatialNavigationVirtualizedList
  data={items}
  itemSize={80}
  orientation="vertical"
  scrollBehavior="center"
  scrollDuration={200}
  renderItem={({ item, index }) => (
    <SpatialNavigationNode isFocusable>
      {({ isFocused }) => (
        <div style={{ height: '70px' }}>
          {item.title}
        </div>
      )}
    </SpatialNavigationNode>
  )}
/>
```

**Scroll Behaviors:**
- `stick-to-start`: Focused item at top
- `stick-to-end`: Focused item at bottom (recommended)
- `center`: Item stays centered (hybrid mode)
- `jump-on-scroll`: Page-by-page scrolling

### SpatialNavigationVirtualizedGrid

Multi-column virtualized grid.

```tsx
<SpatialNavigationVirtualizedGrid
  data={items}
  numberOfColumns={5}
  itemHeight={150}
  scrollBehavior="center"
  renderItem={({ item }) => (
    <SpatialNavigationNode isFocusable>
      {({ isFocused }) => (
        <div>{item.title}</div>
      )}
    </SpatialNavigationNode>
  )}
/>
```

## 🔧 Advanced Usage

### Device Type Provider

```tsx
import { SpatialNavigationDeviceTypeProvider } from 'preact-spatial-navigation';

<SpatialNavigationDeviceTypeProvider deviceType="tv">
  <App />
</SpatialNavigationDeviceTypeProvider>
```

### Lock/Unlock Navigation

```tsx
import { useLockSpatialNavigation } from 'preact-spatial-navigation';

function Modal() {
  const { lock, unlock } = useLockSpatialNavigation();
  
  useEffect(() => {
    lock();
    return () => unlock();
  }, []);
  
  return <div>Modal</div>;
}
```

### Custom Remote Control

```tsx
import { configureRemoteControl, Directions } from 'preact-spatial-navigation';

// For Samsung Tizen
configureRemoteControl({
  remoteControlSubscriber: (callback) => {
    const handler = (event) => {
      const keyMap = {
        37: Directions.LEFT,
        38: Directions.UP,
        39: Directions.RIGHT,
        40: Directions.DOWN,
        13: Directions.ENTER,
      };
      callback(keyMap[event.keyCode] || null);
    };
    window.addEventListener('keydown', handler);
    return handler;
  },
  remoteControlUnsubscriber: (handler) => {
    window.removeEventListener('keydown', handler);
  },
});
```

## 🎯 Platform Support

### Tested Platforms
- ✅ **Samsung Tizen** 2.4+
- ✅ **LG webOS** 3.0+
- ✅ **Android TV**
- ✅ **Desktop browsers** (Chrome, Firefox, Safari, Edge)
- ✅ **Old browsers** (Chrome 35+, ES2015)

### Browser Support
- **Chrome** 35+
- **Firefox** 38+
- **Safari** 9+
- **Edge** 12+
- Smart TV browsers (Samsung, LG, etc.)

## 📖 API Reference

### Exports

```tsx
// Components
export { SpatialNavigationRoot }
export { SpatialNavigationNode }
export { SpatialNavigationView }
export { SpatialNavigationFocusableView }
export { SpatialNavigationScrollView }
export { SpatialNavigationVirtualizedList }
export { SpatialNavigationVirtualizedGrid }
export { DefaultFocus }
export { SpatialNavigationDeviceTypeProvider }

// Hooks
export { useSpatialNavigator }
export { useLockSpatialNavigation }
export { useDeviceType }
export { useSpatialNavigatorFocusableAccessibilityProps }

// Configuration
export { configureRemoteControl, createKeyboardRemoteControl }
export { SpatialNavigation } // Namespace

// Utilities
export { Directions } // from @bam.tech/lrud
export { TV_REMOTE_KEYS }

// Types
export type { FocusableNodeState, NonFocusableNodeState }
export type { SpatialNavigationNodeRef }
export type { ScrollBehavior }
// ... and many more
```

## 🏗️ Building & Publishing

```bash
# Build library
npm run build

# Run demos locally
npm run dev

# Preview production build
npm run build:demo
npm run preview
```

## 📝 Migration from react-tv-space-navigation

This library maintains API compatibility with react-tv-space-navigation:

- ✅ Same component names and props
- ✅ Same render props pattern
- ✅ Same LRUD-based navigation
- ✅ Adapted for Preact and web platform
- ✅ Added convenience features (keyboard remote control helper)

## 🤝 Contributing

Contributions welcome! The library is built with:
- **Preact** - Fast 3KB React alternative
- **@bam.tech/lrud** - Spatial navigation algorithm
- **TypeScript** - Type safety
- **Vite** - Fast build tool

## 📄 License

MIT

## 🙏 Credits

- [react-tv-space-navigation](https://github.com/bamlab/react-tv-space-navigation) by BAM - Original React implementation
- [@bam.tech/lrud](https://github.com/bamlab/lrud) - LRUD algorithm
- [Preact](https://preactjs.com/) - Fast React alternative
- [mitt](https://github.com/developit/mitt) - Event emitter

---

**Made for TV. Built with ❤️**
