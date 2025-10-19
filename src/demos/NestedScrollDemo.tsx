import { useState } from 'preact/hooks';
import {
  SpatialNavigationRoot,
  SpatialNavigationNode,
  SpatialNavigationScrollView,
  SpatialNavigationView,
  SpatialNavigationDeviceTypeProvider,
  DefaultFocus,
  type FocusableNodeState,
} from '../../lib/index';

/**
 * Demo: Nested ScrollView
 * - Vertical scrollview with 10 rows
 * - Each row is a horizontal scrollview with 10-15 items
 */
export function NestedScrollDemo() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // Generate 10 rows with varying number of items (10-15 per row)
  const rows = Array.from({ length: 10 }, (_, rowIndex) => ({
    id: rowIndex,
    title: `Row ${rowIndex + 1}`,
    itemCount: 10 + Math.floor(Math.random() * 6), // 10-15 items
  }));

  console.log('🎯 NestedScrollDemo: Component render', {
    selectedItem,
    rowsCount: rows.length,
    totalItems: rows.reduce((sum, row) => sum + row.itemCount, 0),
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
            Nested ScrollView Demo
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#888' }}>
            ↕️ Vertical scroll between rows • ↔️ Horizontal scroll within rows
          </p>
          {selectedItem && (
            <p style={{ margin: '10px 0 0 0', color: '#FFD700', fontSize: '14px' }}>
              Selected: {selectedItem}
            </p>
          )}
        </header>

        {/* Content area with scrolling */}
        <div style={{ 
          flex: 1, 
          overflow: 'hidden', 
          display: 'flex', 
          WebkitBoxOrient: 'vertical', // Chrome 38 fallback
          flexDirection: 'column' 
        }}>
          <SpatialNavigationScrollView
            horizontal={false}
            offsetFromStart={100}
            style={{
              flex: 1,
            }}
          >
            <SpatialNavigationView direction="vertical" style={{ 
              gap: '30px', 
              padding: '0 40px',
              // Chrome 38 specific fixes
              display: 'flex',
              WebkitBoxOrient: 'vertical',
              flexDirection: 'column',
            }}>
              {rows.map((row) => (
                <div key={row.id}>
                  {/* Row Title */}
                  <h2 style={{
                    margin: '0 0 15px 0',
                    fontSize: '18px',
                    color: '#E91E63',
                  }}>
                    {row.title} ({row.itemCount} items)
                  </h2>

                  {/* Horizontal ScrollView for this row */}
                  <div style={{ width: '100%', maxWidth: 'calc(100vw - 80px)' }}>
                    <SpatialNavigationScrollView
                      horizontal={true}
                      offsetFromStart={10}
                      style={{
                        width: '100%',
                        maxHeight: '150px',
                      }}
                    >
                      <SpatialNavigationView direction="horizontal" style={{ 
                        gap: '15px',
                        // Chrome 38 specific fixes
                        display: 'flex',
                        WebkitBoxOrient: 'horizontal',
                        flexDirection: 'row',
                      }}>
                        {Array.from({ length: row.itemCount }, (_, itemIndex) => (
                          <SpatialNavigationNode
                            key={itemIndex}
                            isFocusable
                            onSelect={() => setSelectedItem(`${row.title} - Item ${itemIndex + 1}`)}
                          >
                            {({ isFocused }: FocusableNodeState) => (
                              <div style={{
                                minWidth: '180px',
                                width: '180px',
                                height: '110px',
                                borderRadius: '8px',
                                backgroundColor: isFocused ? '#E91E63' : '#1a1a1a',
                                border: isFocused ? '3px solid white' : '3px solid #333',
                                // Chrome 38 compatible flexbox
                                display: 'flex',
                                WebkitBoxOrient: 'vertical',
                                flexDirection: 'column',
                                WebkitBoxAlign: 'center',
                                alignItems: 'center',
                                WebkitBoxPack: 'center',
                                justifyContent: 'center',
                                // Chrome 38 compatible transitions
                                WebkitTransition: 'all 0.2s',
                                transition: 'all 0.2s',
                                WebkitTransform: isFocused ? 'scale(1.05)' : 'scale(1)',
                                transform: isFocused ? 'scale(1.05)' : 'scale(1)',
                                boxShadow: isFocused ? '0 4px 20px rgba(233, 30, 99, 0.6)' : 'none',
                                flexShrink: 0,
                                // Chrome 38 specific fixes
                                WebkitBackfaceVisibility: 'hidden',
                                backfaceVisibility: 'hidden',
                              }}>
                                <div style={{
                                  fontSize: '28px',
                                  marginBottom: '8px',
                                }}>
                                  📺
                                </div>
                                <div style={{
                                  fontSize: '14px',
                                  fontWeight: isFocused ? 'bold' : 'normal',
                                }}>
                                  Item {itemIndex + 1}
                                </div>
                                <div style={{
                                  fontSize: '11px',
                                  color: isFocused ? '#fff' : '#888',
                                  marginTop: '4px',
                                }}>
                                  {itemIndex + 1} / {row.itemCount}
                                </div>
                              </div>
                            )}
                          </SpatialNavigationNode>
                        ))}
                      </SpatialNavigationView>
                    </SpatialNavigationScrollView>
                  </div>
                </div>
              ))}
            </SpatialNavigationView>
          </SpatialNavigationScrollView>
        </div>

        {/* Footer - fixed height */}
        <footer style={{
          padding: '15px 40px',
          borderTop: '1px solid #333',
          fontSize: '12px',
          color: '#666',
          textAlign: 'center',
          flexShrink: 0,
        }}>
          Use arrow keys to navigate • Press Enter to select
        </footer>
      </div>
      </SpatialNavigationRoot>
    </SpatialNavigationDeviceTypeProvider>
  );
}
