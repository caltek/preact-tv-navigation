import type { Direction } from '@bam.tech/lrud';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- can't know for sure what the subscriber will be...
type SubscriberType = any;

export interface RemoteControlConfiguration {
  remoteControlSubscriber: (lrudCallback: (direction: Direction | null) => void) => SubscriberType;
  remoteControlUnsubscriber: (subscriber: SubscriberType) => void;
}

export let remoteControlSubscriber:
  | RemoteControlConfiguration['remoteControlSubscriber']
  | undefined = undefined;
export let remoteControlUnsubscriber:
  | RemoteControlConfiguration['remoteControlUnsubscriber']
  | undefined = undefined;

export const configureRemoteControl = (options: RemoteControlConfiguration) => {
  remoteControlSubscriber = options.remoteControlSubscriber;
  remoteControlUnsubscriber = options.remoteControlUnsubscriber;
};

/**
 * Common TV remote key codes
 * These can be used when implementing your own remote control subscriber
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

/**
 * Helper function to create a basic keyboard-based remote control subscriber
 * This is a convenience function for web development and testing
 * 
 * @example
 * ```ts
 * import { configureRemoteControl, createKeyboardRemoteControl } from 'preact-spatial-navigation';
 * 
 * const { subscriber, unsubscriber } = createKeyboardRemoteControl();
 * configureRemoteControl({
 *   remoteControlSubscriber: subscriber,
 *   remoteControlUnsubscriber: unsubscriber,
 * });
 * ```
 */
export const createKeyboardRemoteControl = () => {
  const subscriber = (callback: (direction: Direction | null) => void) => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          callback('up');
          break;
        case 'ArrowDown':
          event.preventDefault();
          callback('down');
          break;
        case 'ArrowLeft':
          event.preventDefault();
          callback('left');
          break;
        case 'ArrowRight':
          event.preventDefault();
          callback('right');
          break;
        case 'Enter':
          event.preventDefault();
          callback('enter');
          break;
        default:
          break;
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
    }

    return handleKeyDown;
  };

  const unsubscriber = (listener: (event: KeyboardEvent) => void) => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', listener);
    }
  };

  return { subscriber, unsubscriber };
};

/**
 * Helper function to create an LG webOS TV remote control subscriber
 * This handles LG-specific key codes and the webOS platform
 * 
 * @example
 * ```ts
 * import { configureRemoteControl, createLGRemoteControl } from 'preact-spatial-navigation';
 * 
 * const { subscriber, unsubscriber } = createLGRemoteControl();
 * configureRemoteControl({
 *   remoteControlSubscriber: subscriber,
 *   remoteControlUnsubscriber: unsubscriber,
 * });
 * ```
 */
export const createLGRemoteControl = () => {
  const subscriber = (callback: (direction: Direction | null) => void) => {
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      
      const keyCode = event.keyCode;
      
      switch (keyCode) {
        case TV_REMOTE_KEYS.LG_UP:
        case 38: // Arrow Up
          callback('up');
          break;
        case TV_REMOTE_KEYS.LG_DOWN:
        case 40: // Arrow Down
          callback('down');
          break;
        case TV_REMOTE_KEYS.LG_LEFT:
        case 37: // Arrow Left
          callback('left');
          break;
        case TV_REMOTE_KEYS.LG_RIGHT:
        case 39: // Arrow Right
          callback('right');
          break;
        case TV_REMOTE_KEYS.LG_ENTER:
        case 13: // Enter
          callback('enter');
          break;
        case TV_REMOTE_KEYS.LG_BACK:
        case 461: // LG Back button
          // You can emit a custom event or handle back navigation
          if (typeof window !== 'undefined') {
            // CustomEvent fallback for older browsers (e.g., Chrome 38)
            let event: Event;
            try {
              event = new CustomEvent('lg-back-pressed');
            } catch {
              // Legacy constructor for older engines
              event = document.createEvent('CustomEvent');
              // initCustomEvent exists on legacy engines
              (event as any).initCustomEvent('lg-back-pressed', false, false, undefined);
            }
            window.dispatchEvent(event);
          }
          break;
        default:
          break;
      }
    };

    if (typeof window !== 'undefined') {
      document.addEventListener('keydown', handleKeyDown);
    }

    return handleKeyDown;
  };

  const unsubscriber = (listener: (event: KeyboardEvent) => void) => {
    if (typeof window !== 'undefined') {
      document.removeEventListener('keydown', listener);
    }
  };

  return { subscriber, unsubscriber };
};
