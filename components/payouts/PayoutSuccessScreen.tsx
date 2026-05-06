import { StyleSheet, TouchableOpacity, Modal, View, Text, SafeAreaView } from 'react-native';
import type { Currency, PayoutResponse } from '@/types/api';

interface Props {
  visible: boolean;
  payoutResult: PayoutResponse | null;
  onDone: () => void;
}

function formatAmount(amount: number, currency: Currency): string {
  const symbol = currency === 'GBP' ? '£' : '€';
  return `${symbol}${amount.toFixed(2)}`;
}

export function PayoutSuccessScreen({ visible, payoutResult, onDone }: Props) {
  return (
    <Modal visible={visible} animationType="fade">
      <SafeAreaView style={styles.container}>
        <Text style={styles.pageTitle}>Payout</Text>
        <View style={styles.content}>
          <View style={styles.icon}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
          <Text style={styles.title}>Payout Completed</Text>
          {payoutResult && (
            <Text style={styles.message}>
              Your payout of {formatAmount(
                payoutResult.amount / 100,
                payoutResult.currency
              )} has been processed successfully.
            </Text>
          )}
          <TouchableOpacity style={styles.button} onPress={onDone}>
            <Text style={styles.buttonText}>Create Another Payout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const TEAL = '#1a7a8a';
const LIGHT_BG = '#f0f0f0';
const WHITE = '#ffffff';
const DARK_TEXT = '#111111';
const GRAY_TEXT = '#888888';
const GREEN = '#27ae60';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LIGHT_BG, padding: 20, paddingTop: 60 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: DARK_TEXT },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  icon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: GREEN,
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  checkmark: { color: WHITE, fontSize: 28, fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: 'bold', color: DARK_TEXT, textAlign: 'center', marginBottom: 12 },
  message: { fontSize: 15, color: GRAY_TEXT, textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  button: { backgroundColor: TEAL, borderRadius: 8, padding: 16, alignItems: 'center', width: '100%' },
  buttonText: { color: WHITE, fontWeight: 'bold', fontSize: 16 },
});