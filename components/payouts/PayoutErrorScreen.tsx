import { StyleSheet, TouchableOpacity, Modal, View, Text, SafeAreaView } from 'react-native';

interface Props {
  visible: boolean;
  message: string;
  onTryAgain: () => void;
}

export function PayoutErrorScreen({ visible, message, onTryAgain }: Props) {
  return (
    <Modal visible={visible} animationType="fade">
      <SafeAreaView style={styles.container}>
        <Text style={styles.pageTitle}>Payout</Text>
        <View style={styles.content}>
          <Text style={styles.crossmark}>✕</Text>
          <Text style={styles.title}>Unable to Process Payout</Text>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity style={styles.button} onPress={onTryAgain}>
            <Text style={styles.buttonText}>Try Again</Text>
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
const RED = '#e74c3c';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LIGHT_BG, padding: 20, paddingTop: 60 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: DARK_TEXT },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  crossmark: { color: RED, fontSize: 56, fontWeight: 'bold', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: RED, textAlign: 'center', marginBottom: 12 },
  message: { fontSize: 15, color: RED, textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  button: { backgroundColor: TEAL, borderRadius: 8, padding: 16, alignItems: 'center', width: '100%' },
  buttonText: { color: WHITE, fontWeight: 'bold', fontSize: 16 },
});