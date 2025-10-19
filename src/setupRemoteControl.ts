import { configureRemoteControl, createLGRemoteControl } from '../lib/index';

console.log('🎮 setupRemoteControl: Starting remote control setup');

// Configure keyboard-based remote control for web development and testing
const { subscriber, unsubscriber } = createLGRemoteControl();

console.log('🎮 setupRemoteControl: Remote control created', {
  hasSubscriber: !!subscriber,
  hasUnsubscriber: !!unsubscriber,
});

configureRemoteControl({
  remoteControlSubscriber: subscriber,
  remoteControlUnsubscriber: unsubscriber,
});

console.log('✅ setupRemoteControl: Keyboard controls configured');
console.log('🎮 setupRemoteControl: Use arrow keys to navigate, Enter to select');

export {}; // Make this a module

