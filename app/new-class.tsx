import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Icon from '../components/Icon';
import { useAuth } from '../src/context';
import { createClass, getCoaches, updateClass } from '../src/services';
import { db } from '../src/services/firebase';
import { AppUser, Session } from '../src/types';
import { Colors, Fonts } from '../theme';

const PRESET_TIMES = ['06:00', '08:00', '09:00', '15:00', '18:00', '19:00', '20:00'];

// Estrutura de modalidades — adicione novas opções aqui quando necessário
const CLASS_TYPES = ['Crossfit'] as const;

const DAY_NAMES_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DAY_NAMES_FULL = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function formatDateDisplay(d: Date): string {
  return `${DAY_NAMES_SHORT[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function dateToISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isoToDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// ── Type Button ────────────────────────────────────────────────────────────────
const TypeButton: React.FC<{ title: string; isActive: boolean; onPress: () => void }> = ({ title, isActive, onPress }) => (
  <TouchableOpacity onPress={onPress} style={[styles.typeButton, isActive && styles.typeButtonActive]}>
    <Text style={[styles.typeButtonText, isActive && styles.typeButtonTextActive]}>{title}</Text>
  </TouchableOpacity>
);

// ── Tab Button ─────────────────────────────────────────────────────────────────
const TabButton: React.FC<{ title: string; isActive: boolean; onPress: () => void }> = ({ title, isActive, onPress }) => (
  <TouchableOpacity onPress={onPress} style={[styles.tabButton, isActive && styles.tabButtonActive]}>
    <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>{title}</Text>
  </TouchableOpacity>
);

// ── Sessões ────────────────────────────────────────────────────────────────────
interface SessoesProps {
  sessions: Session[];
  onUpdate: (sessions: Session[]) => void;
}

const Sessoes: React.FC<SessoesProps> = ({ sessions, onUpdate }) => {
  const addSession = () => {
    onUpdate([...sessions, { id: Date.now().toString(), title: 'Nova Sessão', details: '' }]);
  };

  const deleteSession = (id: string) => {
    onUpdate(sessions.filter((s) => s.id !== id));
  };

  const updateTitle = (id: string, title: string) => {
    onUpdate(sessions.map((s) => (s.id === id ? { ...s, title } : s)));
  };

  const updateDetails = (id: string, details: string) => {
    onUpdate(sessions.map((s) => (s.id === id ? { ...s, details } : s)));
  };

  return (
    <View style={styles.formContainer}>
      {sessions.map((session) => (
        <View key={session.id} style={styles.sessionCard}>
          <View style={styles.sessionHeader}>
            <View style={styles.sessionTitleContainer}>
              <Icon name="drag-indicator" size={24} color={Colors.textMuted} />
              <TextInput
                style={styles.sessionTitleInput}
                value={session.title}
                onChangeText={(text) => updateTitle(session.id, text)}
                placeholderTextColor={Colors.textMuted}
                placeholder="Título da sessão"
              />
            </View>
            <TouchableOpacity onPress={() => deleteSession(session.id)}>
              <Icon name="delete" size={22} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.sessionDetailsInput}
            multiline
            value={session.details}
            onChangeText={(text) => updateDetails(session.id, text)}
            placeholder="Descreva os exercícios..."
            placeholderTextColor={Colors.textMuted}
          />
        </View>
      ))}
      <TouchableOpacity style={styles.addSessionButton} onPress={addSession}>
        <Icon name="add-circle" size={22} color={Colors.primary} />
        <Text style={styles.addSessionButtonText}>Adicionar Nova Sessão</Text>
      </TouchableOpacity>
    </View>
  );
};

// ── Date Picker Modal ──────────────────────────────────────────────────────────
const DatePickerModal: React.FC<{
  visible: boolean;
  selectedDate: Date;
  onSelect: (d: Date) => void;
  onClose: () => void;
}> = ({ visible, selectedDate, onSelect, onClose }) => {
  const [tempDate, setTempDate] = useState<Date>(selectedDate);

  React.useEffect(() => {
    if (visible) {
      setTempDate(selectedDate);
    }
  }, [selectedDate, visible]);

  const handleChange = (_event: any, date?: Date) => {
    if (date) {
      setTempDate(date);
    }
  };

  const handleConfirm = () => {
    onSelect(tempDate);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <View style={styles.pickerSheet} onStartShouldSetResponder={() => true}>
          <View style={styles.handle} />
          <Text style={styles.pickerTitle}>Selecionar Data</Text>
          <DateTimePicker
            value={tempDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
            onChange={handleChange}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 12 }}>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: Colors.textMuted, fontFamily: Fonts.sansMedium, fontSize: 15 }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm}>
              <Text style={{ color: Colors.primary, fontFamily: Fonts.sansBold, fontSize: 15 }}>Selecionar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

// ── Coach Picker Modal ─────────────────────────────────────────────────────────
const CoachPickerModal: React.FC<{
  visible: boolean;
  coaches: AppUser[];
  selectedName: string;
  onSelect: (name: string) => void;
  onClose: () => void;
}> = ({ visible, coaches, selectedName, onSelect, onClose }) => (
  <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
    <Pressable style={styles.modalBackdrop} onPress={onClose}>
      <View style={styles.pickerSheet} onStartShouldSetResponder={() => true}>
        <View style={styles.handle} />
        <Text style={styles.pickerTitle}>Selecionar Coach</Text>
        {coaches.length === 0 ? (
          <Text style={styles.pickerEmpty}>Nenhum coach cadastrado.</Text>
        ) : (
          coaches.map((c) => {
            const isSelected = c.name === selectedName;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.pickerOption, isSelected && styles.pickerOptionActive]}
                onPress={() => { onSelect(c.name); onClose(); }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.pickerOptionTitle, isSelected && styles.pickerOptionTextActive]}>
                    {c.name}
                  </Text>
                  <Text style={[styles.pickerOptionSub, isSelected && styles.pickerOptionTextActive]}>
                    Coach
                  </Text>
                </View>
                {isSelected && <Icon name="check-circle" size={22} color={Colors.backgroundDark} />}
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </Pressable>
  </Modal>
);

// ── Screen ─────────────────────────────────────────────────────────────────────
const NewClassScreen: React.FC = () => {
  const router = useRouter();
  const { appUser } = useAuth();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  const [loadingClass, setLoadingClass] = useState(isEditing);
  const [activeTab, setActiveTab] = useState<'dados' | 'sessoes'>('dados');
  const [classType, setClassType] = useState<typeof CLASS_TYPES[number]>(CLASS_TYPES[0]);
  const [date, setDate] = useState<Date>(todayMidnight);
  const [selectedTime, setSelectedTime] = useState('');
  const [coachName, setCoachName] = useState('');
  const [capacity, setCapacity] = useState('15');
  const [coaches, setCoaches] = useState<AppUser[]>([]);
  const [sessions, setSessions] = useState<Session[]>([
    { id: '1', title: 'Aquecimento', details: '' },
    { id: '2', title: 'WOD', details: '' },
  ]);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCoachPicker, setShowCoachPicker] = useState(false);

  useEffect(() => {
    getCoaches().then(setCoaches);
  }, []);

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, 'classes', id))
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.title) setClassType(data.title as typeof CLASS_TYPES[number]);
          if (data.date) setDate(isoToDate(data.date));
          if (data.time) setSelectedTime(data.time);
          if (data.coach) setCoachName(data.coach);
          if (data.capacity) setCapacity(String(data.capacity));
          if (data.sessions) setSessions(data.sessions as Session[]);
        }
      })
      .finally(() => setLoadingClass(false));
  }, [id]);

  const handlePublish = async () => {
    if (!appUser) return;
    if (!selectedTime) {
      Alert.alert('Campos obrigatórios', 'Selecione um horário.');
      return;
    }
    if (!coachName) {
      Alert.alert('Campos obrigatórios', 'Selecione um coach.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: classType,
        coach: coachName,
        date: dateToISO(date),
        time: selectedTime,
        capacity: parseInt(capacity) || 15,
        sessions,
      };
      if (isEditing) {
        await updateClass(id, payload);
      } else {
        await createClass(appUser.id, payload);
      }
      router.back();
    } catch {
      Alert.alert('Erro', isEditing
        ? 'Não foi possível salvar as alterações.'
        : 'Não foi possível criar a aula.'
      );
    } finally {
      setSaving(false);
    }
  };

  const isNewClass = !isEditing;

  const titlePanResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gestureState) => {
        if (!isNewClass) return false;
        const { dx, dy } = gestureState;
        // Só começa o gesto se for um arrasto basicamente vertical
        return Math.abs(dy) > 10 && Math.abs(dx) < 10;
      },
      onPanResponderRelease: (_evt, gestureState) => {
        if (!isNewClass) return;
        // Se o usuário arrastou pra baixo o suficiente, fecha o modal
        if (gestureState.dy > 40) {
          router.back();
        }
      },
    })
  ).current;

  const screenTitle = isEditing ? 'Editar Aula' : 'Nova Aula';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header próprio: título condicional + botão voltar (sem Stack.Screen) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Icon name="arrow-back-ios-new" size={22} color={Colors.white} />
        </TouchableOpacity>
        <View
          style={styles.headerTitleWrapper}
          {...(isNewClass ? titlePanResponder.panHandlers : {})}
        >
          <Text style={styles.headerTitle}>{screenTitle}</Text>
        </View>
        <View style={styles.headerBack} />
      </View>

      {loadingClass ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
        >
          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TabButton
              title="Dados Principais"
              isActive={activeTab === 'dados'}
              onPress={() => setActiveTab('dados')}
            />
            <TabButton
              title="Sessões"
              isActive={activeTab === 'sessoes'}
              onPress={() => setActiveTab('sessoes')}
            />
          </View>

          {/* Content */}
          <View style={styles.content}>
              {activeTab === 'dados' ? (
                <>
                  {/* Tipo de Aula */}
                  <View style={styles.section}>
                    <Text style={styles.label}>Tipo de Aula</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {CLASS_TYPES.map((t) => (
                        <TypeButton
                          key={t}
                          title={t}
                          isActive={classType === t}
                          onPress={() => setClassType(t)}
                        />
                      ))}
                    </ScrollView>
                  </View>

                  {/* Data */}
                  <View style={styles.section}>
                    <Text style={styles.label}>Data</Text>
                    <TouchableOpacity style={styles.selectorRow} onPress={() => setShowDatePicker(true)}>
                      <Icon name="calendar-today" size={20} color={Colors.textMuted} />
                      <Text style={styles.selectorText}>{formatDateDisplay(date)}</Text>
                      <Icon name="expand-more" size={22} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>

                  {/* Horário — seleção guardada em selectedTime e enviada no formulário */}
                  <View style={styles.section}>
                    <Text style={styles.label}>Horário</Text>
                    <View style={styles.timeGrid}>
                      {PRESET_TIMES.map((t) => {
                        const isActive = selectedTime === t;
                        return (
                          <TouchableOpacity
                            key={t}
                            style={[styles.timeChip, isActive && styles.timeChipActive]}
                            onPress={() => setSelectedTime(t)}
                            activeOpacity={0.8}
                          >
                            <Text style={[styles.timeChipText, isActive && styles.timeChipTextActive]}>
                              {t}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Coach */}
                  <View style={styles.section}>
                    <Text style={styles.label}>Coach</Text>
                    <TouchableOpacity style={styles.selectorRow} onPress={() => setShowCoachPicker(true)}>
                      <Icon name="person" size={20} color={Colors.textMuted} />
                      <Text style={[styles.selectorText, !coachName && styles.selectorPlaceholder]}>
                        {coachName || 'Selecionar coach'}
                      </Text>
                      <Icon name="expand-more" size={22} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>

                  {/* Vagas */}
                  <View style={styles.section}>
                    <Text style={styles.label}>Vagas</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={capacity}
                        onChangeText={setCapacity}
                        placeholderTextColor={Colors.textMuted}
                      />
                    </View>
                  </View>
                </>
              ) : (
                <Sessoes sessions={sessions} onUpdate={setSessions} /> 
                
              )}

              {/* Botões — dentro do scroll, abaixo do conteúdo */}
              <View style={styles.actions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                  <Text style={styles.cancelButtonText}>CANCELAR</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.publishButton} onPress={handlePublish} disabled={saving}>
                  {saving ? (
                    <ActivityIndicator color={Colors.backgroundDark} />
                  ) : (
                    <Text style={styles.publishButtonText}>
                      {isEditing ? 'SALVAR ALTERAÇÕES' : 'PUBLICAR AULA'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
        </ScrollView>
        </KeyboardAvoidingView>
      )}

      <DatePickerModal
        visible={showDatePicker}
        selectedDate={date}
        onSelect={setDate}
        onClose={() => setShowDatePicker(false)}
      />
      <CoachPickerModal
        visible={showCoachPicker}
        coaches={coaches}
        selectedName={coachName}
        onSelect={setCoachName}
        onClose={() => setShowCoachPicker(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.backgroundDark },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 80 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardDark,
    backgroundColor: Colors.backgroundDark,
  },
  headerBack: { width: 40, alignItems: 'flex-start' },
  headerTitleWrapper: { flex: 1, alignItems: 'center' },
  headerTitle: { color: Colors.white, fontFamily: Fonts.sansBold, fontSize: 18 },
  // Tabs
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardDark,
    gap: 32,
  },
  tabButton: { paddingVertical: 16, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabButtonActive: { borderBottomColor: Colors.primary },
  tabButtonText: { color: Colors.textMuted, fontFamily: Fonts.sansMedium, fontSize: 14 },
  tabButtonTextActive: { color: Colors.primary },
  // Form
  content: { padding: 24, gap: 0 },
  formContainer: { gap: 24, },
  section: { marginBottom: 28 },
  label: {
    color: Colors.slate[400],
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceDark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 56,
    paddingHorizontal: 16,
    gap: 12,
  },
  selectorText: { flex: 1, color: Colors.white, fontFamily: Fonts.sansMedium, fontSize: 15 },
  selectorPlaceholder: { color: Colors.textMuted },
  typeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 99,
    backgroundColor: Colors.surfaceDark,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  typeButtonActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeButtonText: { color: Colors.white, fontFamily: Fonts.sansBold, fontSize: 14 },
  typeButtonTextActive: { color: Colors.backgroundDark },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeChip: {
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: Colors.surfaceDark,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  timeChipText: { color: Colors.white, fontFamily: Fonts.sansBold, fontSize: 15 },
  timeChipTextActive: { color: Colors.backgroundDark, fontFamily: Fonts.sansBold },
  inputContainer: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 56,
  },
  input: { flex: 1, paddingHorizontal: 16, color: Colors.white, fontFamily: Fonts.sansMedium, height: '100%' },
  // Sessões
  sessionCard: {
    backgroundColor: Colors.cardDark,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  sessionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sessionTitleContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  sessionTitleInput: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: Fonts.sansBold,
    flex: 1,
    marginLeft: 8,
    padding: 0,
  },
  sessionDetailsInput: {
    backgroundColor: Colors.backgroundDark,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 16,
    minHeight: 100,
    color: Colors.textMuted,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  addSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    borderRadius: 12,
    marginTop: 16,
  },
  addSessionButtonText: { color: Colors.primary, fontFamily: Fonts.sansBold, marginLeft: 8 },
  // Botões de ação — dentro do scroll
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    height: 56,
    backgroundColor: Colors.surfaceDark,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: { color: Colors.white, fontFamily: Fonts.sansBold },
  publishButton: {
    flex: 1.5,
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishButtonText: { color: Colors.black, fontFamily: Fonts.sansBold },
  // Modals
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  pickerSheet: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: Colors.border,
    maxHeight: '75%',
  },
  handle: {
    width: 48,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  pickerTitle: { color: Colors.white, fontFamily: Fonts.sansBold, fontSize: 18, marginBottom: 16 },
  pickerEmpty: { color: Colors.textMuted, fontFamily: Fonts.sansMedium, fontSize: 14, textAlign: 'center', marginTop: 20 },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  pickerOptionActive: { backgroundColor: Colors.primary },
  pickerOptionTitle: { color: Colors.white, fontFamily: Fonts.sansBold, fontSize: 15 },
  pickerOptionSub: { color: Colors.slate[400], fontFamily: Fonts.sansMedium, fontSize: 13, marginTop: 2 },
  pickerOptionTextActive: { color: Colors.backgroundDark },
});

export default NewClassScreen;
