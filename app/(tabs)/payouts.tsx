
import ScreenSecurity from '@/modules/ScreenSecurity';
import { useState, useEffect } from 'react';
import {
  StyleSheet, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform,
  Modal, View, SafeAreaView, ActivityIndicator,
  Alert, Text,
} from 'react-native';
import { API_BASE_URL } from '@/constants';
import type { Currency, PayoutResponse } from '@/types/api';

type ScreenState = 'form' | 'confirm' | 'success' | 'error';

function formatAmount(amount: number, currency: Currency): string {
  const symbol = currency === 'GBP' ? '£' : '€';
  return `${symbol}${amount.toFixed(2)}`;
}

function maskIBAN(iban: string): string {
  if (iban.length <= 8) return iban;
  const first4 = iban.substring(0, 4);
  const last4 = iban.substring(iban.length - 4);
  const masked = '*'.repeat(iban.length - 8);
  return `${first4}${masked}${last4}`;
}

export default function PayoutsScreen() {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('GBP');
  const [iban, setIban] = useState('');
  const [screen, setScreen] = useState<ScreenState>('form');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [payoutResult, setPayoutResult] = useState<PayoutResponse | null>(null);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);

  const parsedAmount = parseFloat(amount);
  const isFormValid = amount !== '' && parsedAmount > 0 && iban.trim().length > 0;

  // Step 6 — screenshot detection
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

  async function submitPayout() {
    try {
      setLoading(true);
      const amountInPence = Math.round(parsedAmount * 100);

      // Step 5 — biometric for payouts over £1000
      const BIOMETRIC_THRESHOLD = 100000;
      if (amountInPence > BIOMETRIC_THRESHOLD) {
        try {
          const authenticated = await ScreenSecurity.isBiometricAuthenticated();
          if (!authenticated) {
            setErrorMessage('Biometric authentication failed. Payout cancelled.');
            setScreen('error');
            return;
          }
        } catch (biometricError: any) {
          if (biometricError.code === 'BIOMETRIC_NOT_ENROLLED') {
            setErrorMessage('Please set up biometrics in your device Settings to make payouts over £1,000.');
          } else {
            setErrorMessage('Biometric authentication failed. Payout cancelled.');
          }
          setScreen('error');
          return;
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
    setAmount('');
    setIban('');
    setCurrency('GBP');
    setScreen('form');
    setErrorMessage('');
    setPayoutResult(null);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.title}>Send Payout</Text>

        {/* Amount + Currency Row */}
        <View style={styles.row}>
          <View style={styles.amountContainer}>
            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#aaa"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
          <View style={styles.currencyContainer}>
            <Text style={styles.label}>Currency</Text>
            <TouchableOpacity
              style={styles.currencyButton}
              onPress={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
            >
              <Text style={styles.currencyText}>{currency}</Text>
              <Text style={styles.currencyArrow}>▼</Text>
            </TouchableOpacity>
            {currencyDropdownOpen && (
              <View style={styles.dropdown}>
                {(['GBP', 'EUR'] as Currency[]).map(c => (
                  <TouchableOpacity
                    key={c}
                    style={styles.dropdownItem}
                    onPress={() => { setCurrency(c); setCurrencyDropdownOpen(false); }}
                  >
                    <Text style={[
                      styles.dropdownText,
                      currency === c && styles.dropdownSelected
                    ]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* IBAN */}
        <View style={styles.ibanContainer}>
          <Text style={styles.label}>IBAN</Text>
          <TextInput
            style={styles.input}
            placeholder="FR1212345123451234567A12310131231231231"
            placeholderTextColor="#aaa"
            value={iban}
            onChangeText={setIban}
            autoCapitalize="characters"
          />
          <Text style={styles.helperText}>
            Enter the destination bank account IBAN
          </Text>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          testID="confirm-button"
          style={[styles.button, !isFormValid && styles.buttonDisabled]}
          disabled={!isFormValid}
          onPress={() => setScreen('confirm')}
        >
          <Text style={styles.buttonText}>Confirm</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={screen === 'confirm'}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm Payout</Text>

            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Amount:</Text>
              <Text style={styles.modalValue}>
                {formatAmount(parsedAmount, currency)}
              </Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Currency:</Text>
              <Text style={styles.modalValue}>{currency}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>IBAN:</Text>
              <Text style={styles.modalValue} numberOfLines={1}>
                {maskIBAN(iban)}
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setScreen('form')}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, loading && styles.buttonDisabled]}
                onPress={submitPayout}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.buttonText}>Confirm</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Screen */}
      <Modal visible={screen === 'success'} animationType="fade">
        <SafeAreaView style={styles.resultContainer}>
          <Text style={styles.pageTitle}>Payout</Text>
          <View style={styles.resultContent}>
            <View style={styles.successIcon}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
            <Text style={styles.resultTitle}>Payout Completed</Text>
            {payoutResult && (
              <Text style={styles.resultMessage}>
                Your payout of {formatAmount(payoutResult.amount / 100, payoutResult.currency)} has been processed successfully.
              </Text>
            )}
            <TouchableOpacity style={styles.button} onPress={resetForm}>
              <Text style={styles.buttonText}>Create Another Payout</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Error Screen */}
      <Modal visible={screen === 'error'} animationType="fade">
        <SafeAreaView style={styles.resultContainer}>
          <Text style={styles.pageTitle}>Payout</Text>
          <View style={styles.resultContent}>
            <View style={styles.errorIcon}>
              <Text style={styles.crossmark}>✕</Text>
            </View>
            <Text style={styles.errorTitle}>Unable to Process Payout</Text>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
            <TouchableOpacity style={styles.button} onPress={resetForm}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const TEAL = '#1a7a8a';
const LIGHT_BG = '#f0f0f0';
const WHITE = '#ffffff';
const DARK_TEXT = '#111111';
const GRAY_TEXT = '#888888';
const RED = '#e74c3c';
const GREEN = '#27ae60';

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },
  container: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: DARK_TEXT,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  amountContainer: {
    flex: 2,
  },
  currencyContainer: {
    flex: 1,
    position: 'relative',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK_TEXT,
    marginBottom: 8,
  },
  input: {
    backgroundColor: WHITE,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: DARK_TEXT,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  currencyButton: {
    backgroundColor: WHITE,
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  currencyText: {
    fontSize: 16,
    color: DARK_TEXT,
    fontWeight: '500',
  },
  currencyArrow: {
    fontSize: 10,
    color: GRAY_TEXT,
  },
  dropdown: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    backgroundColor: WHITE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    zIndex: 100,
    elevation: 5,
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownText: {
    fontSize: 16,
    color: DARK_TEXT,
  },
  dropdownSelected: {
    color: TEAL,
    fontWeight: 'bold',
  },
  ibanContainer: {
    marginBottom: 24,
  },
  helperText: {
    fontSize: 12,
    color: GRAY_TEXT,
    marginTop: 6,
  },
  button: {
    backgroundColor: TEAL,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: WHITE,
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
modalCard: {
  backgroundColor: WHITE,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  borderBottomLeftRadius: 20,
  borderBottomRightRadius: 20,
  borderRadius: 20,
  padding: 24,
  paddingBottom: 32,
  overflow: 'hidden',
},
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: DARK_TEXT,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  modalLabel: {
    fontSize: 14,
    color: GRAY_TEXT,
  },
  modalValue: {
    fontSize: 14,
    color: DARK_TEXT,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#eee',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  cancelText: {
    color: DARK_TEXT,
    fontWeight: '600',
    fontSize: 16,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: TEAL,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  // Result screens
  resultContainer: {
    flex: 1,
    backgroundColor: LIGHT_BG,
    padding: 20,
    paddingTop: 60,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: DARK_TEXT,
  },
  resultContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkmark: {
    color: WHITE,
    fontSize: 28,
    fontWeight: 'bold',
  },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  crossmark: {
    color: RED,
    fontSize: 48,
    fontWeight: 'bold',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: DARK_TEXT,
    textAlign: 'center',
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: RED,
    textAlign: 'center',
    marginBottom: 12,
  },
  resultMessage: {
    fontSize: 15,
    color: GRAY_TEXT,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  errorMessage: {
    fontSize: 15,
    color: RED,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
});