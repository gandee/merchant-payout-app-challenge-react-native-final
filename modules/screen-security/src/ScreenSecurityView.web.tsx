import * as React from 'react';

import { ScreenSecurityViewProps } from './ScreenSecurity.types';

export default function ScreenSecurityView(props: ScreenSecurityViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
