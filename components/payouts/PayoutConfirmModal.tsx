import {
  StyleSheet, TouchableOpacity, Modal,
  View, Text, ActivityIndicator,
} from 'react-native';
import type { Currency } from '@/types/api';

interface Props {
  visible: boolean;
  amount: number;
  currency: Currency;
  iban: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

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

export function PayoutConfirmModal({
  visible, amount, currency, iban, loading, onConfirm, onCancel
}: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Confirm Payout</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Amount:</Text>
            <Text style={styles.value}>{formatAmount(amount, currency)}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Currency:</Text>
            <Text style={styles.value}>{currency}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>IBAN:</Text>
            <Text style={styles.value} numberOfLines={1}>
              {maskIBAN(iban)}
            </Text>
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, loading && styles.disabled]}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.confirmText}>Confirm</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const TEAL = '#1a7a8a';
const WHITE = '#ffffff';
const DARK_TEXT = '#111111';
const GRAY_TEXT = '#888888';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 24,
  },
  title: {
    fontSize: 20, fontWeight: 'bold',
    color: DARK_TEXT, textAlign: 'center', marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  label: { fontSize: 14, color: GRAY_TEXT },
  value: {
    fontSize: 14, color: DARK_TEXT,
    fontWeight: '500', flex: 1, textAlign: 'right',
  },
  divider: { height: 1, backgroundColor: '#eee' },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelButton: {
    flex: 1, backgroundColor: '#eee',
    borderRadius: 8, padding: 16, alignItems: 'center',
  },
  cancelText: { color: DARK_TEXT, fontWeight: '600', fontSize: 16 },
  confirmButton: {
    flex: 1, backgroundColor: TEAL,
    borderRadius: 8, padding: 16, alignItems: 'center',
  },
  confirmText: { color: WHITE, fontWeight: 'bold', fontSize: 16 },
  disabled: { opacity: 0.5 },
});