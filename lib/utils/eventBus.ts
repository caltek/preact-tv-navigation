import mitt from 'mitt';
import type { Emitter } from 'mitt';
import type { FocusDetail } from '../types';

/**
 * Events emitted by the spatial navigation system
 */
export type NavigationEvents = {
  'focus': FocusDetail;
  'blur': FocusDetail;
  'willmove': { direction: string; sectionId?: string };
  'navigatefailed': { direction: string };
  'enterdown': void;
  'enterup': void;
  [key: string]: any;
}

/**
 * Event bus for spatial navigation events
 * Uses mitt.js for lightweight event emission
 */
class NavigationEventBus {
  private emitter: Emitter<NavigationEvents>;

  constructor() {
    this.emitter = mitt<NavigationEvents>();
  }

  /**
   * Subscribe to a navigation event
   */
  on<K extends keyof NavigationEvents>(
    event: K,
    handler: (data: NavigationEvents[K]) => void
  ): void {
    this.emitter.on(event, handler);
  }

  /**
   * Unsubscribe from a navigation event
   */
  off<K extends keyof NavigationEvents>(
    event: K,
    handler: (data: NavigationEvents[K]) => void
  ): void {
    this.emitter.off(event, handler);
  }

  /**
   * Emit a navigation event
   */
  emit<K extends keyof NavigationEvents>(
    event: K,
    data: NavigationEvents[K]
  ): void {
    this.emitter.emit(event, data);
  }

  /**
   * Clear all event handlers
   */
  clear(): void {
    this.emitter.all.clear();
  }
}

// Export singleton instance
export const navigationEventBus = new NavigationEventBus();

