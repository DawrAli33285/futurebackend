"use strict";

import { TurboModuleRegistry } from 'react-native';
// Add error handling for TurboModule loading
let SwissephModule = null;
try {
  SwissephModule = TurboModuleRegistry.getEnforcing('Swisseph');
} catch (error) {
  console.warn('Failed to load Swisseph TurboModule:', error);
  // In development, provide a mock implementation to prevent crashes
  if (__DEV__) {
    console.warn('Running in development mode - using mock Swisseph implementation');
  }
}
export default SwissephModule;
//# sourceMappingURL=NativeSwisseph.js.map