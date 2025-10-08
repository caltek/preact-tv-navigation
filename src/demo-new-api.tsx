import { useState } from 'preact/hooks';
import {
  SpatialNavigationRoot,
  SpatialNavigationNode,
  SpatialNavigationView,
  SpatialNavigationScrollView,
} from '../lib/index';
import './app.css';

/**
 * Demo showcasing the new API components from Phase 1 & 2
 */
export function NewAPIApp() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [borderDirection, setBorderDirection] = useState<string | null>(null);
  const [rootActive, setRootActive] = useState(true);

  return (
    <SpatialNavigationRoot
      isActive={rootActive}
      onDirectionHandledWithoutMovement={(direction) => {
        setBorderDirection(direction);
        setTimeout(() => setBorderDirection(null), 1000);
      }}
    >
      <div className="demo-app">
        <header className="demo-header">
          <h1>Preact Spatial Navigation - New API Demo</h1>
          <p className="demo-instructions">
            Use arrow keys to navigate • Press Enter to select
          </p>
          {borderDirection && (
            <p style={{ color: '#ffd700' }}>
              Reached border: {borderDirection}
            </p>
          )}
        </header>

        <main className="demo-main">
          {/* Section 1: Basic SpatialNavigationNode */}
          <section className="demo-section" style={{ marginBottom: '40px' }}>
            <h2>SpatialNavigationNode (Focusable)</h2>
            <p>Focusable nodes with callbacks and render function</p>
            
            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
              <SpatialNavigationNode
                orientation="horizontal"
                registerSection={true}
                restrict="self-only"
              >
                {[1, 2, 3, 4].map((num) => (
                  <SpatialNavigationNode
                    key={num}
                    isFocusable={true}
                    onFocus={() => console.log(`Node ${num} focused`)}
                    onSelect={() => setSelectedItem(`Node ${num}`)}
                    onLongSelect={() => setSelectedItem(`Node ${num} (long press)`)}
                  >
                    {({ isFocused, isRootActive }) => (
                      <div
                        className={`demo-button ${isFocused ? 'focused' : ''}`}
                        style={{
                          opacity: isRootActive ? 1 : 0.5,
                          padding: '20px',
                          margin: '5px',
                        }}
                      >
                        Node {num}
                        {isFocused && ' (focused)'}
                      </div>
                    )}
                  </SpatialNavigationNode>
                ))}
              </SpatialNavigationNode>
            </div>
            
            {selectedItem && (
              <div className="counter-display">
                Last selected: {selectedItem}
              </div>
            )}
          </section>

          {/* Section 2: SpatialNavigationView */}
          <section className="demo-section" style={{ marginBottom: '40px' }}>
            <h2>SpatialNavigationView</h2>
            <p>Simple wrapper for layout - horizontal orientation</p>
            
            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
              <SpatialNavigationNode
                orientation="horizontal"
                registerSection={true}
                restrict="self-only"
              >
                {['A', 'B', 'C', 'D', 'E'].map((letter) => (
                  <SpatialNavigationNode key={letter} isFocusable={true}>
                    {({ isFocused }) => (
                      <div className={`grid-item ${isFocused ? 'focused' : ''}`}>
                        <div className="item-content">
                          <div className="item-number">{letter}</div>
                          <div className="item-label">Item</div>
                        </div>
                      </div>
                    )}
                  </SpatialNavigationNode>
                ))}
              </SpatialNavigationNode>
            </div>
          </section>

          {/* Section 3: SpatialNavigationScrollView */}
          <section className="demo-section" style={{ marginBottom: '40px' }}>
            <h2>SpatialNavigationScrollView (Horizontal)</h2>
            <p>Auto-scrolls to keep focused item visible</p>
            
            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
              <SpatialNavigationScrollView
                horizontal={true}
                offsetFromStart={20}
                style={{ maxWidth: '600px' }}
              >
                {Array.from({ length: 20 }, (_, i) => (
                  <SpatialNavigationNode key={i} isFocusable={true}>
                    {({ isFocused }) => (
                      <div
                        className={`genre-card ${isFocused ? 'focused' : ''}`}
                        style={{ minWidth: '150px', margin: '0 10px' }}
                      >
                        <div className="genre-icon">📺</div>
                        <div className="genre-name">Item {i + 1}</div>
                      </div>
                    )}
                  </SpatialNavigationNode>
                ))}
              </SpatialNavigationScrollView>
            </div>
          </section>
        </main>

        <footer className="demo-footer">
          <p>New API Demo - SpatialNavigationRoot, Node, View, ScrollView</p>
        </footer>
      </div>
    </SpatialNavigationRoot>
  );
}

