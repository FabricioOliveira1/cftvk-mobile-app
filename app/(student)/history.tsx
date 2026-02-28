import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { DocumentSnapshot, QueryDocumentSnapshot, doc, getDoc } from 'firebase/firestore';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ClassListItem from '../../components/ClassListItem';
import Icon from '../../components/Icon';
import { useAuth } from '../../src/context';
import { db } from '../../src/services/firebase';
import { getHistoryPage } from '../../src/services';
import { Class, ReservationStatus } from '../../src/types';
import { Colors, Fonts } from '../../theme';

// ── Constants ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

// ── Types ──────────────────────────────────────────────────────────────────────

interface HistoryItem {
  reservationId: string;
  reservationDoc: QueryDocumentSnapshot;
  status: ReservationStatus;
  cls: Class;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function formatDateLabel(dateStr?: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${DAY_NAMES[date.getDay()]}, ${d} de ${MONTH_NAMES[m - 1]}`;
}

/**
 * Retorna true se a aula já terminou (duração 1h).
 * Aulas de dias anteriores: sempre true.
 * Aulas de hoje: apenas se classTime + 60min < agora.
 */
function isPastClass(classDate?: string, classTime?: string): boolean {
  if (!classDate || !classTime) return true; // conservador: inclui se dados ausentes
  const today = new Date().toISOString().split('T')[0];
  if (classDate < today) return true;
  if (classDate > today) return false;
  // classDate === hoje: checar se aula terminou
  const [h, min] = classTime.split(':').map(Number);
  const classEnd = new Date();
  classEnd.setHours(h, min + 60, 0, 0);
  return new Date() > classEnd;
}

// ── Empty state ────────────────────────────────────────────────────────────────

const EmptyView: React.FC = () => (
  <View style={styles.emptyContainer}>
    <Icon name="fitness-center" size={48} color={Colors.textMuted} />
    <Text style={styles.emptyTitle}>Nenhum treino ainda</Text>
    <Text style={styles.emptySubtitle}>Suas aulas realizadas aparecerão aqui.</Text>
  </View>
);

// ── Screen ─────────────────────────────────────────────────────────────────────

const StudentHistoryScreen: React.FC = () => {
  const router = useRouter();
  const { appUser } = useAuth();

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);

  const loadPage = useCallback(
    async (cursor: DocumentSnapshot | undefined, replace: boolean) => {
      if (!appUser) return;
      if (replace) setLoading(true);
      else setLoadingMore(true);

      try {
        const { docs, lastDoc: nextCursor } = await getHistoryPage(appUser.id, PAGE_SIZE, cursor);

        // Filtra client-side: descarta reservas de hoje cuja aula ainda não terminou
        const pastDocs = docs.filter((resDoc: QueryDocumentSnapshot) => {
          const { classDate, classTime } = resDoc.data();
          return isPastClass(classDate, classTime);
        });

        // Busca class docs em paralelo — bounded por PAGE_SIZE (≤10 reads)
        const items = (
          await Promise.all(
            pastDocs.map(async (resDoc: QueryDocumentSnapshot) => {
              const data = resDoc.data();
              const classSnap = await getDoc(doc(db, 'classes', data.classId));
              if (!classSnap.exists()) return null;
              return {
                reservationId: resDoc.id,
                reservationDoc: resDoc,
                status: (data.status ?? 'NO_SHOW') as ReservationStatus,
                cls: { id: classSnap.id, ...classSnap.data() } as Class,
              };
            })
          )
        ).filter(Boolean) as HistoryItem[];

        setHistory((prev) => (replace ? items : [...prev, ...items]));
        setLastDoc(nextCursor);
        setHasMore(nextCursor !== null);
      } finally {
        if (replace) setLoading(false);
        else setLoadingMore(false);
      }
    },
    [appUser]
  );

  useFocusEffect(
    useCallback(() => {
      setHistory([]);
      setLastDoc(undefined);
      setHasMore(true);
      loadPage(undefined, true);
    }, [loadPage])
  );

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && lastDoc) {
      loadPage(lastDoc, false);
    }
  };

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <ClassListItem
      item={{
        time: `${item.cls.title} · ${item.cls.time}`,
        coach: item.cls.coach,
        spots: formatDateLabel(item.cls.date),
        icon: 'fitness-center',
        color: Colors.primary,
        isFull: false,
        opacity: 1,
      }}
      onPress={() => router.push({ pathname: '/class-detail', params: { id: item.cls.id } })}
      myReservationId={item.reservationId}
      reservationStatus={item.status}
      historyMode
    />
  );

  const renderFooter = () =>
    loadingMore ? (
      <ActivityIndicator color={Colors.primary} style={{ marginVertical: 16 }} />
    ) : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: Colors.backgroundDark },
          headerTintColor: Colors.white,
          headerTitle: 'Histórico de Treinos',
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
              <Icon name="arrow-back-ios" size={22} color={Colors.white} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          ),
        }}
      />

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 48 }} />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.reservationId}
          renderItem={renderItem}
          contentContainerStyle={styles.container}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={<EmptyView />}
        />
      )}
    </SafeAreaView>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.backgroundDark },
  container: { padding: 24, paddingBottom: 100 },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    color: Colors.white,
    fontFamily: Fonts.sansBold,
    fontSize: 18,
  },
  emptySubtitle: {
    color: Colors.textMuted,
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default StudentHistoryScreen;
