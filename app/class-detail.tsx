import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from '../components/Icon';
import { db } from '../src/services/firebase';
import {
  cancelReservation,
  checkInReservation,
  getReservationsByClass,
} from '../src/services';
import { Class, Reservation } from '../src/types';
import { Colors, Fonts } from '../theme';
import { doc, getDoc } from 'firebase/firestore';

interface AttendeeWithName extends Reservation {
  displayName: string;
}

const ClassDetailScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [classData, setClassData] = useState<Class | null>(null);
  const [attendees, setAttendees] = useState<AttendeeWithName[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<AttendeeWithName | null>(null);
  const [isSheetOpen, setSheetOpen] = useState(false);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const classSnap = await getDoc(doc(db, 'classes', id));
      if (classSnap.exists()) {
        setClassData({ id: classSnap.id, ...classSnap.data() } as Class);
      }

      const reservations = await getReservationsByClass(id);
      const withNames = await Promise.all(
        reservations.map(async (r) => {
          const userSnap = await getDoc(doc(db, 'users', r.userId));
          const name = userSnap.exists() ? (userSnap.data().name as string) : 'Usuário';
          return { ...r, displayName: name };
        })
      );
      setAttendees(withNames);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleCheckIn = async (reservation: AttendeeWithName) => {
    try {
      await checkInReservation(reservation.id);
      setAttendees((prev) =>
        prev.map((a) => (a.id === reservation.id ? { ...a, checkedIn: true } : a))
      );
    } catch {
      Alert.alert('Erro', 'Não foi possível registrar o check-in.');
    }
  };

  const handleCancelReservation = async () => {
    if (!selectedReservation) return;
    setSheetOpen(false);
    try {
      await cancelReservation(selectedReservation.id);
      setAttendees((prev) => prev.filter((a) => a.id !== selectedReservation.id));
    } catch {
      Alert.alert('Erro', 'Não foi possível cancelar a reserva.');
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${d} ${months[parseInt(m) - 1]}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: '',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <Icon name="arrow-back-ios" size={22} color={Colors.white} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          ),
        }}
      />

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 120 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.classHeader}>
            <Text style={styles.classTitle}>
              {classData ? `${classData.title} ${classData.time}` : 'Aula'}
            </Text>
            <Text style={styles.classSubtitle}>
              Coach {classData?.coach} • {formatDate(classData?.date)}
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Lista de Presença</Text>
              <Text style={styles.spotsText}>
                {attendees.length} / {classData?.capacity ?? 0}
              </Text>
            </View>
            {attendees.length === 0 && (
              <Text style={styles.emptyText}>Nenhuma reserva ainda.</Text>
            )}
            {attendees.map((attendee) => (
              <View key={attendee.id} style={styles.attendeeCard}>
                <View style={styles.attendeeInfo}>
                  <View style={styles.attendeeAvatarPlaceholder}>
                    <Icon name="person" size={24} color={Colors.textMuted} />
                  </View>
                  <View>
                    <Text style={styles.attendeeName}>{attendee.displayName}</Text>
                    <View style={styles.attendeeStatus}>
                      {attendee.checkedIn && (
                        <Icon name="check-circle" size={14} color={Colors.green[500]} />
                      )}
                      <Text
                        style={[
                          styles.attendeeStatusText,
                          { color: attendee.checkedIn ? Colors.green[500] : Colors.slate[500] },
                        ]}
                      >
                        {attendee.checkedIn ? 'Check-in realizado' : 'Aguardando presença'}
                      </Text>
                    </View>
                  </View>
                </View>
                {attendee.checkedIn ? (
                  <TouchableOpacity
                    style={styles.moreButton}
                    onPress={() => { setSelectedReservation(attendee); setSheetOpen(true); }}
                  >
                    <Icon name="more-vert" size={24} color={Colors.slate[400]} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.checkInButton}
                    onPress={() => handleCheckIn(attendee)}
                  >
                    <Text style={styles.checkInButtonText}>Marcar Presença</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.finishButton} onPress={() => Alert.alert('Aula encerrada', 'Em breve esta funcionalidade estará disponível.')}>
          <Icon name="how-to-reg" size={22} color={Colors.backgroundDark} />
          <Text style={styles.finishButtonText}>ENCERRAR AULA</Text>
        </TouchableOpacity>
      </View>

      <Modal animationType="slide" transparent visible={isSheetOpen} onRequestClose={() => setSheetOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSheetOpen(false)}>
          <View style={styles.modalContent}>
            <View style={styles.handle} />
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setSheetOpen(false);
                if (selectedReservation) {
                  router.push({ pathname: '/member-profile', params: { id: selectedReservation.userId } });
                }
              }}
            >
              <Icon name="person-search" size={22} color={Colors.primary} />
              <Text style={styles.modalButtonText}>Ver Perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}
              onPress={handleCancelReservation}
            >
              <Icon name="cancel" size={22} color={Colors.red[500]} />
              <Text style={[styles.modalButtonText, { color: Colors.red[500] }]}>Cancelar Reserva</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.backgroundDark },
  headerButton: { padding: 4, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 99 },
  container: { paddingTop: 80, padding: 24, paddingBottom: 120 },
  classHeader: { marginBottom: 32 },
  classTitle: { color: Colors.white, fontSize: 24, fontFamily: Fonts.sansBold },
  classSubtitle: { color: Colors.slate[400], fontSize: 14, fontFamily: Fonts.sansMedium },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { color: Colors.slate[400], fontSize: 12, fontFamily: Fonts.sansBold, textTransform: 'uppercase', letterSpacing: 0.5 },
  spotsText: { color: Colors.white, fontSize: 14, fontFamily: Fonts.sansBold },
  emptyText: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: 16 },
  attendeeCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 12 },
  attendeeInfo: { flexDirection: 'row', alignItems: 'center' },
  attendeeAvatarPlaceholder: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: 'rgba(232, 184, 67, 0.3)', marginRight: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surfaceDark },
  attendeeName: { color: Colors.white, fontSize: 14, fontFamily: Fonts.sansBold },
  attendeeStatus: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  attendeeStatusText: { fontSize: 10, fontFamily: Fonts.sansBold, textTransform: 'uppercase', marginLeft: 4 },
  moreButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  checkInButton: { backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  checkInButtonText: { color: Colors.backgroundDark, fontSize: 10, fontFamily: Fonts.sansBold, textTransform: 'uppercase' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, paddingTop: 12, backgroundColor: Colors.backgroundDark },
  finishButton: { height: 56, backgroundColor: Colors.primary, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  finishButtonText: { color: Colors.backgroundDark, fontFamily: Fonts.sansBold, fontSize: 16, marginLeft: 8 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1a1a1a', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, borderTopWidth: 1, borderColor: Colors.border },
  handle: { width: 48, height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, alignSelf: 'center', marginBottom: 32 },
  modalButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', height: 56, borderRadius: 16, paddingHorizontal: 20, marginBottom: 12 },
  modalButtonText: { color: Colors.white, fontSize: 16, fontFamily: Fonts.sansMedium, marginLeft: 16 },
});

export default ClassDetailScreen;
