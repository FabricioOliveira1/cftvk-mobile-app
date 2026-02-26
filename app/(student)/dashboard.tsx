import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ClassListItem from '../../components/ClassListItem';
import Icon from '../../components/Icon';
import ScreenHeader from '../../components/ScreenHeader';
import { useAuth } from '../../src/context';
import {
  cancelReservation,
  createReservation,
  getClassesByDate,
  getReservationCount,
  getUserReservationForClass,
} from '../../src/services';
import { Class } from '../../src/types';
import { Colors, Fonts } from '../../theme';

// ── Helpers ────────────────────────────────────────────────────────────────────

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function formatTodayLabel(): string {
  const now = new Date();
  return `${DAY_NAMES[now.getDay()]}, ${now.getDate()} de ${MONTH_NAMES[now.getMonth()]}`;
}

function currentTimeString(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

const todayString = new Date().toISOString().split('T')[0];

// ── Types ──────────────────────────────────────────────────────────────────────

interface ClassWithExtra {
  cls: Class;
  count: number;
  reservationId: string | null;
  checkedIn: boolean;
}

// ── Compute next class ─────────────────────────────────────────────────────────
// Regras:
//  1. O aluno deve ter reserva (reservationId !== null)
//  2. Check-in ainda não foi realizado (checkedIn === false)
//  3. A aula ainda não passou (time >= agora)
//  4. Entre os candidatos, retorna o de horário mais cedo

function computeNextClass(items: ClassWithExtra[]): Class | null {
  const now = currentTimeString();
  const candidates = items
    .filter((item) => item.reservationId !== null && !item.checkedIn && item.cls.time >= now)
    .sort((a, b) => a.cls.time.localeCompare(b.cls.time));
  return candidates[0]?.cls ?? null;
}

// ── Screen ─────────────────────────────────────────────────────────────────────

const StudentDashboardScreen: React.FC = () => {
  const router = useRouter();
  const { appUser } = useAuth();

  const [todayClasses, setTodayClasses] = useState<ClassWithExtra[]>([]);
  const [nextClass, setNextClass] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [reservingClassId, setReservingClassId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!appUser) return;
    setLoading(true);
    try {
      const classes = await getClassesByDate(todayString);

      const [counts, reservations] = await Promise.all([
        Promise.all(classes.map((c) => getReservationCount(c.id).then((n) => ({ id: c.id, count: n })))),
        Promise.all(
          classes.map((c) =>
            getUserReservationForClass(c.id, appUser.id).then((r) => ({
              classId: c.id,
              reservationId: r?.id ?? null,
              checkedIn: r?.checkedIn ?? false,
            }))
          )
        ),
      ]);

      const countMap: Record<string, number> = {};
      counts.forEach(({ id, count }) => { countMap[id] = count; });

      const resMap: Record<string, { id: string | null; checkedIn: boolean }> = {};
      reservations.forEach(({ classId, reservationId, checkedIn }) => {
        resMap[classId] = { id: reservationId, checkedIn };
      });

      const withExtra: ClassWithExtra[] = classes.map((c) => ({
        cls: c,
        count: countMap[c.id] ?? 0,
        reservationId: resMap[c.id]?.id ?? null,
        checkedIn: resMap[c.id]?.checkedIn ?? false,
      }));

      setTodayClasses(withExtra);
      setNextClass(computeNextClass(withExtra));
    } finally {
      setLoading(false);
    }
  }, [appUser?.id]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleReserve = async (classId: string, capacity: number) => {
    if (!appUser) return;
    const item = todayClasses.find((i) => i.cls.id === classId);
    if (item && item.count >= capacity) {
      Alert.alert('Aula lotada', 'Não há mais vagas disponíveis.');
      return;
    }
    setReservingClassId(classId);
    try {
      const reservationId = await createReservation(classId, appUser.id);
      setTodayClasses((prev) => {
        const updated = prev.map((i) =>
          i.cls.id === classId ? { ...i, reservationId, count: i.count + 1, checkedIn: false } : i
        );
        setNextClass(computeNextClass(updated));
        return updated;
      });
    } catch {
      Alert.alert('Erro', 'Não foi possível realizar a reserva.');
    } finally {
      setReservingClassId(null);
    }
  };

  const handleCancelReservation = async (classId: string) => {
    const item = todayClasses.find((i) => i.cls.id === classId);
    if (!item?.reservationId) return;
    setReservingClassId(classId);
    try {
      await cancelReservation(item.reservationId);
      setTodayClasses((prev) => {
        const updated = prev.map((i) =>
          i.cls.id === classId
            ? { ...i, reservationId: null, count: Math.max(0, i.count - 1), checkedIn: false }
            : i
        );
        setNextClass(computeNextClass(updated));
        return updated;
      });
    } catch {
      Alert.alert('Erro', 'Não foi possível cancelar a reserva.');
    } finally {
      setReservingClassId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader adminName={appUser?.name?.split(' ')[0]} />

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginBottom: 32 }} />
        ) : (
          <>
            {/* ── Próxima Aula ── */}
            {nextClass ? (
              <TouchableOpacity
                style={styles.nextClassCard}
                onPress={() => router.push({ pathname: '/class-detail', params: { id: nextClass.id } })}
                activeOpacity={0.85}
              >
                <View style={styles.nextClassTop}>
                  <View style={styles.nextClassBadge}>
                    <Text style={styles.nextClassBadgeText}>PRÓXIMA AULA</Text>
                  </View>
                  <Text style={styles.nextClassTime}>Hoje às {nextClass.time}</Text>
                </View>
                <Text style={styles.nextClassTitle}>{nextClass.title}</Text>
                <View style={styles.nextClassCoachRow}>
                  <Icon name="person" size={16} color={Colors.textMuted} />
                  <Text style={styles.nextClassCoachText}>Coach {nextClass.coach}</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={[styles.nextClassCard, styles.nextClassEmpty]}>
                <Icon name="event-busy" size={32} color={Colors.textMuted} />
                <Text style={styles.nextClassEmptyText}>Nenhuma aula reservada para hoje</Text>
              </View>
            )}

            {/* ── PRs Recentes ── */}
            <View style={styles.prCard}>
              <View style={styles.prLeft}>
                <View style={styles.prIconContainer}>
                  <Icon name="emoji-events" size={24} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.prLabel}>PRs Recentes</Text>
                  <Text style={styles.prExercise}>Back Squat</Text>
                </View>
              </View>
              <View style={styles.prRight}>
                <Text style={styles.prValue}>140kg</Text>
                <Icon name="trending-up" size={20} color={Colors.green[500]} />
              </View>
            </View>

            {/* ── Aulas de Hoje ── */}
            <View style={styles.todaySection}>
              <View style={styles.todayHeader}>
                <Text style={styles.todayTitle}>Aulas de Hoje</Text>
                <Text style={styles.todayDate}>{formatTodayLabel()}</Text>
              </View>

              {todayClasses.length === 0 ? (
                <Text style={styles.emptyText}>Nenhuma aula cadastrada para hoje.</Text>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.classesScroll}
                >
                  {todayClasses.map(({ cls, count, reservationId }) => (
                    <View key={cls.id} style={styles.classCardWrapper}>
                      <ClassListItem
                        item={{
                          time: `${cls.title.toUpperCase()} ${cls.time}`,
                          coach: cls.coach,
                          spots: `${count}/${cls.capacity}`,
                          icon: 'fitness-center',
                          color: Colors.primary,
                          isFull: count >= cls.capacity,
                          opacity: 1,
                        }}
                        onPress={() => router.push({ pathname: '/class-detail', params: { id: cls.id } })}
                        myReservationId={reservationId ?? undefined}
                        onReserve={() => handleReserve(cls.id, cls.capacity)}
                        onCancelReservation={() => handleCancelReservation(cls.id)}
                        reserving={reservingClassId === cls.id}
                      />
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.backgroundDark },
  scrollView: { flex: 1 },
  contentContainer: { padding: 24, paddingBottom: 100 },

  // Próxima Aula
  nextClassCard: {
    backgroundColor: Colors.cardDark,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nextClassTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  nextClassBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  nextClassBadgeText: {
    color: Colors.backgroundDark,
    fontFamily: Fonts.sansBold,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  nextClassTime: {
    color: Colors.primary,
    fontFamily: Fonts.sansBold,
    fontSize: 14,
  },
  nextClassTitle: {
    color: Colors.white,
    fontFamily: Fonts.sansBold,
    fontSize: 24,
    marginBottom: 8,
  },
  nextClassCoachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nextClassCoachText: {
    color: Colors.textMuted,
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
  },
  nextClassEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 32,
  },
  nextClassEmptyText: {
    color: Colors.textMuted,
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
  },

  // PRs Recentes
  prCard: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: 20,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  prLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  prIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(232,184,67,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prLabel: {
    color: Colors.textMuted,
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    marginBottom: 2,
  },
  prExercise: {
    color: Colors.textSecondary,
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
  },
  prRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  prValue: {
    color: Colors.white,
    fontFamily: Fonts.sansBold,
    fontSize: 28,
  },

  // Aulas de Hoje
  todaySection: {
    marginBottom: 16,
  },
  todayHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  todayTitle: {
    color: Colors.white,
    fontFamily: Fonts.sansBold,
    fontSize: 20,
  },
  todayDate: {
    color: Colors.textMuted,
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
  },
  classesScroll: {
    paddingRight: 8,
    gap: 12,
  },
  classCardWrapper: {
    width: 300,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontFamily: Fonts.sansMedium,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default StudentDashboardScreen;
