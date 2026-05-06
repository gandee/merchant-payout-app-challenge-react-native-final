import { useState } from 'react';
import { Alert, Linking } from 'react-native';
import ScreenSecurity from '@/modules/ScreenSecurity';
import { API_BASE_URL } from '@/constants';
import type { Currency, PayoutResponse } from '@/types/api';

export type ScreenState = 'form' | 'confirm' | 'success' | 'error';

const BIOMETRIC_THRESHOLD = 100000; // in pence, equivalent to £1,000

export function usePayoutSubmit() {
  const [screen, setScreen] = useState<ScreenState>('form');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [payoutResult, setPayoutResult] = useState<PayoutResponse | null>(null);

  async function submitPayout(
    amount: number,
    currency: Currency,
    iban: string
  ) {
    try {
      setLoading(true);
      const amountInPence = Math.round(amount * 100);

      // Step 5 — biometric for payouts over £1,000
      if (amountInPence > BIOMETRIC_THRESHOLD) {
        try {
          const authenticated = await ScreenSecurity.isBiometricAuthenticated();
          if (!authenticated) {
            setErrorMessage('Biometric authentication failed. Payout cancelled.');
            setScreen('error');
            return;
          }
        } catch (biometricError: unknown) {
          const error = biometricError as { code: string };
          if (error.code === 'BIOMETRIC_NOT_ENROLLED') {
            setLoading(false);
            Alert.alert(
              'Biometrics Required',
              'Please set up fingerprint or face recognition in your device Settings to authorise payouts over £1,000.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Open Settings',
                  onPress: () => Linking.sendIntent('android.settings.SECURITY_SETTINGS'),
                },
              ]
            );
            return;
          } else if (error.code === 'BIOMETRIC_NOT_AVAILABLE') {
            setErrorMessage('Biometric authentication is not available on this device. Payouts over £1,000 cannot be processed.');
            setScreen('error');
            return;
          } else {
            setErrorMessage('Biometric authentication failed. Payout cancelled.');
            setScreen('error');
            return;
          }
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/payouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInPence,
          currency,
          iban: iban.trim(),
          device_id: ScreenSecurity.getDeviceId(),
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        const msg = response.status === 400
          ? 'Insufficient funds.'
          : response.status === 503
          ? 'Service temporarily unavailable. Please try again later.'
          : 'Something went wrong. Please try again.';
        setErrorMessage(msg);
        setScreen('error');
        return;
      }

      setPayoutResult(json);
      setScreen('success');
    } catch {
      setErrorMessage('Network error. Please check your connection and try again.');
      setScreen('error');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setScreen('form');
    setErrorMessage('');
    setPayoutResult(null);
  }

  return {
    screen,
    setScreen,
    loading,
    errorMessage,
    payoutResult,
    submitPayout,
    resetForm,
  };
}