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
 * Demo: Virtualized List
 * - Efficiently renders thousands of items
 * - Only visible items are in the DOM
 */
export function VirtualizedListDemo() {
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
              Virtualized List Demo
            </h1>
            <p style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#888" }}>
              {currentData.length.toLocaleString()} items • Scroll starts at middle, keeps
              items centered
            </p>
            {selectedItem && (
              <p style={{ margin: "10px 0 0 0", color: "#FFD700", fontSize: "14px" }}>
                Selected: {selectedItem}
              </p>
            )}
          </header>

          {/* Content area */}
          <SpatialNavigationView
            direction="horizontal"
            style={{
              flex: 1,
              overflow: "hidden",
              gap: "20px",
              padding: "20px",
            }}>
            {/* Sidebar - Dataset size selector */}
            <SpatialNavigationNode orientation="vertical" isFocusable={false}>
              <aside
                style={{
                  width: "200px",
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", color: "#E91E63" }}>
                  Dataset Size
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
              </aside>
            </SpatialNavigationNode>

            {/* Main virtualized list */}
            <SpatialNavigationNode orientation="vertical" isFocusable={false}>
              <main
                style={{
                  flex: 1,
                  overflow: "hidden",
                  border: "2px solid #333",
                  borderRadius: "8px",
                  backgroundColor: "#111",
                }}>
                <SpatialNavigationVirtualizedList
                  data={currentData}
                  itemSize={80}
                  orientation="vertical"
                  scrollBehavior="center"
                  scrollDuration={200}
                  additionalItemsRendered={3}
                  renderItem={({ item, index }) => (
                    <SpatialNavigationNode
                      isFocusable
                      onSelect={() => setSelectedItem(`${item.title} (index: ${index})`)}>
                      {({ isFocused }: FocusableNodeState) => (
                        <div
                          style={{
                            height: "70px",
                            margin: "5px 10px",
                            padding: "15px",
                            borderRadius: "8px",
                            backgroundColor: isFocused ? "#E91E63" : "#1a1a1a",
                            border: isFocused ? "3px solid white" : "3px solid #333",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            transition: "all 0.2s",
                            transform: isFocused
                              ? "translateX(5px) scale(1.02)"
                              : "translateX(0)",
                            boxShadow: isFocused
                              ? "0 4px 15px rgba(233, 30, 99, 0.5)"
                              : "none",
                          }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: "16px",
                                fontWeight: isFocused ? "bold" : "normal",
                                marginBottom: "4px",
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
                              flexShrink: 0,
                              marginLeft: "10px",
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
          <footer
            style={{
              padding: "15px 40px",
              borderTop: "1px solid #333",
              fontSize: "12px",
              color: "#666",
              textAlign: "center",
              flexShrink: 0,
            }}>
            ↕️ Navigate list items • ↔️ Switch between sidebar and list • Press Enter to
            select
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
            padding: "15px",
            borderRadius: "8px",
            backgroundColor: isActive ? "#9C27B0" : isFocused ? "#E91E63" : "#1a1a1a",
            border: isFocused ? "3px solid white" : "3px solid #333",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            transition: "all 0.2s",
            cursor: "pointer",
          }}>
          <div style={{ fontSize: "24px" }}>{icon}</div>
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
                marginLeft: "auto",
                fontSize: "16px",
              }}>
              ✓
            </div>
          )}
        </div>
      )}
    </SpatialNavigationNode>
  );
}
