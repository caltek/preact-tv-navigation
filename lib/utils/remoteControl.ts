// @ts-ignore - js-spatial-navigation doesn't have TypeScript definitions
import SpatialNavigation from 'js-spatial-navigation';

/**
 * Remote control key configuration
 */
export interface RemoteControlConfig {
  /** Key code or key name for UP direction */
  up?: (number | string)[];
  /** Key code or key name for DOWN direction */
  down?: (number | string)[];
  /** Key code or key name for LEFT direction */
  left?: (number | string)[];
  /** Key code or key name for RIGHT direction */
  right?: (number | string)[];
  /** Key code or key name for ENTER/SELECT */
  enter?: (number | string)[];
  /** Key code or key name for BACK */
  back?: (number | string)[];
}

/**
 * Default key mappings (standard keyboard + common TV remote controls)
 */
const DEFAULT_KEY_MAP: RemoteControlConfig = {
  up: [38, 'ArrowUp'],
  down: [40, 'ArrowDown'],
  left: [37, 'ArrowLeft'],
  right: [39, 'ArrowRight'],
  enter: [13, 'Enter'],
  back: [8, 27, 'Backspace', 'Escape'],
};

/**
 * Common TV remote key codes
 */
export const TV_REMOTE_KEYS = {
  // Samsung Tizen
  SAMSUNG_UP: 38,
  SAMSUNG_DOWN: 40,
  SAMSUNG_LEFT: 37,
  SAMSUNG_RIGHT: 39,
  SAMSUNG_ENTER: 13,
  SAMSUNG_BACK: 10009,
  
  // LG webOS
  LG_UP: 38,
  LG_DOWN: 40,
  LG_LEFT: 37,
  LG_RIGHT: 39,
  LG_ENTER: 13,
  LG_BACK: 461,
  
  // Generic
  MEDIA_PLAY: 415,
  MEDIA_PAUSE: 19,
  MEDIA_STOP: 413,
  MEDIA_REWIND: 412,
  MEDIA_FAST_FORWARD: 417,
};

let currentConfig: RemoteControlConfig = { ...DEFAULT_KEY_MAP };

/**
 * Configure remote control key mappings
 * Allows customization of navigation keys for different TV platforms
 * 
 * @param config - Remote control configuration
 * 
 * @example
 * ```ts
 * // Configure for Samsung Tizen TV
 * configureRemoteControl({
 *   up: [38, 'ArrowUp'],
 *   down: [40, 'ArrowDown'],
 *   left: [37, 'ArrowLeft'],
 *   right: [39, 'ArrowRight'],
 *   enter: [13, 'Enter'],
 *   back: [10009], // Samsung-specific back button
 * });
 * ```
 * 
 * @example
 * ```ts
 * // Add gamepad support
 * configureRemoteControl({
 *   up: [38, 'ArrowUp', 'w', 'W'],
 *   down: [40, 'ArrowDown', 's', 'S'],
 *   left: [37, 'ArrowLeft', 'a', 'A'],
 *   right: [39, 'ArrowRight', 'd', 'D'],
 * });
 * ```
 */
export function configureRemoteControl(config: Partial<RemoteControlConfig>): void {
  currentConfig = {
    ...DEFAULT_KEY_MAP,
    ...config,
  };

  // Update js-spatial-navigation key mapping if needed
  // Note: js-spatial-navigation uses its own key handling, so we may need
  // to override the global key handler if custom keys are needed

  if (typeof window !== 'undefined') {
    // Remove existing listener if any
    const existingListener = (window as any).__spatialNavKeyListener;
    if (existingListener) {
      window.removeEventListener('keydown', existingListener);
    }

    // Create new key handler
    const keyHandler = (event: KeyboardEvent) => {
      const keyCode = event.keyCode;
      const key = event.key;

      // Check if key matches any configured navigation key
      if (matchesKey(currentConfig.up, keyCode, key)) {
        event.preventDefault();
        SpatialNavigation.move('up');
      } else if (matchesKey(currentConfig.down, keyCode, key)) {
        event.preventDefault();
        SpatialNavigation.move('down');
      } else if (matchesKey(currentConfig.left, keyCode, key)) {
        event.preventDefault();
        SpatialNavigation.move('left');
      } else if (matchesKey(currentConfig.right, keyCode, key)) {
        event.preventDefault();
        SpatialNavigation.move('right');
      } else if (matchesKey(currentConfig.enter, keyCode, key)) {
        // Let js-spatial-navigation handle enter
        // It has built-in enter handling
      } else if (matchesKey(currentConfig.back, keyCode, key)) {
        // Emit back event
        window.dispatchEvent(new CustomEvent('sn:back'));
      }
    };

    // Store reference for cleanup
    (window as any).__spatialNavKeyListener = keyHandler;

    // Note: We don't actually add this listener by default because
    // js-spatial-navigation has its own key handling.
    // This is here for platforms that need custom key mapping.
  }
}

/**
 * Check if a key matches the configuration
 */
function matchesKey(
  config: (number | string)[] | undefined,
  keyCode: number,
  key: string
): boolean {
  if (!config) return false;

  if (Array.isArray(config)) {
    return config.some(k => {
      if (typeof k === 'number') {
        return k === keyCode;
      } else {
        return k === key;
      }
    });
  }

  return false;
}

/**
 * Get current remote control configuration
 */
export function getRemoteControlConfig(): RemoteControlConfig {
  return { ...currentConfig };
}

/**
 * Reset remote control configuration to defaults
 */
export function resetRemoteControlConfig(): void {
  currentConfig = { ...DEFAULT_KEY_MAP };
}

