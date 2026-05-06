import { useState } from 'react';
import {
  StyleSheet, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform,
  View, Text,
} from 'react-native';
import type { Currency } from '@/types/api';

interface Props {
  onConfirm: (amount: number, currency: Currency, iban: string) => void;
}

function formatAmount(amount: number, currency: Currency): string {
  const symbol = currency === 'GBP' ? '£' : '€';
  return `${symbol}${amount.toFixed(2)}`;
}

export function PayoutForm({ onConfirm }: Props) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('GBP');
  const [iban, setIban] = useState('');
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);

  const parsedAmount = parseFloat(amount);
  const isFormValid = amount !== '' && parsedAmount > 0 && iban.trim().length > 0;

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
                    onPress={() => {
                      setCurrency(c);
                      setCurrencyDropdownOpen(false);
                    }}
                  >
                    <Text style={[
                      styles.dropdownText,
                      currency === c && styles.dropdownSelected,
                    ]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

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

        <TouchableOpacity
          testID="confirm-button"
          style={[styles.button, !isFormValid && styles.buttonDisabled]}
          disabled={!isFormValid}
          onPress={() => onConfirm(parsedAmount, currency, iban)}
        >
          <Text style={styles.buttonText}>Confirm</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const TEAL = '#1a7a8a';
const LIGHT_BG = '#f0f0f0';
const WHITE = '#ffffff';
const DARK_TEXT = '#111111';
const GRAY_TEXT = '#888888';

const styles = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: LIGHT_BG },
  container: { padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: DARK_TEXT, marginBottom: 24 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  amountContainer: { flex: 2 },
  currencyContainer: { flex: 1, position: 'relative' },
  label: { fontSize: 14, fontWeight: '600', color: DARK_TEXT, marginBottom: 8 },
  input: {
    backgroundColor: WHITE, borderRadius: 8,
    padding: 14, fontSize: 16, color: DARK_TEXT,
    borderWidth: 1, borderColor: '#ddd',
  },
  currencyButton: {
    backgroundColor: WHITE, borderRadius: 8,
    padding: 14, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: '#ddd',
  },
  currencyText: { fontSize: 16, color: DARK_TEXT, fontWeight: '500' },
  currencyArrow: { fontSize: 10, color: GRAY_TEXT },
  dropdown: {
    position: 'absolute', top: 80, left: 0, right: 0,
    backgroundColor: WHITE, borderRadius: 8,
    borderWidth: 1, borderColor: '#ddd',
    zIndex: 100, elevation: 5,
  },
  dropdownItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#eee' },
  dropdownText: { fontSize: 16, color: DARK_TEXT },
  dropdownSelected: { color: TEAL, fontWeight: 'bold' },
  ibanContainer: { marginBottom: 24 },
  helperText: { fontSize: 12, color: GRAY_TEXT, marginTop: 6 },
  button: {
    backgroundColor: TEAL, borderRadius: 8,
    padding: 16, alignItems: 'center', marginTop: 8,
  },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: WHITE, fontWeight: 'bold', fontSize: 16 },
});