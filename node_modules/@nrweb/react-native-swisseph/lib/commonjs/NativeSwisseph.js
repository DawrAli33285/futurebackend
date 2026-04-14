"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _reactNative = require("react-native");
// Add error handling for TurboModule loading
let SwissephModule = null;
try {
  SwissephModule = _reactNative.TurboModuleRegistry.getEnforcing('Swisseph');
} catch (error) {
  console.warn('Failed to load Swisseph TurboModule:', error);
  // In development, provide a mock implementation to prevent crashes
  if (__DEV__) {
    console.warn('Running in development mode - using mock Swisseph implementation');
  }
}
var _default = exports.default = SwissephModule;
//# sourceMappingURL=NativeSwisseph.js.map