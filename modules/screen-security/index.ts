// Reexport the native module. On web, it will be resolved to ScreenSecurityModule.web.ts
// and on native platforms to ScreenSecurityModule.ts
export { default } from './src/ScreenSecurityModule';
export { default as ScreenSecurityView } from './src/ScreenSecurityView';
export * from  './src/ScreenSecurity.types';
