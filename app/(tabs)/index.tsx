import { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet, TouchableOpacity, ActivityIndicator,
  Modal, FlatList, View, SafeAreaView,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { MerchantDataResponse, ActivityItem, PaginatedActivityResponse } from '@/types/api';
import { API_BASE_URL } from '@/constants';

function formatAmount(amount: number, currency: string): string {
  const value = Math.abs(amount) / 100;
  const symbol = currency === 'GBP' ? '£' : '€';
  return `${amount < 0 ? '-' : ''}${symbol}${value.toFixed(2)}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd} ${mm} ${yyyy}`;
}

export default function HomeScreen() {
  const [data, setData] = useState<MerchantDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Paginated activity state
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    fetchMerchantData();
  }, []);

  async function fetchMerchantData() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/merchant`);
      if (!response.ok) throw new Error('Failed to fetch');
      const json: MerchantDataResponse = await response.json();
      setData(json);
    } catch {
      setError('Unable to load account data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function fetchActivity(currentCursor: string | null = null) {
    try {
      if (currentCursor === null) {
        setActivities([]);
        setHasMore(true);
      }
      setLoadingMore(true);
      setModalError(null);
      const url = currentCursor
        ? `${API_BASE_URL}/api/merchant/activity?cursor=${currentCursor}`
        : `${API_BASE_URL}/api/merchant/activity`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch activity');
      const json: PaginatedActivityResponse = await response.json();
      setActivities(prev => currentCursor === null ? json.items : [...prev, ...json.items]);
      setCursor(json.next_cursor);
      setHasMore(json.has_more);
    } catch {
      setModalError('Unable to load transactions. Please try again.');
    } finally {
      setLoadingMore(false);
    }
  }

  function openModal() {
    setModalVisible(true);
    fetchActivity(null);
  }

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && cursor) {
      fetchActivity(cursor);
    }
  }, [loadingMore, hasMore, cursor]);

const renderActivity = ({ item }: { item: ActivityItem }) => (
  <View style={styles.activityRowFull}>
    <View style={styles.activityLeft}>
      <ThemedText style={styles.activityType}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</ThemedText>
      <ThemedText style={styles.activityDescription}>{item.description}</ThemedText>
      <ThemedText style={styles.activityDate}>{formatDate(item.date)}</ThemedText>
    </View>
    <View style={styles.activityRight}>
      <ThemedText style={[styles.activityAmount, { color: item.amount < 0 ? '#e74c3c' : '#27ae60' }]}>
        {formatAmount(item.amount, item.currency)}
      </ThemedText>
      <ThemedText style={styles.activityStatus}>
        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
      </ThemedText>
    </View>
  </View>
);

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
       <ActivityIndicator size="large" testID="loading" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>{error}</ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={fetchMerchantData}>
          <ThemedText type="link">Retry</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const recentActivity = data?.activity.slice(0, 3) ?? [];

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Business Account</ThemedText>
      </ThemedView>

      {/* Balance Section */}
      <ThemedView style={styles.balanceCard}>
        <ThemedText type="subtitle">Account Balance</ThemedText>
        <ThemedText style={styles.balanceAmount}>
          {formatAmount(data!.available_balance, data!.currency)}
        </ThemedText>
        <ThemedText style={styles.pendingLabel}>
          Pending: {formatAmount(data!.pending_balance, data!.currency)}
        </ThemedText>
      </ThemedView>

      {/* Recent Activity */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Recent Activity</ThemedText>
        {recentActivity.map((item: ActivityItem) => (
          <View key={item.id} style={styles.activityRow}>
            <ThemedText style={styles.activityDescription} numberOfLines={1}>
              {item.description}
            </ThemedText>
            <ThemedText style={[
              styles.activityAmount,
              { color: item.amount < 0 ? '#e74c3c' : '#27ae60' }
            ]}>
              {formatAmount(item.amount, item.currency)}
            </ThemedText>
          </View>
        ))}
        <TouchableOpacity style={styles.showMoreButton} onPress={openModal}>
          <ThemedText type="link">Show more</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Transaction Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <ThemedText type="title">Recent Activity</ThemedText>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <ThemedText type="link">Close</ThemedText>
            </TouchableOpacity>
          </View>

          {modalError ? (
            <View style={styles.centered}>
              <ThemedText>{modalError}</ThemedText>
              <TouchableOpacity onPress={() => fetchActivity(null)}>
                <ThemedText type="link">Retry</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={activities}
              keyExtractor={item => item.id}
              renderItem={renderActivity}
              onEndReached={loadMore}
              onEndReachedThreshold={0.3}
              ListFooterComponent={
                loadingMore ? <ActivityIndicator style={styles.loader} /> : null
              }
              ListEmptyComponent={
                !loadingMore ? <ActivityIndicator style={styles.loader} /> : null
              }
            />
          )}
        </SafeAreaView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 60 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { marginBottom: 24 },
  balanceCard: {
    padding: 16, borderRadius: 12, marginBottom: 24,
    borderWidth: 1, borderColor: '#e0e0e0',
  },
  balanceAmount: { fontSize: 32, fontWeight: 'bold', marginTop: 8, marginBottom: 4 },
  pendingLabel: { fontSize: 14, opacity: 0.6 },
  section: { marginBottom: 24 },
  activityRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#e0e0e0',
  },
  activityDescription: { flex: 1, marginRight: 8 },
  activityAmount: { fontWeight: '600' },
  showMoreButton: { marginTop: 12, alignItems: 'center' },
  retryButton: { marginTop: 12 },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 16, paddingTop: 50,
    borderBottomWidth: 1, borderBottomColor: '#e0e0e0',
  },
  activityRowFull: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 16,
    borderBottomWidth: 1, borderBottomColor: '#222',
  },
  activityLeft: { flex: 1, marginRight: 8 },
  activityRight: { flex: 1, alignItems: 'flex-end' },
 activityType: { fontSize: 13, fontWeight: '600', marginBottom: 2, color: '#000000' },
  activityDate: { fontSize: 12, opacity: 0.5, marginTop: 2 },
  activityStatus: { fontSize: 12, opacity: 0.5, marginTop: 2 },
  loader: { padding: 20 },
});