import { useState } from 'react';
import type { Currency } from '@/types/api';
import { usePayoutSubmit } from '@/hooks/usePayoutSubmit';
import { useScreenshotDetection } from '@/hooks/useScreenshotDetection';
import { PayoutForm } from '@/components/payouts/PayoutForm';
import { PayoutConfirmModal } from '@/components/payouts/PayoutConfirmModal';
import { PayoutSuccessScreen } from '@/components/payouts/PayoutSuccessScreen';
import { PayoutErrorScreen } from '@/components/payouts/PayoutErrorScreen';

export default function PayoutsScreen() {
  const [pendingAmount, setPendingAmount] = useState(0);
  const [pendingCurrency, setPendingCurrency] = useState<Currency>('GBP');
  const [pendingIban, setPendingIban] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    screen,
    loading,
    errorMessage,
    payoutResult,
    submitPayout,
    resetForm,
  } = usePayoutSubmit();

  useScreenshotDetection();

  function handleFormConfirm(amount: number, currency: Currency, iban: string) {
    setPendingAmount(amount);
    setPendingCurrency(currency);
    setPendingIban(iban);
    setShowConfirm(true);
  }

  function handleConfirmPayout() {
    setShowConfirm(false);
    submitPayout(pendingAmount, pendingCurrency, pendingIban);
  }

  function handleReset() {
    resetForm();
    setShowConfirm(false);
  }

  return (
    <>
      <PayoutForm onConfirm={handleFormConfirm} />

      <PayoutConfirmModal
        visible={showConfirm}
        amount={pendingAmount}
        currency={pendingCurrency}
        iban={pendingIban}
        loading={loading}
        onConfirm={handleConfirmPayout}
        onCancel={() => setShowConfirm(false)}
      />

      <PayoutSuccessScreen
        visible={screen === 'success'}
        payoutResult={payoutResult}
        onDone={handleReset}
      />

      <PayoutErrorScreen
        visible={screen === 'error'}
        message={errorMessage}
        onTryAgain={handleReset}
      />
    </>
  );
}