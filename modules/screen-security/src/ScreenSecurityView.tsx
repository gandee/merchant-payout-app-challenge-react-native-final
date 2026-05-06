import { requireNativeView } from 'expo';
import * as React from 'react';

import { ScreenSecurityViewProps } from './ScreenSecurity.types';

const NativeView: React.ComponentType<ScreenSecurityViewProps> =
  requireNativeView('ScreenSecurity');

export default function ScreenSecurityView(props: ScreenSecurityViewProps) {
  return <NativeView {...props} />;
}
