# Usage Guide - Preact Spatial Navigation

## Getting Started

### Running the Demo

To see the library in action, run the demo application:

```bash
npm run dev
```

Then open your browser and use the arrow keys to navigate between elements. Press Enter to interact.

### Building the Library

To build the library for distribution:

```bash
npm run build
```

This will:
1. Build the library code (ESM and CJS formats) in `dist/`
2. Generate TypeScript declaration files

### Project Structure

```
├── lib/                    # Library source code
│   ├── components/        # Grid, List components
│   ├── context/           # SpatialNavigationProvider
│   ├── hooks/             # useFocusable hook
│   ├── types/             # TypeScript definitions
│   ├── utils/             # Event bus and helpers
│   └── index.ts           # Main exports
├── src/                   # Demo application
│   ├── app.tsx            # Demo app with examples
│   └── app.css            # Styles for demo
├── dist/                  # Built library (generated)
└── package.json           # Package configuration
```

## Using the Library in Your Project

### 1. Wrap Your App

```tsx
import { SpatialNavigationProvider } from 'preact-spatial-navigation';

function App() {
  return (
    <SpatialNavigationProvider>
      {/* Your app content */}
    </SpatialNavigationProvider>
  );
}
```

### 2. Create Focusable Elements

```tsx
import { useFocusable } from 'preact-spatial-navigation';

function Button({ label, onClick }) {
  const { ref, focused } = useFocusable({
    onEnterPress: onClick,
  });

  return (
    <button
      ref={ref}
      className={focused ? 'focused' : ''}
    >
      {label}
    </button>
  );
}
```

### 3. Add Focus Styles

The library uses border and shadow for focus states (no background color):

```css
.focused {
  border: 3px solid #ffd700;
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  transition: all 0.2s ease;
}
```

### 4. Use Grid Layout

```tsx
import { Grid, useFocusable } from 'preact-spatial-navigation';

function MovieGrid() {
  const movies = [...]; // Your data
  
  return (
    <Grid columns={4} gap="20px">
      {movies.map(movie => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </Grid>
  );
}

function MovieCard({ movie }) {
  const { ref, focused } = useFocusable({
    onEnterPress: () => playMovie(movie),
  });

  return (
    <div ref={ref} className={focused ? 'focused' : ''}>
      <img src={movie.poster} />
      <h3>{movie.title}</h3>
    </div>
  );
}
```

### 5. Use List Layout

```tsx
import { List, useFocusable } from 'preact-spatial-navigation';

function Menu() {
  return (
    <List orientation="vertical" gap="10px">
      <MenuItem label="Home" />
      <MenuItem label="Settings" />
      <MenuItem label="About" />
    </List>
  );
}
```

## Advanced Features

### Listen to Navigation Events

```tsx
import { navigationEventBus } from 'preact-spatial-navigation';
import { useEffect } from 'preact/hooks';

function MyComponent() {
  useEffect(() => {
    const handleFocus = (detail) => {
      console.log('Element focused:', detail);
    };

    navigationEventBus.on('focus', handleFocus);

    return () => {
      navigationEventBus.off('focus', handleFocus);
    };
  }, []);
}
```

### Custom Focus Behavior

```tsx
const { ref, focused, focus, blur } = useFocusable({
  onFocus: () => console.log('Gained focus'),
  onBlur: () => console.log('Lost focus'),
  onEnterPress: () => console.log('Enter pressed'),
  disabled: false,
  autoFocus: false,
  focusedClassName: 'my-focus-class',
  trackingId: 'unique-id',
});
```

### Programmatic Focus Control

```tsx
function MyComponent() {
  const { ref, focus, blur } = useFocusable();

  return (
    <>
      <div ref={ref}>Focusable Item</div>
      <button onClick={() => focus()}>Focus This</button>
      <button onClick={() => blur()}>Blur This</button>
    </>
  );
}
```

### Grid Configuration

```tsx
<Grid
  columns={3}
  gap="15px"
  enterTo="last-focused"        // 'last-focused' | 'default-element' | ''
  restrict="self-first"         // 'self-first' | 'self-only' | 'none'
  disabled={false}
  rememberLastFocus={true}
  defaultElement=".first-item"
>
  {/* Grid items */}
</Grid>
```

### List Configuration

```tsx
<List
  orientation="horizontal"      // 'vertical' | 'horizontal'
  gap="10px"
  enterTo="last-focused"
  restrict="self-first"
  disabled={false}
  rememberLastFocus={true}
>
  {/* List items */}
</List>
```

## Keyboard Controls

- **Arrow Keys**: Navigate between focusable elements
- **Enter**: Activate the focused element (triggers `onEnterPress`)

## Testing

Run the demo and test with:

1. Arrow keys for navigation
2. Enter key for selection
3. Multiple sections (grids, lists)
4. Nested navigation

## Troubleshooting

### Elements not focusable?
- Make sure they're wrapped with `SpatialNavigationProvider`
- Check that the `ref` is properly attached
- Verify the element has the `focusable` class

### Navigation not working?
- Check browser console for errors
- Ensure `js-spatial-navigation` is initialized
- Verify event listeners are attached

### Focus styles not showing?
- Add CSS for `.focused` class
- Check for CSS conflicts
- Verify the `focused` state is being set

## Publishing

To publish the library to npm:

1. Update version in `package.json`
2. Build the library: `npm run build`
3. Test the build locally
4. Publish: `npm publish`

## Next Steps

- Add unit tests
- Add E2E tests for navigation
- Add more examples
- Enhance documentation
- Add CI/CD pipeline

