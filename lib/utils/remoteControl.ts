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
