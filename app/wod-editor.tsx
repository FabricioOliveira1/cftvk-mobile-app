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
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import SessionEditorSheet from '../components/SessionEditorSheet';
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
            <SessionEditorSheet sessions={sessions} onChange={setSessions} />

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
