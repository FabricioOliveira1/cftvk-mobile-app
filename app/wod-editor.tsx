import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
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
import { getWodByDate, setWodForDate } from '../src/services';
import { Session } from '../src/types';
import { Colors, Fonts } from '../theme';

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function formatDateDisplay(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${DAY_NAMES[date.getDay()]}, ${d} ${MONTH_NAMES[m - 1]} ${y}`;
}

const DEFAULT_SESSIONS: Session[] = [
  { id: '1', title: 'Aquecimento', details: '' },
  { id: '2', title: 'WOD', details: '' },
];

const WodEditorScreen: React.FC = () => {
  const router = useRouter();
  const { appUser } = useAuth();
  const { date } = useLocalSearchParams<{ date: string }>();

  const [sessions, setSessions] = useState<Session[]>(DEFAULT_SESSIONS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!date) { setLoading(false); return; }
    getWodByDate(date).then((wod) => {
      if (wod && wod.sessions.length > 0) setSessions(wod.sessions);
    }).finally(() => setLoading(false));
  }, [date]);

  const addSession = () => {
    setSessions((prev) => [
      ...prev,
      { id: Date.now().toString(), title: 'Nova Sessão', details: '' },
    ]);
  };

  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const updateTitle = (id: string, title: string) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, title } : s)));
  };

  const updateDetails = (id: string, details: string) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, details } : s)));
  };

  const handleSave = async () => {
    if (!appUser || !date) return;
    const filled = sessions.filter((s) => s.title.trim() || s.details.trim());
    if (filled.length === 0) {
      Alert.alert('WOD vazio', 'Adicione pelo menos uma sessão com conteúdo.');
      return;
    }
    setSaving(true);
    try {
      await setWodForDate(date, sessions, appUser.id);
      router.back();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o WOD.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Icon name="arrow-back-ios-new" size={22} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>WOD do Dia</Text>
          {date ? <Text style={styles.headerDate}>{formatDateDisplay(date)}</Text> : null}
        </View>
        <View style={styles.headerBack} />
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {sessions.map((session) => (
              <View key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <View style={styles.sessionTitleRow}>
                    <Icon name="drag-indicator" size={24} color={Colors.textMuted} />
                    <TextInput
                      style={styles.sessionTitleInput}
                      value={session.title}
                      onChangeText={(t) => updateTitle(session.id, t)}
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
                  onChangeText={(t) => updateDetails(session.id, t)}
                  placeholder="Descreva os exercícios..."
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            ))}

            <TouchableOpacity style={styles.addSessionButton} onPress={addSession}>
              <Icon name="add-circle" size={22} color={Colors.primary} />
              <Text style={styles.addSessionButtonText}>Adicionar Nova Sessão</Text>
            </TouchableOpacity>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                <Text style={styles.cancelButtonText}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
                {saving ? (
                  <ActivityIndicator color={Colors.backgroundDark} />
                ) : (
                  <Text style={styles.saveButtonText}>SALVAR WOD</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.backgroundDark },
  flex: { flex: 1 },
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
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: Colors.white, fontFamily: Fonts.sansBold, fontSize: 18 },
  headerDate: { color: Colors.primary, fontFamily: Fonts.sansMedium, fontSize: 12, marginTop: 2 },
  scrollContent: { padding: 24, paddingBottom: 80 },
  sessionCard: {
    backgroundColor: Colors.cardDark,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    marginBottom: 16,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sessionTitleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
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
    marginBottom: 28,
  },
  addSessionButtonText: { color: Colors.primary, fontFamily: Fonts.sansBold, marginLeft: 8 },
  actions: { flexDirection: 'row', gap: 12 },
  cancelButton: {
    flex: 1,
    height: 56,
    backgroundColor: Colors.surfaceDark,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: { color: Colors.white, fontFamily: Fonts.sansBold },
  saveButton: {
    flex: 1.5,
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: { color: Colors.black, fontFamily: Fonts.sansBold },
});

export default WodEditorScreen;
