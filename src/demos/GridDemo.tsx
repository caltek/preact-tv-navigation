import { useState } from 'preact/hooks';
import {
  SpatialNavigationRoot,
  SpatialNavigationNode,
  SpatialNavigationVirtualizedGrid,
  SpatialNavigationView,
  SpatialNavigationDeviceTypeProvider,
  DefaultFocus,
  type FocusableNodeState,
} from '../../lib/index';

type ColumnCount = 3 | 4 | 5 | 6;

/**
 * Demo: Grid Layout
 * - Multi-column grid with 2D navigation
 * - Virtualized for performance
 */
export function GridDemo() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [columns, setColumns] = useState<ColumnCount>(4);

  // Generate a large dataset for the grid
  const gridData = Array.from({ length: 500 }, (_, i) => ({
    id: i,
    title: `Item ${i + 1}`,
    category: ['Movies', 'TV Shows', 'Sports', 'Music', 'Games'][i % 5],
  }));

  console.log('🎯 GridDemo: Component render', {
    selectedItem,
    columns,
    gridDataLength: gridData.length,
  });

  return (
    <SpatialNavigationDeviceTypeProvider>
      <SpatialNavigationRoot isActive={true}>
        <DefaultFocus />
        
        {/* Main container - constrained to 100vw x 100vh */}
        <div style={{
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          backgroundColor: '#0a0a0a',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}>
          
          {/* Header - fixed height */}
          <header style={{
            padding: '20px 40px',
            borderBottom: '2px solid #333',
            flexShrink: 0,
          }}>
            <h1 style={{ margin: '0 0 5px 0', fontSize: '28px' }}>
              Grid Layout Demo
            </h1>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#888' }}>
              {gridData.length} items • {columns} columns • 2D navigation (↕️↔️)
            </p>
            {selectedItem && (
              <p style={{ margin: '10px 0 0 0', color: '#FFD700', fontSize: '14px' }}>
                Selected: {selectedItem}
              </p>
            )}
          </header>

          {/* Content area */}
          <SpatialNavigationView 
            direction="horizontal" 
            style={{
              flex: 1,
              overflow: 'hidden',
              gap: '20px',
              padding: '20px',
            }}
          >
            
            {/* Sidebar - Column selector */}
            <SpatialNavigationNode orientation="vertical" isFocusable={false}>
              <aside style={{
                width: '180px',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#E91E63' }}>
                  Columns
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <ColumnButton
                    count={3}
                    isActive={columns === 3}
                    onClick={() => setColumns(3)}
                  />
                  <ColumnButton
                    count={4}
                    isActive={columns === 4}
                    onClick={() => setColumns(4)}
                  />
                  <ColumnButton
                    count={5}
                    isActive={columns === 5}
                    onClick={() => setColumns(5)}
                  />
                  <ColumnButton
                    count={6}
                    isActive={columns === 6}
                    onClick={() => setColumns(6)}
                  />
                </div>
              </aside>
            </SpatialNavigationNode>

            {/* Main grid */}
            <SpatialNavigationNode orientation="vertical" isFocusable={false}>
              <main style={{
                flex: 1,
                overflow: 'hidden',
                border: '2px solid #333',
                borderRadius: '8px',
                backgroundColor: '#111',
              }}>
                <SpatialNavigationVirtualizedGrid
                  data={gridData}
                  numberOfColumns={columns}
                  itemHeight={150}
                  scrollBehavior="center"
                  scrollDuration={200}
                  additionalRenderedRows={2}
                  renderItem={({ item, index }) => (
                    <SpatialNavigationNode
                      isFocusable
                      onSelect={() => setSelectedItem(`${item.title} - ${item.category}`)}
                    >
                      {({ isFocused }: FocusableNodeState) => (
                        <div style={{
                          height: '140px',
                          margin: '5px',
                          borderRadius: '8px',
                          backgroundColor: isFocused ? '#E91E63' : '#1a1a1a',
                          border: isFocused ? '3px solid white' : '3px solid #333',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                          transform: isFocused ? 'scale(1.08)' : 'scale(1)',
                          boxShadow: isFocused ? '0 6px 20px rgba(233, 30, 99, 0.6)' : 'none',
                          cursor: 'pointer',
                        }}>
                          {/* Icon based on category */}
                          <div style={{
                            fontSize: '40px',
                            marginBottom: '10px',
                          }}>
                            {item.category === 'Movies' && '🎬'}
                            {item.category === 'TV Shows' && '📺'}
                            {item.category === 'Sports' && '⚽'}
                            {item.category === 'Music' && '🎵'}
                            {item.category === 'Games' && '🎮'}
                          </div>
                          
                          {/* Title */}
                          <div style={{
                            fontSize: '14px',
                            fontWeight: isFocused ? 'bold' : 'normal',
                            marginBottom: '4px',
                            textAlign: 'center',
                          }}>
                            {item.title}
                          </div>
                          
                          {/* Category */}
                          <div style={{
                            fontSize: '11px',
                            color: isFocused ? '#fff' : '#888',
                            textAlign: 'center',
                          }}>
                            {item.category}
                          </div>

                          {/* Index badge */}
                          <div style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            padding: '3px 8px',
                            backgroundColor: isFocused ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                          }}>
                            #{index + 1}
                          </div>
                        </div>
                      )}
                    </SpatialNavigationNode>
                  )}
                />
              </main>
            </SpatialNavigationNode>
          </SpatialNavigationView>

          {/* Footer - fixed height */}
          <footer style={{
            padding: '15px 40px',
            borderTop: '1px solid #333',
            fontSize: '12px',
            color: '#666',
            textAlign: 'center',
            flexShrink: 0,
          }}>
            ↕️↔️ Navigate grid in any direction • ← → Change columns • Press Enter to select
          </footer>
        </div>
      </SpatialNavigationRoot>
    </SpatialNavigationDeviceTypeProvider>
  );
}

function ColumnButton({ count, isActive, onClick }: {
  count: ColumnCount;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <SpatialNavigationNode isFocusable onSelect={onClick}>
      {({ isFocused }: FocusableNodeState) => (
        <div style={{
          padding: '15px',
          borderRadius: '8px',
          backgroundColor: isActive ? '#9C27B0' : (isFocused ? '#E91E63' : '#1a1a1a'),
          border: isFocused ? '3px solid white' : '3px solid #333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          transition: 'all 0.2s',
          cursor: 'pointer',
        }}>
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold',
          }}>
            {count}
          </div>
          <div style={{
            fontSize: '13px',
            color: isFocused || isActive ? '#fff' : '#888',
          }}>
            columns
          </div>
          {isActive && (
            <div style={{
              marginLeft: 'auto',
              fontSize: '14px',
            }}>
              ✓
            </div>
          )}
        </div>
      )}
    </SpatialNavigationNode>
  );
}

