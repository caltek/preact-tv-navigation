import { configureRemoteControl, createKeyboardRemoteControl } from '../lib/index';

// Configure keyboard-based remote control for web development and testing
const { subscriber, unsubscriber } = createKeyboardRemoteControl();

configureRemoteControl({
  remoteControlSubscriber: subscriber,
  remoteControlUnsubscriber: unsubscriber,
});

console.log('[Remote Control] Keyboard controls configured');
console.log('[Remote Control] Use arrow keys to navigate, Enter to select');

export {}; // Make this a module

