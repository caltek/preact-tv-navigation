import { useState, useEffect } from 'preact/hooks';
import { 
  SpatialNavigationRoot, // Using new name
  useFocusable, 
  Grid, 
  List 
} from '../lib/index';
import './app.css';
import { NewAPIApp } from './demo-new-api';

// @ts-ignore - js-spatial-navigation doesn't have TypeScript definitions
import SpatialNavigation from 'js-spatial-navigation';

/**
 * Demo: Basic Focusable Component
 */
function FocusableButton({ children, onEnter }: { children: string; onEnter?: () => void }) {
  const { ref, focused } = useFocusable({
    onEnterPress: onEnter,
  });

  return (
    <button
      ref={ref}
      className={`demo-button focusable ${focused ? 'focused' : ''}`}
    >
      {children}
    </button>
  );
}

/**
 * Demo: Grid Item Component
 */
function GridItem({ index }: { index: number }) {
  const { ref, focused } = useFocusable({
    onEnterPress: () => alert(`Grid item ${index + 1} selected!`),
  });

  return (
    <div
      ref={ref}
      className={`grid-item focusable ${focused ? 'focused' : ''}`}
    >
      <div className="item-content">
        <div className="item-number">{index + 1}</div>
        <div className="item-label">Item</div>
      </div>
    </div>
  );
}

/**
 * Demo: List Item Component
 */
function ListItem({ title, description }: { title: string; description: string }) {
  const { ref, focused } = useFocusable({
    onEnterPress: () => alert(`${title} selected!`),
  });

  return (
    <div
      ref={ref}
      className={`list-item focusable ${focused ? 'focused' : ''}`}
    >
      <div className="list-item-title">{title}</div>
      <div className="list-item-description">{description}</div>
    </div>
  );
}

/**
 * Demo: Navigation Menu
 */
function NavigationMenu({ onSelect }: { onSelect: (menu: string) => void }) {
  const menuItems = ['Home', 'Movies', 'TV Shows', 'Settings'];

  return (
    <nav className="demo-nav">
      <List orientation="horizontal" gap="15px">
        {menuItems.map((item) => {
          const { ref, focused } = useFocusable({
            onEnterPress: () => onSelect(item),
          });

          return (
            <div
              key={item}
              ref={ref}
              className={`nav-item focusable ${focused ? 'focused' : ''}`}
            >
              {item}
            </div>
          );
        })}
      </List>
    </nav>
  );
}

/**
 * Main Demo Application
 */
export function App() {
  const [selectedMenu, setSelectedMenu] = useState('Home');
  const [count, setCount] = useState(0);
  const [showNewAPI, setShowNewAPI] = useState(false);

  useEffect(() => {
    // Focus the first element when app loads
    const timer = setTimeout(() => {
      SpatialNavigation.focus();
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  // Toggle between old and new API demos
  if (showNewAPI) {
    return (
      <div>
        <button
          onClick={() => setShowNewAPI(false)}
          style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            zIndex: 1000,
            padding: '10px 20px',
            cursor: 'pointer',
          }}
        >
          Switch to Legacy API Demo
        </button>
        <NewAPIApp />
      </div>
    );
  }

  return (
    <SpatialNavigationRoot>
      <div className="demo-app">
        <header className="demo-header">
          <h1>Preact Spatial Navigation Demo (Legacy API)</h1>
          <p className="demo-instructions">
            Use arrow keys to navigate • Press Enter to select
          </p>
          <button
            onClick={() => setShowNewAPI(true)}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              cursor: 'pointer',
              marginTop: '10px',
            }}
          >
            Switch to New API Demo
          </button>
        </header>

        <NavigationMenu onSelect={setSelectedMenu} />

        <main className="demo-main">
          {/* Section 1: Basic Focusable Elements */}
          <section className="demo-section">
            <h2>Basic Focusable Elements</h2>
            <div className="button-group">
              <FocusableButton onEnter={() => setCount(count + 1)}>
                Increment Counter
              </FocusableButton>
              <FocusableButton onEnter={() => setCount(count - 1)}>
                Decrement Counter
              </FocusableButton>
              <FocusableButton onEnter={() => setCount(0)}>
                Reset Counter
              </FocusableButton>
            </div>
            <div className="counter-display">Count: {count}</div>
          </section>

          {/* Section 2: Grid Layout */}
          <section className="demo-section">
            <h2>Grid Navigation (3 columns)</h2>
            <Grid columns={3} gap="15px">
              {Array.from({ length: 9 }, (_, i) => (
                <GridItem key={i} index={i} />
              ))}
            </Grid>
          </section>

          {/* Section 3: Vertical List */}
          <section className="demo-section">
            <h2>Vertical List Navigation</h2>
            <List orientation="vertical" gap="10px">
              <ListItem
                title="The Shawshank Redemption"
                description="Two imprisoned men bond over a number of years"
              />
              <ListItem
                title="The Godfather"
                description="The aging patriarch of an organized crime dynasty"
              />
              <ListItem
                title="The Dark Knight"
                description="When the menace known as the Joker wreaks havoc"
              />
              <ListItem
                title="Pulp Fiction"
                description="The lives of two mob hitmen, a boxer, a gangster"
              />
            </List>
          </section>

          {/* Section 4: Horizontal List */}
          <section className="demo-section">
            <h2>Horizontal List Navigation</h2>
            <List orientation="horizontal" gap="15px">
              {['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Thriller'].map((genre) => {
                const { ref, focused } = useFocusable({
                  onEnterPress: () => alert(`${genre} selected!`),
                });

                return (
                  <div
                    key={genre}
                    ref={ref}
                    className={`genre-card focusable ${focused ? 'focused' : ''}`}
                  >
                    <div className="genre-icon">🎬</div>
                    <div className="genre-name">{genre}</div>
                  </div>
                );
              })}
            </List>
          </section>

          {/* Section 5: Multiple Grids */}
          <section className="demo-section">
            <h2>Multiple Grid Sections</h2>
            <div className="grid-sections">
              <div>
                <h3>Grid A (2 columns)</h3>
                <Grid columns={2} gap="10px">
                  {Array.from({ length: 4 }, (_, i) => (
                    <GridItem key={i} index={i} />
                  ))}
                </Grid>
              </div>
              <div>
                <h3>Grid B (2 columns)</h3>
                <Grid columns={2} gap="10px">
                  {Array.from({ length: 4 }, (_, i) => (
                    <GridItem key={i + 4} index={i + 4} />
                  ))}
                </Grid>
              </div>
            </div>
          </section>
        </main>

        <footer className="demo-footer">
          <p>Current Menu: <strong>{selectedMenu}</strong></p>
          <p>Built with Preact Spatial Navigation Library (Legacy API: useFocusable, Grid, List)</p>
        </footer>
      </div>
    </SpatialNavigationRoot>
  );
}
