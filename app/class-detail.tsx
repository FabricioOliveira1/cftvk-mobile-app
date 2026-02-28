import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
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
import { useAuth } from '../src/context';
import {
  callAdminCheckIn,
  callCheckIn,
  cancelReservation,
  createReservation,
  deleteClass,
  getReservationsByClass,
  getUserActiveReservationCount,
  getUserReservationForClass,
} from '../src/services';
import { db } from '../src/services/firebase';
import { Class, Reservation, ReservationStatus, Session } from '../src/types';
import { Colors, Fonts } from '../theme';

// ── Types ──────────────────────────────────────────────────────────────────────

interface AttendeeWithName extends Omit<Reservation, 'checkedInAt'> {
  displayName: string;
  plan?: string;
  checkedInAt?: string; // formatado HH:mm para exibição
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const DAY_NAMES_FULL = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado',
];
const MONTH_NAMES_FULL = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function formatDateFull(dateStr?: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${DAY_NAMES_FULL[date.getDay()]}, ${d} de ${MONTH_NAMES_FULL[m - 1]}`.toUpperCase();
}

function formatTimestamp(ts?: any): string {
  if (!ts) return '';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

// ── Session helpers ────────────────────────────────────────────────────────────

function getSessionIcon(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('aquecimento')) return 'local-fire-department';
  if (t.includes('skill') || t.includes('técnica') || t.includes('tecnica')) return 'build';
  if (t.includes('wod')) return 'timer';
  return 'fitness-center';
}

function getWodBadge(details: string): string | null {
  const d = details.toUpperCase();
  if (d.includes('FOR TIME')) return 'FOR TIME';
  if (d.includes('AMRAP')) return 'AMRAP';
  if (d.includes('E2MOM') || d.includes('EMOM')) return 'EMOM';
  return null;
}

function isWodSession(title: string): boolean {
  return title.toLowerCase().includes('wod');
}

function isCheckInWindowExpired(cls: Class): boolean {
  const [y, m, d] = cls.date.split('-').map(Number);
  const [h, min] = cls.time.split(':').map(Number);
  return new Date() > new Date(y, m - 1, d, h, min + 15, 0);
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const TabButton: React.FC<{
  title: string;
  isActive: boolean;
  onPress: () => void;
}> = ({ title, isActive, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.tabButton, isActive && styles.tabButtonActive]}
  >
    <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const SessionCard: React.FC<{ session: Session }> = ({ session }) => {
  const icon = getSessionIcon(session.title);
  const badge = getWodBadge(session.details);
  const isWod = isWodSession(session.title);

  return (
    <View style={[styles.sessionCard, isWod && styles.sessionCardWod]}>
      <View style={styles.sessionCardHeader}>
        <View style={styles.sessionCardTitleRow}>
          <Icon name={icon as any} size={18} color={Colors.primary} />
          <Text style={styles.sessionCardTitle}>{session.title.toUpperCase()}</Text>
        </View>
        {badge && (
          <View style={styles.sessionBadge}>
            <Text style={styles.sessionBadgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.sessionCardDetails, isWod && styles.sessionCardDetailsWod]}>
        {session.details}
      </Text>
    </View>
  );
};

// ── Main Screen ────────────────────────────────────────────────────────────────

const ClassDetailScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appUser } = useAuth();

  const [classData, setClassData] = useState<Class | null>(null);
  const [attendees, setAttendees] = useState<AttendeeWithName[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'treino' | 'presenca'>('treino');
  const [selectedReservation, setSelectedReservation] = useState<AttendeeWithName | null>(null);
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [myReservationId, setMyReservationId] = useState<string | null>(null);
  const [reserving, setReserving] = useState(false);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const classSnap = await getDoc(doc(db, 'classes', id));
      if (classSnap.exists()) {
        setClassData({ id: classSnap.id, ...classSnap.data() } as Class);
      }

      const [reservations, myRes] = await Promise.all([
        getReservationsByClass(id),
        appUser ? getUserReservationForClass(id, appUser.id) : Promise.resolve(null),
      ]);

      setMyReservationId(myRes?.id ?? null);

      const withNames = await Promise.all(
        reservations.map(async (r) => {
          const userSnap = await getDoc(doc(db, 'users', r.userId));
          const name = userSnap.exists() ? (userSnap.data().name as string) : 'Usuário';
          const plan = userSnap.exists() ? (userSnap.data().plan as string | undefined) : undefined;
          const checkedInAt = r.status === 'CHECKED_IN' ? formatTimestamp(r.checkedInAt ?? r.createdAt) : undefined;
          return { ...r, displayName: name, plan, checkedInAt };
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

  // Check-in pelo admin (sem restrição de tempo)
  const handleCheckIn = async (reservation: AttendeeWithName) => {
    try {
      await callAdminCheckIn(reservation.id);
      setAttendees((prev) =>
        prev.map((a) =>
          a.id === reservation.id
            ? { ...a, status: 'CHECKED_IN' as ReservationStatus, checkedInAt: formatTimestamp(new Date()) }
            : a
        )
      );
    } catch {
      Alert.alert('Erro', 'Não foi possível registrar o check-in.');
    }
  };

  // Check-in pelo próprio aluno (validado server-side: janela até classStart + 15min)
  const handleStudentCheckIn = async (reservation: AttendeeWithName) => {
    try {
      await callCheckIn(reservation.id);
      setAttendees((prev) =>
        prev.map((a) =>
          a.id === reservation.id
            ? { ...a, status: 'CHECKED_IN' as ReservationStatus, checkedInAt: formatTimestamp(new Date()) }
            : a
        )
      );
    } catch (e: any) {
      if (e?.code === 'functions/failed-precondition') {
        Alert.alert('Tempo esgotado', 'A janela de check-in encerrou 15 minutos após o início da aula.');
      } else {
        Alert.alert('Erro', 'Não foi possível registrar o check-in.');
      }
    }
  };

  const handleReserve = async () => {
    if (!appUser || !id || !classData) return;
    if (attendees.length >= classData.capacity) {
      Alert.alert('Aula lotada', 'Não há mais vagas disponíveis.');
      return;
    }
    setReserving(true);
    try {
      const activeCount = await getUserActiveReservationCount(appUser.id);
      if (activeCount >= 1) {
        Alert.alert('Limite atingido', 'Você já possui uma aula reservada. Cancele a reserva atual para agendar uma nova.');
        return;
      }
      const reservationId = await createReservation(id, appUser.id, classData.date, classData.time);
      setMyReservationId(reservationId);
    } catch {
      Alert.alert('Erro', 'Não foi possível realizar a reserva.');
    } finally {
      setReserving(false);
    }
  };

  const handleCancelMyReservation = async () => {
    if (!myReservationId) return;
    setReserving(true);
    try {
      await cancelReservation(myReservationId);
      setMyReservationId(null);
    } catch {
      Alert.alert('Erro', 'Não foi possível cancelar a reserva.');
    } finally {
      setReserving(false);
    }
  };

  const handleDeleteClass = () => {
    const bookedCount = attendees.filter((a) => a.status === 'BOOKED').length;
    const warningMsg = bookedCount > 0
      ? `Esta aula possui ${bookedCount} aluno(s) com reserva ativa. As reservas serão canceladas automaticamente.\n\nEsta ação não pode ser desfeita.`
      : 'Esta ação não pode ser desfeita.';

    Alert.alert('Excluir Aula', warningMsg, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          if (!id) return;
          setDeleting(true);
          try {
            await deleteClass(id);
            router.back();
          } catch {
            Alert.alert('Erro', 'Não foi possível excluir a aula.');
            setDeleting(false);
          }
        },
      },
    ]);
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

  const isFull = classData ? attendees.length >= classData.capacity : false;
  const sessions = classData?.sessions ?? [];

  const screenTitle = classData?.title
    ? `${classData.title.toUpperCase()} WOD`
    : 'CROSSFIT WOD';

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: false,
          headerStyle: { backgroundColor: Colors.backgroundDark },
          headerTitleStyle: {
            color: Colors.white,
            fontFamily: Fonts.sansBold,
            fontSize: 16,
          },
          headerTitleAlign: 'center',
          headerTitle: screenTitle,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <Icon name="arrow-back-ios" size={22} color={Colors.white} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => Alert.alert('Compartilhar', 'Em breve disponível.')}
            >
              <Icon name="ios-share" size={22} color={Colors.white} />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Tab Bar */}
      <View style={styles.tabContainer}>
        <TabButton
          title="TREINO"
          isActive={activeTab === 'treino'}
          onPress={() => setActiveTab('treino')}
        />
        <TabButton
          title={`LISTA DE PRESENÇA (${attendees.length.toString()})`}
          isActive={activeTab === 'presenca'}
          onPress={() => setActiveTab('presenca')}
        />
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <>
          {activeTab === 'treino' ? (
            /* ── TREINO TAB ──────────────────────────────────────────────── */
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Title block */}
              <View style={styles.wodHeader}>
                <Text style={styles.wodTitle}>WOD do Dia</Text>
                <Text style={styles.wodDate}>{classData?.time} - {formatDateFull(classData?.date)}</Text>
              </View>

              {/* Session cards */}
              {sessions.length === 0 ? (
                <Text style={styles.emptyText}>Nenhuma sessão cadastrada para esta aula.</Text>
              ) : (
                sessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))
              )}

            </ScrollView>
          ) : (
            /* ── LISTA DE PRESENÇA TAB ───────────────────────────────────── */
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Count header */}
              <View style={styles.presenceHeader}>
                <Text style={styles.presenceCount}>
                  Alunos Confirmados ({attendees.length})
                </Text>
                {isFull && (
                  <Text style={styles.presenceFull}>A aula está lotada</Text>
                )}
              </View>

              {/* Attendee list */}
              {attendees.length === 0 && (
                <Text style={styles.emptyText}>Nenhuma reserva ainda.</Text>
              )}
              {attendees.map((attendee) => {
                const isMe = appUser?.id === attendee.userId;
                const windowExpired = classData ? isCheckInWindowExpired(classData) : false;
                const isNoShow = attendee.status === 'NO_SHOW' || (windowExpired && attendee.status === 'BOOKED');
                return (
                  <View
                    key={attendee.id}
                    style={[styles.attendeeCard, isMe && styles.attendeeCardMe]}
                  >
                    {/* Left: avatar */}
                    <View style={[styles.attendeeAvatar, isMe && styles.attendeeAvatarMe]}>
                      <Icon name="person" size={24} color={isMe ? Colors.primary : Colors.textMuted} />
                      {isMe && (
                        <View style={styles.euBadge}>
                          <Text style={styles.euBadgeText}>EU</Text>
                        </View>
                      )}
                    </View>

                    {/* Middle: name + status */}
                    <View style={styles.attendeeInfo}>
                      <Text style={styles.attendeeName}>{attendee.displayName}</Text>
                      {attendee.status === 'CHECKED_IN' ? (
                        <View style={styles.attendeeStatusRow}>
                          <Icon name="check-circle" size={13} color={Colors.primary} />
                          <Text style={styles.attendeeCheckedInText}>
                            {isMe
                              ? `Check-in realizado às ${attendee.checkedInAt ?? '--'}`
                              : 'Check-in realizado'}
                          </Text>
                        </View>
                      ) : isNoShow ? (
                        <View style={styles.attendeeStatusRow}>
                          <Icon name="cancel" size={13} color={Colors.red[500]} />
                          <Text style={styles.attendeeNoShowText}>Não compareceu</Text>
                        </View>
                      ) : (
                        <Text style={styles.attendeePlanText}>
                          {attendee.plan ? `Aluno ${attendee.plan}` : 'Aluno'}
                        </Text>
                      )}
                    </View>

                    {/* Right: action */}
                    {appUser?.role === 'admin' ? (
                      attendee.status === 'CHECKED_IN' ? (
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
                          <Text style={styles.checkInButtonText}>Marcar</Text>
                        </TouchableOpacity>
                      )
                    ) : (
                      isMe && attendee.status === 'BOOKED' && !windowExpired ? (
                        <TouchableOpacity
                          style={styles.checkInButton}
                          onPress={() => handleStudentCheckIn(attendee)}
                        >
                          <Text style={styles.checkInButtonText}>Check-in</Text>
                        </TouchableOpacity>
                      ) : null
                    )}
                  </View>
                );
              })}

              <View style={{ height: 32 }} />
            </ScrollView>
          )}

        </>
      )}

      {/* Footer dinâmico */}
      {!loading && (
        <View style={styles.footer}>
          {activeTab === 'treino' ? (
            /* Botão de reserva — visível para todos na aba TREINO */
            reserving ? (
              <ActivityIndicator color={Colors.primary} />
            ) : myReservationId ? (
              <TouchableOpacity style={styles.cancelReserveButton} onPress={handleCancelMyReservation}>
                <Icon name="event-busy" size={20} color={Colors.red[500]} />
                <Text style={styles.cancelReserveButtonText}>CANCELAR AGENDAMENTO</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.reserveButton} onPress={handleReserve}>
                <Icon name="event-available" size={20} color={Colors.backgroundDark} />
                <Text style={styles.reserveButtonText}>RESERVAR AULA</Text>
              </TouchableOpacity>
            )
          ) : (
            /* Botões de admin — apenas na aba LISTA DE PRESENÇA */
            appUser?.role === 'admin' && (
              <View style={styles.adminButtonsContainer}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => router.push({ pathname: '/new-class', params: { id } })}
                >
                  <Icon name="edit" size={20} color={Colors.white} />
                  <Text style={styles.editButtonText}>EDITAR AULA</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDeleteClass}
                  disabled={deleting}
                >
                  {deleting ? (
                    <ActivityIndicator color={Colors.red[500]} />
                  ) : (
                    <>
                      <Icon name="delete-outline" size={20} color={Colors.red[500]} />
                      <Text style={styles.deleteButtonText}>EXCLUIR AULA</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )
          )}
        </View>
      )}

      {/* Action modal */}
      <Modal
        animationType="slide"
        transparent
        visible={isSheetOpen}
        onRequestClose={() => setSheetOpen(false)}
      >
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
              <Text style={[styles.modalButtonText, { color: Colors.red[500] }]}>
                Cancelar Reserva
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
  headerButton: {
    padding: 4,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardDark,
    paddingHorizontal: 24,
    gap: 32,
    backgroundColor: Colors.backgroundDark,
  },
  tabButton: {
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: Colors.primary,
  },
  tabButtonText: {
    color: Colors.textMuted,
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    letterSpacing: 0.3,
  },
  tabButtonTextActive: {
    color: Colors.primary,
    fontFamily: Fonts.sansBold,
  },

  // Scroll content
  scrollContent: {
    padding: 20,
    paddingBottom: 96,
  },

  // WOD tab
  wodHeader: {
    marginBottom: 24,
  },
  wodTitle: {
    color: Colors.white,
    fontSize: 26,
    fontFamily: Fonts.sansBold,
    marginBottom: 4,
  },
  wodDate: {
    color: Colors.primary,
    fontSize: 12,
    fontFamily: Fonts.sansBold,
    letterSpacing: 0.8,
  },

  // Session card
  sessionCard: {
    backgroundColor: Colors.cardDark,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sessionCardWod: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    borderColor: Colors.border,
  },
  sessionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sessionCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionCardTitle: {
    color: Colors.primary,
    fontFamily: Fonts.sansBold,
    fontSize: 13,
    letterSpacing: 0.8,
  },
  sessionBadge: {
    backgroundColor: Colors.cardDark,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  sessionBadgeText: {
    color: Colors.primary,
    fontFamily: Fonts.sansBold,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  sessionCardDetails: {
    color: Colors.textSecondary,
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    lineHeight: 22,
  },
  sessionCardDetailsWod: {
    textAlign: 'center',
    color: Colors.textSecondary,
  },

  // Presence tab
  presenceHeader: {
    marginBottom: 20,
  },
  presenceCount: {
    color: Colors.white,
    fontSize: 22,
    fontFamily: Fonts.sansBold,
  },
  presenceFull: {
    color: Colors.textMuted,
    fontSize: 13,
    fontFamily: Fonts.sansMedium,
    marginTop: 2,
  },

  // Attendee card
  attendeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: 10,
  },
  attendeeCardMe: {
    backgroundColor: 'rgba(232, 184, 67, 0.08)',
    borderColor: 'rgba(232, 184, 67, 0.3)',
  },
  attendeeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceDark,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  attendeeAvatarMe: {
    borderColor: 'rgba(232, 184, 67, 0.5)',
  },
  euBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Colors.primary,
    borderRadius: 99,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  euBadgeText: {
    color: Colors.backgroundDark,
    fontFamily: Fonts.sansBold,
    fontSize: 9,
  },
  attendeeInfo: {
    flex: 1,
  },
  attendeeName: {
    color: Colors.white,
    fontFamily: Fonts.sansBold,
    fontSize: 14,
    marginBottom: 3,
  },
  attendeeStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  attendeeCheckedInText: {
    color: Colors.primary,
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
  },
  attendeePlanText: {
    color: Colors.textMuted,
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
  },
  attendeeNoShowText: {
    color: Colors.red[500],
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
  },
  moreButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  checkInButtonText: {
    color: Colors.backgroundDark,
    fontSize: 11,
    fontFamily: Fonts.sansBold,
    textTransform: 'uppercase',
  },

  // Empty state
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontFamily: Fonts.sansMedium,
    textAlign: 'center',
    marginTop: 24,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 12,
    backgroundColor: Colors.backgroundDark,
    borderTopWidth: 1,
    borderTopColor: Colors.cardDark,
  },
  reserveButton: {
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
  },
  reserveButtonText: {
    color: Colors.backgroundDark,
    fontFamily: Fonts.sansBold,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  cancelReserveButton: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.red[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  cancelReserveButtonText: {
    color: Colors.red[500],
    fontFamily: Fonts.sansBold,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  adminButtonsContainer: {
    gap: 10,
  },
  editButton: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  editButtonText: {
    color: Colors.white,
    fontFamily: Fonts.sansBold,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  deleteButton: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.red[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  deleteButtonText: {
    color: Colors.red[500],
    fontFamily: Fonts.sansBold,
    fontSize: 14,
    letterSpacing: 0.5,
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.backgroundDark,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  handle: {
    width: 48,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 32,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  modalButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Fonts.sansMedium,
    marginLeft: 16,
  },
});

export default ClassDetailScreen;
