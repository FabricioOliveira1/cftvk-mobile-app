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

  const handleReserve = async (classId: string, capacity: number) => {
    if (!appUser) return;
    const count = reservationCounts[classId] ?? 0;
    if (count >= capacity) {
      Alert.alert('Aula lotada', 'Não há mais vagas disponíveis.');
      return;
    }
    setReservingClassId(classId);
    try {
      const reservationId = await createReservation(classId, appUser.id);
      setUserReservations((prev) => ({ ...prev, [classId]: reservationId }));
      setReservationCounts((prev) => ({ ...prev, [classId]: (prev[classId] ?? 0) + 1 }));
    } catch {
      Alert.alert('Erro', 'Não foi possível realizar a reserva.');
    } finally {
      setReservingClassId(null);
    }
  };

  const handleCancelReservation = async (classId: string) => {
    const reservationId = userReservations[classId];
    if (!reservationId) return;
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
                  onPress={() => router.push({ pathname: '/class-detail', params: { id: c.id } })}
                  myReservationId={userReservations[c.id]}
                  onReserve={() => handleReserve(c.id, c.capacity)}
                  onCancelReservation={() => handleCancelReservation(c.id)}
                  reserving={reservingClassId === c.id}
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
