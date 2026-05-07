import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 80 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { marginBottom: 24 },
  balanceCard: {
    padding: 16, borderRadius: 12, marginBottom: 34,
   // borderWidth: 1, borderColor: '#e0e0e0',
  },
  balanceAmount: { fontSize: 32, fontWeight: 'bold', marginTop: 8, marginBottom: 4 },
  pendingLabel: { fontSize: 14, opacity: 0.6 },
  section: { marginBottom: 24, marginTop: 16,},
  activityRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#e0e0e0',
  },
  activityDescription: { flex: 1, marginRight: 8 },
  activityAmount: { fontWeight: '600' },
  showMoreButton: {
    backgroundColor: '#e8f4f8',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  showMoreText: {
    color: '#1a7a8a',
    fontWeight: '600',
    fontSize: 16,
  },
  retryButton: { marginTop: 12 },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 16,
    borderBottomWidth: 1, borderBottomColor: '#e0e0e0',
  },
  activityRowFull: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 16,
    borderBottomWidth: 1, borderBottomColor: '#222',
  },
  activityLeft: { flex: 1, marginRight: 4 },
   activityStatus: { fontSize: 12, opacity: 0.5, marginTop: 2 },
  loader: { padding: 20 },
  activityRight: { flex: 1, alignItems: 'flex-end' },
  activityType: { fontSize: 10, opacity: 0.5, marginBottom: 2 },
  activityDate: { fontSize: 12, opacity: 0.5, marginTop: 2 },
 
   balanceRow: { flexDirection: 'row', gap:10 ,marginTop: 12 },
   balanceItem: { flex: 1 },
   //balanceDivider: { width: 1, backgroundColor: '#e0e0e0', marginHorizontal: 16 },
   balanceLabel: { fontSize: 13, opacity: 0.5, marginBottom: 4 },
     footerLoader: { alignItems: 'center', padding: 16 },
   loadingMoreText: { color: '#999', marginTop: 8, fontSize: 13 },
});