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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import Icon from '../components/Icon';
import SessionEditorSheet from '../components/SessionEditorSheet';
import { useAuth } from '../src/context';
import { createClass, getCoaches, setWodForDate, updateClass } from '../src/services';
import { db } from '../src/services/firebase';
import { AppUser, Session } from '../src/types';
import { Colors, Fonts } from '../theme';

const PRESET_TIMES = ['06:00', '08:00', '09:00', '15:00', '18:00', '19:00', '20:00'];

const CLASS_TYPES = ['Crossfit'] as const;

const DAY_NAMES_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
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

// ── TypeButton ────────────────────────────────────────────────────────────────
const TypeButton: React.FC<{ title: string; isActive: boolean; onPress: () => void }> = ({ title, isActive, onPress }) => (
  <TouchableOpacity onPress={onPress} style={[styles.typeButton, isActive && styles.typeButtonActive]}>
    <Text style={[styles.typeButtonText, isActive && styles.typeButtonTextActive]}>{title}</Text>
  </TouchableOpacity>
);

// ── DatePickerModal ───────────────────────────────────────────────────────────
const DatePickerModal: React.FC<{
  visible: boolean;
  selectedDate: Date;
  onSelect: (d: Date) => void;
  onClose: () => void;
}> = ({ visible, selectedDate, onSelect, onClose }) => {
  const [tempDate, setTempDate] = useState<Date>(selectedDate);
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    if (visible) setTempDate(selectedDate);
  }, [selectedDate, visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <View
          style={[styles.pickerSheet, { paddingBottom: Math.max(insets.bottom, 24) }]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.handle} />
          <Text style={styles.pickerTitle}>Selecionar Data</Text>
          <DateTimePicker
            value={tempDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'spinner'}
            onChange={(_e, d) => { if (d) setTempDate(d); }}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 12 }}>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: Colors.textMuted, fontFamily: Fonts.sansMedium, fontSize: 15 }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { onSelect(tempDate); onClose(); }}>
              <Text style={{ color: Colors.primary, fontFamily: Fonts.sansBold, fontSize: 15 }}>Selecionar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

// ── CoachPickerModal ──────────────────────────────────────────────────────────
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
                  <Text style={[styles.pickerOptionTitle, isSelected && styles.pickerOptionTextActive]}>{c.name}</Text>
                  <Text style={[styles.pickerOptionSub, isSelected && styles.pickerOptionTextActive]}>Coach</Text>
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

