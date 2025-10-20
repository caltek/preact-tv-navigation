import { useState } from "preact/hooks";
import {
  SpatialNavigationRoot,
  SpatialNavigationNode,
  SpatialNavigationVirtualizedList,
  SpatialNavigationView,
  SpatialNavigationDeviceTypeProvider,
  DefaultFocus,
  type FocusableNodeState,
} from "../../lib/index";

type DatasetSize = "small" | "medium" | "large";

/**
 * Demo: Horizontal Virtualized List
 * - Efficiently renders thousands of items horizontally
 * - Only visible items are in the DOM
 * - Smooth horizontal scrolling with centered items
 */
export function HorizontalVirtualizedListDemo() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [datasetSize, setDatasetSize] = useState<DatasetSize>("medium");

  // Generate datasets of different sizes
  const datasets = {
    small: Array.from({ length: 100 }, (_, i) => ({
      id: i,
      title: `Item ${i + 1}`,
      subtitle: `Description for item ${i + 1}`,
    })),
    medium: Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      title: `Item ${i + 1}`,
      subtitle: `Description for item ${i + 1}`,
    })),
    large: Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      title: `Item ${i + 1}`,
      subtitle: `Description for item ${i + 1}`,
    })),
  };

  const currentData = datasets[datasetSize];

  return (
    <SpatialNavigationDeviceTypeProvider>
      <SpatialNavigationRoot isActive={true}>
        <DefaultFocus />

        {/* Main container - constrained to 100vw x 100vh */}
        <div
          style={{
            width: "100vw",
            height: "100vh",
            overflow: "hidden",
            backgroundColor: "#0a0a0a",
            color: "white",
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
          }}>
          {/* Header - fixed height */}
          <header
            style={{
              padding: "20px 40px",
              borderBottom: "2px solid #333",
              flexShrink: 0,
            }}>
            <h1 style={{ margin: "0 0 5px 0", fontSize: "28px" }}>
              Horizontal Virtualized List Demo
            </h1>
            <p style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#888" }}>
              {currentData.length.toLocaleString()} items • Scroll horizontally with centered items
            </p>
            {selectedItem && (
              <p style={{ margin: "10px 0 0 0", color: "#FFD700", fontSize: "14px" }}>
                Selected: {selectedItem}
              </p>
            )}
          </header>

          {/* Content area - Chrome 38 compatible */}
          <div style={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            padding: "20px",
            gap: "20px",
            // Chrome 38 specific fixes
            position: "relative",
            minHeight: 0,
            height: "100%",
          }}>
          <SpatialNavigationView
            direction="vertical"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              height: "100%",
            }}>
            {/* Top bar - Dataset size selector */}
            <SpatialNavigationNode orientation="horizontal" isFocusable={false}>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  flexShrink: 0,
                  minHeight: "60px",
                }}>
                <h3 style={{ margin: "0 20px 0 0", fontSize: "16px", color: "#E91E63" }}>
                  Dataset Size:
                </h3>
                <DatasetButton
                  label="100 Items"
                  icon="📝"
                  isActive={datasetSize === "small"}
                  onClick={() => setDatasetSize("small")}
                />
                <DatasetButton
                  label="1,000 Items"
                  icon="📋"
                  isActive={datasetSize === "medium"}
                  onClick={() => setDatasetSize("medium")}
                />
                <DatasetButton
                  label="10,000 Items"
                  icon="📚"
                  isActive={datasetSize === "large"}
                  onClick={() => setDatasetSize("large")}
                />
              </div>
            </SpatialNavigationNode>

            {/* Main horizontal virtualized list */}
            <SpatialNavigationNode orientation="horizontal" isFocusable={false}>
              <main
                style={{
                  flex: 1,
                  overflow: "hidden",
                  border: "2px solid #333",
                  borderRadius: "8px",
                  backgroundColor: "#111",
                  display: "flex",
                  flexDirection: "row",
                  // Chrome 38 specific fixes
                  minHeight: 0,
                  height: "100%",
                  position: "relative",
                }}>
                <SpatialNavigationVirtualizedList
                  data={currentData}
                  itemSize={200}
                  orientation="horizontal"
                  scrollBehavior="center"
                  scrollDuration={200}
                  additionalItemsRendered={3}
                  viewportPadding={{
                    top: 100,  // header height
                    bottom: 90, // footer height + padding
                    left: 40,  // padding
                    right: 40   // padding
                  }}
                  renderItem={({ item, index }) => (
                    <SpatialNavigationNode
                      isFocusable
                      onSelect={() => setSelectedItem(`${item.title} (index: ${index})`)}>
                      {({ isFocused }: FocusableNodeState) => (
                        <div
                          style={{
                            height: "200px",
                            width: "180px",
                            margin: "10px 5px",
                            padding: "15px",
                            borderRadius: "8px",
                            backgroundColor: isFocused ? "#E91E63" : "#1a1a1a",
                            border: isFocused ? "3px solid white" : "3px solid #333",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "space-between",
                            boxSizing: "border-box",
                            // Chrome 38 compatible transitions
                            WebkitTransition: "all 0.2s",
                            transition: "all 0.2s",
                            WebkitTransform: isFocused
                              ? "translateY(5px) scale(1.02)"
                              : "translate(0)",
                            transform: isFocused
                              ? "translateY(5px) scale(1.02)"
                              : "translate(0)",
                            boxShadow: isFocused
                              ? "0 4px 15px rgba(233, 30, 99, 0.5)"
                              : "none",
                            // Chrome 38 specific fixes
                            WebkitBackfaceVisibility: "hidden",
                            backfaceVisibility: "hidden",
                          }}>
                          <div style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
                            <div
                              style={{
                                fontSize: "16px",
                                fontWeight: isFocused ? "bold" : "normal",
                                marginBottom: "8px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}>
                              {item.title}
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: isFocused ? "#fff" : "#888",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}>
                              {item.subtitle}
                            </div>
                          </div>
                          <div
                            style={{
                              padding: "5px 12px",
                              backgroundColor: isFocused
                                ? "rgba(255, 255, 255, 0.2)"
                                : "rgba(255, 255, 255, 0.05)",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontWeight: "bold",
                              marginTop: "10px",
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
          </div>

          {/* Footer - fixed height */}
          <footer
            style={{
              padding: "15px 40px",
              borderTop: "1px solid #333",
              fontSize: "12px",
              color: "#666",
              textAlign: "center",
              flexShrink: 0,
            }}>
            ↔️ Navigate horizontally through items • ↕️ Switch between controls and list • Press Enter to select
          </footer>
        </div>
      </SpatialNavigationRoot>
    </SpatialNavigationDeviceTypeProvider>
  );
}

function DatasetButton({
  label,
  icon,
  isActive,
  onClick,
}: {
  label: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <SpatialNavigationNode isFocusable onSelect={onClick}>
      {({ isFocused }: FocusableNodeState) => (
        <div
          style={{
            padding: "12px 20px",
            borderRadius: "8px",
            backgroundColor: isActive ? "#9C27B0" : isFocused ? "#E91E63" : "#1a1a1a",
            border: isFocused ? "3px solid white" : "3px solid #333",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            transition: "all 0.2s",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}>
          <div style={{ fontSize: "20px" }}>{icon}</div>
          <div
            style={{
              fontSize: "14px",
              fontWeight: isFocused || isActive ? "bold" : "normal",
            }}>
            {label}
          </div>
          {isActive && (
            <div
              style={{
                fontSize: "14px",
              }}>
              ✓
            </div>
          )}
        </div>
      )}
    </SpatialNavigationNode>
  );
}

