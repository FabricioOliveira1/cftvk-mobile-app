import { Stack, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ClassListItem from '../../components/ClassListItem';
import Icon from '../../components/Icon';
import { useAuth } from '../../src/context';
import {
  cancelReservation,
  createReservation,
  getClassesByDate,
  getReservationCount,
  getUserDayReservationStatus,
  getUserReservationForClass,
} from '../../src/services';
import { Class } from '../../src/types';
import { Colors, Fonts } from '../../theme';

interface DayItem {
  day: string;
  date: number;
  dateString: string;
}

function getWeekDays(): DayItem[] {
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const result: DayItem[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    result.push({
      day: dayNames[d.getDay()],
      date: d.getDate(),
      dateString: d.toISOString().split('T')[0],
    });
  }
  return result;
}

const todayString = new Date().toISOString().split('T')[0];

// ── Reservation time rules ──────────────────────────────────────────────────────

type TimeStatus =
  | { type: 'expired' }
  | { type: 'pending'; opensLabel: string };

function getClassDateTime(date: string, time: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  const [h, min] = time.split(':').map(Number);
  return new Date(y, m - 1, d, h, min, 0);
}

function formatDateLabel(date: Date): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  if (date.toDateString() === today.toDateString()) return `hoje\nàs ${time}`;
  if (date.toDateString() === tomorrow.toDateString()) return `amanhã\nàs ${time}`;
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}\nàs ${time}`;
}

function computeTimeStatus(cls: Class): TimeStatus | undefined {
  const now = new Date();
  const classStart = getClassDateTime(cls.date, cls.time);
  const opensAt = new Date(classStart.getTime() - 12 * 60 * 60 * 1000);
  const deadline = new Date(classStart.getTime() + 15 * 60 * 1000);
  if (now < opensAt) return { type: 'pending', opensLabel: `Abre ${formatDateLabel(opensAt)}` };
  if (now > deadline) return { type: 'expired' };
  return undefined;
}

function isClassEnded(date: string, time: string): boolean {
  const classEnd = getClassDateTime(date, time);
  classEnd.setMinutes(classEnd.getMinutes() + 60);
  return new Date() > classEnd;
}

const StudentScheduleScreen: React.FC = () => {
  const router = useRouter();
  const { appUser } = useAuth();

  const [days] = useState<DayItem[]>(getWeekDays());
  const [selectedDate, setSelectedDate] = useState<string>(todayString);
  const [classes, setClasses] = useState<Class[]>([]);
  const [reservationCounts, setReservationCounts] = useState<Record<string, number>>({});
  const [userReservations, setUserReservations] = useState<Record<string, string>>({});
  const [reservingClassId, setReservingClassId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const fetched = await getClassesByDate(selectedDate);
      fetched.sort((a, b) => a.time.localeCompare(b.time));
      setClasses(fetched);

      if (fetched.length > 0) {
        const [counts, reservations] = await Promise.all([
          Promise.all(
            fetched.map((c) => getReservationCount(c.id).then((n) => ({ id: c.id, count: n })))
          ),
          appUser
            ? Promise.all(
                fetched.map((c) =>
                  getUserReservationForClass(c.id, appUser.id).then((r) => ({
                    classId: c.id,
                    reservationId: r?.id ?? null,
                  }))
                )
              )
            : [],
        ]);

        const countMap: Record<string, number> = {};
        counts.forEach(({ id, count }) => { countMap[id] = count; });
        setReservationCounts(countMap);

        const resMap: Record<string, string> = {};
        (reservations as { classId: string; reservationId: string | null }[]).forEach(
          ({ classId, reservationId }) => {
            if (reservationId) resMap[classId] = reservationId;
          }
        );
        setUserReservations(resMap);
      } else {
        setReservationCounts({});
        setUserReservations({});
      }
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  }, [selectedDate, appUser]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleReserve = async (cls: Class) => {
    if (!appUser) return;

    const count = reservationCounts[cls.id] ?? 0;
    if (count >= cls.capacity) {
      Alert.alert('Aula lotada', 'Não há mais vagas disponíveis.');
      return;
    }

    // Regra: apenas 1 reserva por dia
    setReservingClassId(cls.id);
    try {
      const dayReservation = await getUserDayReservationStatus(appUser.id, cls.date);
      if (dayReservation) {
        const today = new Date().toISOString().split('T')[0];
        const isToday = cls.date === today;
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const alreadyHappened = isToday && dayReservation.classTime && dayReservation.classTime < currentTime;
        if (alreadyHappened) {
          Alert.alert('Limite diário atingido', 'Você já treinou hoje. Só é permitido um treino por dia.');
        } else {
          Alert.alert('Limite diário atingido', 'Você já possui uma aula reservada neste dia. Cancele a reserva atual para agendar outra.');
        }
        return;
      }

      const reservationId = await createReservation(cls.id, appUser.id, cls.date, cls.time);
      setUserReservations((prev) => ({ ...prev, [cls.id]: reservationId }));
      setReservationCounts((prev) => ({ ...prev, [cls.id]: (prev[cls.id] ?? 0) + 1 }));
    } catch {
      Alert.alert('Erro', 'Não foi possível realizar a reserva.');
    } finally {
      setReservingClassId(null);
    }
  };

  const handleCancelReservation = async (classId: string) => {
    const reservationId = userReservations[classId];
    if (!reservationId) return;
    const cls = classes.find((c) => c.id === classId);
    if (cls) {
      const classStart = getClassDateTime(cls.date, cls.time);
      if (new Date() >= classStart) {
        Alert.alert('Cancelamento não permitido', 'O prazo de cancelamento encerrou no início da aula.');
        return;
      }
    }
    setReservingClassId(classId);
    try {
      await cancelReservation(reservationId);
      setUserReservations((prev) => {
        const next = { ...prev };
        delete next[classId];
        return next;
      });
      setReservationCounts((prev) => ({
        ...prev,
        [classId]: Math.max(0, (prev[classId] ?? 1) - 1),
      }));
    } catch {
      Alert.alert('Erro', 'Não foi possível cancelar a reserva.');
    } finally {
      setReservingClassId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: Colors.backgroundDark },
          headerTintColor: Colors.white,
          headerTitle: 'Agenda de Aulas',
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
              <Icon name="arrow-back-ios" size={22} color={Colors.white} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          ),
        }}
      />

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysContainer}>
          {days.map((d) => (
            <TouchableOpacity
              key={d.dateString}
              style={[styles.dayCard, d.dateString === selectedDate && styles.dayCardActive]}
              onPress={() => setSelectedDate(d.dateString)}
            >
              <Text style={[styles.dayText, d.dateString === selectedDate && styles.dayTextActive]}>{d.day}</Text>
              <Text style={[styles.dateText, d.dateString === selectedDate && styles.dateTextActive]}>{d.date}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 32 }} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.classesContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
        >
          {classes.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma aula cadastrada para este dia.</Text>
          ) : (
            classes.map((c) => {
              const count = reservationCounts[c.id] ?? 0;
              const classStart = getClassDateTime(c.date, c.time);
              const now = new Date();
              const started = now >= classStart;
              const timeStatus = computeTimeStatus(c);
              const ended = isClassEnded(c.date, c.time);
              return (
                <ClassListItem
                  key={c.id}
                  item={{
                    time: `${c.title} ${c.time}`,
                    coach: c.coach,
                    spots: `${count}/${c.capacity}`,
                    icon: 'fitness-center',
                    color: Colors.primary,
                    isFull: count >= c.capacity,
                    opacity: 1,
                  }}
                  onPress={ended ? undefined : () => router.push({ pathname: '/class-detail', params: { id: c.id } })}
                  myReservationId={userReservations[c.id]}
                  onReserve={() => handleReserve(c)}
                  onCancelReservation={() => handleCancelReservation(c.id)}
                  reserving={reservingClassId === c.id}
                  timeStatus={timeStatus}
                  classEnded={ended}
                  classStarted={started}
                />
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.backgroundDark },
  daysContainer: { paddingHorizontal: 24, paddingVertical: 16, paddingBottom: 24 },
  dayCard: { minWidth: 56, alignItems: 'center', paddingVertical: 12, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: Colors.border, marginRight: 12 },
  dayCardActive: { backgroundColor: Colors.primary },
  dayText: { fontSize: 10, textTransform: 'uppercase', fontFamily: Fonts.sansBold, color: Colors.slate[400] },
  dayTextActive: { color: Colors.backgroundDark, opacity: 0.8 },
  dateText: { fontSize: 18, fontFamily: Fonts.sansBold, color: Colors.white },
  dateTextActive: { color: Colors.backgroundDark },
  classesContainer: { paddingHorizontal: 24, paddingBottom: 100 },
  emptyText: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: 32 },
});

export default StudentScheduleScreen;
