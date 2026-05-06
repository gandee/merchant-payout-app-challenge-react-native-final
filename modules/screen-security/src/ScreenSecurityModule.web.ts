import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './ScreenSecurity.types';

type ScreenSecurityModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class ScreenSecurityModule extends NativeModule<ScreenSecurityModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(ScreenSecurityModule, 'ScreenSecurityModule');
