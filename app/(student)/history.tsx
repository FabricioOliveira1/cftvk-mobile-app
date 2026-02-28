import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { collection, doc, getDoc, getDocs, orderBy, query, where } from 'firebase/firestore';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from '../../components/Icon';
import { useAuth } from '../../src/context';
import { db } from '../../src/services/firebase';
import { Class, ReservationStatus } from '../../src/types';
import { Colors, Fonts } from '../../theme';

// ── Types ──────────────────────────────────────────────────────────────────────

interface HistoryItem {
  reservationId: string;
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

// ── Screen ─────────────────────────────────────────────────────────────────────

const StudentHistoryScreen: React.FC = () => {
  const router = useRouter();
  const { appUser } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!appUser) return;
      setLoading(true);

      const today = new Date().toISOString().split('T')[0];

      const loadHistory = async () => {
        try {
          // Busca todas as reservas do usuário
          const q = query(
            collection(db, 'reservations'),
            where('userId', '==', appUser.id)
          );
          const snap = await getDocs(q);

          const items: HistoryItem[] = [];

          await Promise.all(
            snap.docs.map(async (resDoc) => {
              const resData = resDoc.data();
              const classSnap = await getDoc(doc(db, 'classes', resData.classId));
              if (!classSnap.exists()) return;

              const cls = { id: classSnap.id, ...classSnap.data() } as Class;

              // Apenas aulas passadas (data < hoje)
              if (cls.date < today) {
                items.push({
                  reservationId: resDoc.id,
                  // backward compat: tolera docs antigos sem status
                  status: (resData.status ?? (resData.checkedIn ? 'CHECKED_IN' : 'BOOKED')) as ReservationStatus,
                  cls,
                });
              }
            })
          );

          // Ordena do mais recente para o mais antigo
          items.sort((a, b) => b.cls.date.localeCompare(a.cls.date));
          setHistory(items);
        } finally {
          setLoading(false);
        }
      };

      loadHistory();
    }, [appUser?.id])
  );

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
        <ScrollView contentContainerStyle={styles.container}>
          {history.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="fitness-center" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>Nenhum treino ainda</Text>
              <Text style={styles.emptySubtitle}>Suas aulas realizadas aparecerão aqui.</Text>
            </View>
          ) : (
            history.map((item) => (
              <TouchableOpacity
                key={item.reservationId}
                style={styles.card}
                onPress={() => router.push({ pathname: '/class-detail', params: { id: item.cls.id } })}
              >
                <View style={styles.cardIconContainer}>
                  <Icon name="fitness-center" size={22} color={Colors.primary} />
                </View>

                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{item.cls.title}</Text>
                  <Text style={styles.cardSub}>
                    {formatDateLabel(item.cls.date)} · {item.cls.time} · Coach {item.cls.coach}
                  </Text>
                </View>

                <View style={[styles.statusBadge, item.status === 'CHECKED_IN' ? styles.statusCheckedIn : styles.statusAbsent]}>
                  <Icon
                    name={item.status === 'CHECKED_IN' ? 'check-circle' : 'cancel'}
                    size={14}
                    color={item.status === 'CHECKED_IN' ? Colors.green[500] : Colors.textMuted}
                  />
                  <Text style={[styles.statusText, { color: item.status === 'CHECKED_IN' ? Colors.green[500] : Colors.textMuted }]}>
                    {item.status === 'CHECKED_IN' ? 'Presente' : 'Faltou'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
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

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardDark,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  cardIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(232,184,67,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    color: Colors.white,
    fontFamily: Fonts.sansBold,
    fontSize: 14,
    marginBottom: 3,
  },
  cardSub: {
    color: Colors.textMuted,
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99,
  },
  statusCheckedIn: {
    backgroundColor: 'rgba(34,197,94,0.1)',
  },
  statusAbsent: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  statusText: {
    fontFamily: Fonts.sansBold,
    fontSize: 11,
  },
});

export default StudentHistoryScreen;
