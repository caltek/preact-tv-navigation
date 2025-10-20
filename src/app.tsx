import { useState } from 'preact/hooks';
import {
  SpatialNavigationRoot,
  SpatialNavigationNode,
  SpatialNavigationView,
  SpatialNavigationDeviceTypeProvider,
  DefaultFocus,
  type FocusableNodeState,
} from '../lib/index';
import './app.css';
import { NestedScrollDemo } from './demos/NestedScrollDemo';
import { VirtualizedListDemo as VirtualizedListDemoComponent } from './demos/VirtualizedListDemo';
import { HorizontalVirtualizedListDemo as HorizontalVirtualizedListDemoComponent } from './demos/HorizontalVirtualizedListDemo';
import { GridDemo as GridDemoComponent } from './demos/GridDemo';

type DemoId = 'basic' | 'scrollview' | 'virtualized-list' | 'horizontal-list' | 'grid';

export function App() {
  const [activeDemo, setActiveDemo] = useState<DemoId | null>(null);

  if (activeDemo) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#0a0a0a',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Back button */}
        <button
          onClick={() => setActiveDemo(null)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            padding: '10px 20px',
            cursor: 'pointer',
            backgroundColor: '#E91E63',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '14px',
          }}
        >
          ← Back to Menu
        </button>
        
        {/* Render active demo */}
        {activeDemo === 'basic' && <BasicNavigationDemo />}
        {activeDemo === 'scrollview' && <NestedScrollDemo />}
        {activeDemo === 'virtualized-list' && <VirtualizedListDemoComponent />}
        {activeDemo === 'horizontal-list' && <HorizontalVirtualizedListDemoComponent />}
        {activeDemo === 'grid' && <GridDemoComponent />}
      </div>
    );
  }

  return (
    <SpatialNavigationDeviceTypeProvider>
      <SpatialNavigationRoot isActive={true}>
        <DefaultFocus />
        <div style={{
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px',
          boxSizing: 'border-box',
        }}>
        <div style={{
          maxWidth: '900px',
          width: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '15px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          <h1 style={{
            margin: '0 0 10px 0',
            fontSize: '36px',
            color: '#333',
          }}>
            Preact Spatial Navigation
          </h1>
          <p style={{
            margin: '0 0 30px 0',
            fontSize: '16px',
            color: '#666',
          }}>
            Powered by @bam.tech/lrud • Use arrow keys to navigate
          </p>

          <SpatialNavigationView direction="vertical" style={{ gap: '15px' }}>
            <DemoButton
              title="Basic Navigation"
              description="Simple focusable nodes with callbacks"
              icon="🎯"
              onClick={() => setActiveDemo('basic')}
            />
            <DemoButton
              title="ScrollView Demo"
              description="Auto-scrolling container with many items"
              icon="📜"
              onClick={() => setActiveDemo('scrollview')}
            />
            <DemoButton
              title="Vertical Virtualized List"
              description="Efficient vertical scrolling of thousands of items"
              icon="⚡"
              onClick={() => setActiveDemo('virtualized-list')}
            />
            <DemoButton
              title="Horizontal Virtualized List"
              description="Efficient horizontal scrolling of thousands of items"
              icon="↔️"
              onClick={() => setActiveDemo('horizontal-list')}
            />
            <DemoButton
              title="Grid Layout"
              description="Multi-column grid navigation"
              icon="📐"
              onClick={() => setActiveDemo('grid')}
            />
          </SpatialNavigationView>
        </div>
      </div>
      </SpatialNavigationRoot>
    </SpatialNavigationDeviceTypeProvider>
  );
}

function DemoButton({ title, description, icon, onClick }: {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <SpatialNavigationNode isFocusable onSelect={onClick}>
      {({ isFocused }: FocusableNodeState) => (
        <div style={{
          padding: '20px',
          borderRadius: '10px',
          backgroundColor: isFocused ? '#667eea' : '#f5f5f5',
          color: isFocused ? 'white' : '#333',
          cursor: 'pointer',
          transition: 'all 0.2s',
          transform: isFocused ? 'translateX(10px)' : 'translateX(0)',
          border: isFocused ? '3px solid white' : '3px solid transparent',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>{icon}</div>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '20px' }}>{title}</h3>
          <p style={{ margin: 0, fontSize: '14px', opacity: isFocused ? 0.9 : 0.7 }}>
            {description}
          </p>
        </div>
      )}
    </SpatialNavigationNode>
  );
}

// Demo 1: Basic Navigation
function BasicNavigationDemo() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <SpatialNavigationDeviceTypeProvider>
      <SpatialNavigationRoot isActive={true}>
        <DefaultFocus />
      <div style={{
        width: '100%',
        height: '100%',
        padding: '60px 40px 40px 40px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
      }}>
        <h1 style={{ margin: 0, fontSize: '32px' }}>Basic Navigation Demo</h1>
        
        {/* Horizontal row */}
        <section>
          <h2 style={{ margin: '0 0 15px 0', fontSize: '20px' }}>Horizontal Navigation</h2>
          <SpatialNavigationView direction="horizontal" style={{ gap: '15px' }}>
            {['Button A', 'Button B', 'Button C', 'Button D'].map(label => (
              <SpatialNavigationNode key={label} isFocusable onSelect={() => setSelected(label)}>
                {({ isFocused }: FocusableNodeState) => (
                  <div style={{
                    padding: '20px 30px',
                    borderRadius: '8px',
                    backgroundColor: isFocused ? '#4CAF50' : '#333',
                    border: isFocused ? '3px solid white' : '3px solid transparent',
                    transition: 'all 0.2s',
                  }}>
                    {label}
                  </div>
                )}
              </SpatialNavigationNode>
            ))}
          </SpatialNavigationView>
        </section>

        {/* Vertical row */}
        <section>
          <h2 style={{ margin: '0 0 15px 0', fontSize: '20px' }}>Vertical Navigation</h2>
          <SpatialNavigationView direction="vertical" style={{ gap: '10px', maxWidth: '300px' }}>
            {['Option 1', 'Option 2', 'Option 3'].map(label => (
              <SpatialNavigationNode key={label} isFocusable onSelect={() => setSelected(label)}>
                {({ isFocused }: FocusableNodeState) => (
                  <div style={{
                    padding: '15px',
                    borderRadius: '8px',
                    backgroundColor: isFocused ? '#2196F3' : '#444',
                    border: isFocused ? '2px solid white' : '2px solid transparent',
                  }}>
                    {label}
                  </div>
                )}
              </SpatialNavigationNode>
            ))}
          </SpatialNavigationView>
        </section>

        {selected && (
          <div style={{
            padding: '15px',
            borderRadius: '8px',
            backgroundColor: '#FFD700',
            color: '#000',
            fontWeight: 'bold',
          }}>
            Last selected: {selected}
          </div>
        )}
      </div>
      </SpatialNavigationRoot>
    </SpatialNavigationDeviceTypeProvider>
  );
}

// Demo 2: ScrollView - imported from separate file
// Demo 3: Virtualized List - imported from separate file
// Demo 4: Grid - imported from separate file
