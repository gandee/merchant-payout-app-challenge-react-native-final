import { useEffect } from 'react';
import { Alert } from 'react-native';
import ScreenSecurity from '@/modules/ScreenSecurity';

export function useScreenshotDetection() {
  useEffect(() => {
    ScreenSecurity.startScreenshotDetection();

    const subscription = ScreenSecurity.addScreenshotListener(() => {
      Alert.alert(
        'Security Warning',
        'Screenshot detected. Please keep your financial data private.',
        [{ text: 'OK' }]
      );
    });

    return () => {
      ScreenSecurity.stopScreenshotDetection();
      subscription.remove();
    };
  }, []);
}