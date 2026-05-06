import { requireNativeModule, EventEmitter } from 'expo-modules-core';

const ScreenSecurityModule = requireNativeModule('ScreenSecurity') as any;
const emitter = new EventEmitter(ScreenSecurityModule);

const ScreenSecurity = {
  getDeviceId: (): string => {
    return ScreenSecurityModule.getDeviceId();
  },

  isBiometricAuthenticated: (): Promise<boolean> => {
    return ScreenSecurityModule.isBiometricAuthenticated();
  },

  startScreenshotDetection: () => {
    return ScreenSecurityModule.startScreenshotDetection();
  },

  stopScreenshotDetection: () => {
    return ScreenSecurityModule.stopScreenshotDetection();
  },

  addScreenshotListener: (callback: () => void) => {
    return (emitter as any).addListener('onScreenshotTaken', callback);
  }
};

export default ScreenSecurity;