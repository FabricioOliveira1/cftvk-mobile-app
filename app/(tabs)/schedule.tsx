import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ClassListItem from '../../components/ClassListItem';
import FAB from '../../components/FAB';
import Icon from '../../components/Icon';
import { getClassesByDate, getReservationCount } from '../../src/services';
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

const ScheduleScreen: React.FC = () => {
  const router = useRouter();

  const [days] = useState<DayItem[]>(getWeekDays());
  const [selectedDate, setSelectedDate] = useState<string>(todayString);
  const [classes, setClasses] = useState<Class[]>([]);
  const [reservationCounts, setReservationCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const fetched = await getClassesByDate(selectedDate);
        setClasses(fetched);

        if (fetched.length > 0) {
          const counts = await Promise.all(
            fetched.map((c) => getReservationCount(c.id).then((n) => ({ id: c.id, count: n })))
          );
          const map: Record<string, number> = {};
          counts.forEach(({ id, count }) => { map[id] = count; });
          setReservationCounts(map);
        } else {
          setReservationCounts({});
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [selectedDate]);

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
        <ScrollView contentContainerStyle={styles.classesContainer}>
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
                />
              );
            })
          )}
        </ScrollView>
      )}

      <FAB onPress={() => router.push('/new-class')} />
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

export default ScheduleScreen;