// ── Main Screen ───────────────────────────────────────────────────────────────
const NewClassScreen: React.FC = () => {
  const router = useRouter();
  const { appUser } = useAuth();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  const [loadingClass, setLoadingClass] = useState(isEditing);
  const [classType, setClassType] = useState<typeof CLASS_TYPES[number]>(CLASS_TYPES[0]);
  const [date, setDate] = useState<Date>(todayMidnight);
  // Edit mode: single time (loaded from class). Create mode: all times selected by default.
  const [selectedTimes, setSelectedTimes] = useState<string[]>(isEditing ? [] : [...PRESET_TIMES]);
  const [coachName, setCoachName] = useState('');
  const [capacity, setCapacity] = useState('15');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [coaches, setCoaches] = useState<AppUser[]>([]);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCoachPicker, setShowCoachPicker] = useState(false);
  const [showWodModal, setShowWodModal] = useState(false);

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
          if (data.time) setSelectedTimes([data.time]);
          if (data.coach) setCoachName(data.coach);
          if (data.capacity) setCapacity(String(data.capacity));
        }
      })
      .finally(() => setLoadingClass(false));
  }, [id]);

  const allTimesSelected = selectedTimes.length === PRESET_TIMES.length;

  const toggleTime = (t: string) => {
    if (isEditing) {
      setSelectedTimes([t]);
    } else {
      setSelectedTimes((prev) =>
        prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
      );
    }
  };

  const toggleAll = () => {
    setSelectedTimes(allTimesSelected ? [] : [...PRESET_TIMES]);
  };

  const handlePublish = async () => {
    if (!appUser) return;
    if (selectedTimes.length === 0) {
      Alert.alert('Campos obrigatórios', 'Selecione pelo menos um horário.');
      return;
    }
    if (!coachName) {
      Alert.alert('Campos obrigatórios', 'Selecione um coach.');
      return;
    }
    setSaving(true);
    try {
      const dateISO = dateToISO(date);
      const basePayload = {
        title: classType,
        coach: coachName,
        date: dateISO,
        capacity: parseInt(capacity) || 15,
      };
      if (isEditing) {
        await updateClass(id, { ...basePayload, time: selectedTimes[0] });
      } else {
        await Promise.all(
          selectedTimes.map((time) => createClass(appUser.id, { ...basePayload, time }))
        );
        if (sessions.length > 0) {
          await setWodForDate(dateISO, sessions, appUser.id);
        }
      }
      router.back();
    } catch {
      Alert.alert('Erro', isEditing
        ? 'Não foi possível salvar as alterações.'
        : 'Não foi possível criar as aulas.'
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
        return Math.abs(dy) > 10 && Math.abs(dx) < 10;
      },
      onPanResponderRelease: (_evt, gestureState) => {
        if (!isNewClass) return;
        if (gestureState.dy > 40) router.back();
      },
    })
  ).current;

  const screenTitle = isEditing ? 'Editar Aula' : 'Nova Aula';
  const wodLabel = sessions.length > 0
    ? `Treino adicionado (${sessions.length} ${sessions.length === 1 ? 'sessão' : 'sessões'})`
    : 'Adicionar treino do dia';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
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
            <View style={styles.content}>
              {/* Tipo de Aula */}
              <View style={styles.section}>
                <Text style={styles.label}>Tipo de Aula</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {CLASS_TYPES.map((t) => (
                    <TypeButton key={t} title={t} isActive={classType === t} onPress={() => setClassType(t)} />
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

              {/* Horários */}
              <View style={styles.section}>
                <Text style={styles.label}>{isEditing ? 'Horário' : 'Horários'}</Text>
                <View style={styles.timeGrid}>
                  {!isEditing && (
                    <TouchableOpacity
                      style={[styles.timeChip, allTimesSelected && styles.timeChipActive]}
                      onPress={toggleAll}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.timeChipText, allTimesSelected && styles.timeChipTextActive]}>
                        Todos
                      </Text>
                    </TouchableOpacity>
                  )}
                  {PRESET_TIMES.map((t) => {
                    const isActive = selectedTimes.includes(t);
                    return (
                      <TouchableOpacity
                        key={t}
                        style={[styles.timeChip, isActive && styles.timeChipActive]}
                        onPress={() => toggleTime(t)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.timeChipText, isActive && styles.timeChipTextActive]}>{t}</Text>
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

              {/* Treino do Dia — somente no modo criação */}
              {!isEditing && (
                <View style={styles.section}>
                  <Text style={styles.label}>Treino do Dia</Text>
                  <TouchableOpacity style={styles.selectorRow} onPress={() => setShowWodModal(true)}>
                    <Icon
                      name={sessions.length > 0 ? 'check-circle' : 'fitness-center'}
                      size={20}
                      color={sessions.length > 0 ? Colors.primary : Colors.textMuted}
                    />
                    <Text style={[styles.selectorText, sessions.length === 0 && styles.selectorPlaceholder]}>
                      {wodLabel}
                    </Text>
                    <Icon
                      name={sessions.length > 0 ? 'edit' : 'add'}
                      size={22}
                      color={sessions.length > 0 ? Colors.primary : Colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              )}

              {/* Ações */}
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

      {/* Modal do Treino do Dia */}
      <Modal visible={showWodModal} animationType="slide" onRequestClose={() => setShowWodModal(false)}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => setShowWodModal(false)}
              style={styles.headerBack}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Icon name="arrow-back-ios-new" size={22} color={Colors.white} />
            </TouchableOpacity>
            <View style={styles.headerTitleWrapper}>
              <Text style={styles.headerTitle}>Treino do Dia</Text>
              <Text style={styles.wodModalDate}>{formatDateDisplay(date)}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowWodModal(false)}
              style={styles.headerDoneButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.headerDoneText}>CONCLUÍDO</Text>
            </TouchableOpacity>
          </View>
          <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView
              style={styles.flex}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.content}>
                <SessionEditorSheet sessions={sessions} onChange={setSessions} />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
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
  headerDoneButton: { minWidth: 80, alignItems: 'flex-end', justifyContent: 'center' },
  headerDoneText: { color: Colors.primary, fontFamily: Fonts.sansBold, fontSize: 13, letterSpacing: 0.3 },
  wodModalDate: { color: Colors.primary, fontFamily: Fonts.sansMedium, fontSize: 12, marginTop: 2 },
  // Form
  content: { padding: 24, gap: 0 },
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
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
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
  // Modals (date/coach pickers)
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
