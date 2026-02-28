import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from '../components/Icon';
import { useAuth } from '../src/context';
import { createPR, deletePR, getUserPRs, updatePR } from '../src/services';
import { PR, PRUnit } from '../src/types';
import { Colors, Fonts } from '../theme';

// ── Movement list (alphabetical) ─────────────────────────────────────────────

const MOVEMENTS = [
  'Air Squat',
  'American Kettlebell Swing',
  'Assault Bike',
  'Back Extension',
  'Back Squat',
  'Ball Slam',
  'Bar Muscle-Up',
  'Bear Complex',
  'Bear Crawl',
  'Bench Press',
  'Box Jump',
  'Box Jump Over',
  'Box Step-Up',
  'Broad Jump',
  'Bulgarian Split Squat',
  'Burpee',
  'Burpee Box Jump Over',
  'Burpee Pull-Up',
  'Chest-to-Bar Pull-Up',
  'Clean',
  'Clean & Jerk',
  'Deadlift',
  'Deficit Deadlift',
  'Deficit Handstand Push-Up',
  'Double Under',
  'Dumbbell Clean',
  'Dumbbell Front Rack Lunge',
  'Dumbbell Overhead Squat',
  'Dumbbell Push Press',
  'Dumbbell Romanian Deadlift',
  'Dumbbell Snatch',
  'Dumbbell Sumo Deadlift High Pull',
  'Dumbbell Thruster',
  'Farmer Carry',
  'Floor Press',
  'Front Rack Lunge',
  'Front Squat',
  'GHD Sit-Up',
  'Goblet Squat',
  'Good Morning',
  'Hang Clean',
  'Hang Power Clean',
  'Hang Power Snatch',
  'Hang Snatch',
  'Handstand Push-Up',
  'Handstand Walk',
  'Hip Extension',
  'Hip Thrust',
  'Jump Rope',
  'Jumping Jack',
  'Jumping Lunge',
  'Kettlebell Clean',
  'Kettlebell Front Squat',
  'Kettlebell Overhead Press',
  'Kettlebell Romanian Deadlift',
  'Kettlebell Snatch',
  'Kettlebell Swing',
  'Kettlebell Turkish Get-Up',
  'Knees-to-Elbows',
  'L-Sit',
  'Lateral Box Jump',
  'Legless Rope Climb',
  'Low Bar Back Squat',
  'Lunge',
  'Medicine Ball Clean',
  'Medicine Ball Sit-Up',
  'Medicine Ball Slam',
  'Medicine Ball Thruster',
  'Muscle Snatch',
  'Muscle-Up (Bar)',
  'Muscle-Up (Ring)',
  'Overhead Squat',
  'Overhead Walking Lunge',
  'Pistol Squat',
  'Power Clean',
  'Power Jerk',
  'Power Snatch',
  'Pull-Up',
  'Push Jerk',
  'Push Press',
  'Push-Up',
  'Renegade Row',
  'Ring Dip',
  'Ring Muscle-Up',
  'Ring Pull-Up',
  'Ring Row',
  'Rope Climb',
  'Romanian Deadlift',
  'Row (Ergômetro)',
  'Run 400m',
  'Run 800m',
  'Run 1km',
  'Russian Kettlebell Swing',
  'Sandbag Clean',
  'Seated Box Jump',
  'Shuttle Run',
  'Single-Leg Deadlift',
  'Single-Under',
  'Sit-Up',
  'Ski Erg',
  'Snatch',
  'Snatch Pull',
  'Split Jerk',
  'Sprint 100m',
  'Sprint 200m',
  'Squat Clean',
  'Squat Snatch',
  'Stiff-Legged Deadlift',
  'Strict Handstand Push-Up',
  'Strict Press',
  'Strict Pull-Up',
  'Sumo Deadlift High Pull',
  'T2B (Toes-to-Bar)',
  'Thruster',
  'Turkish Get-Up',
  'V-Up',
  'Wall Ball Shot',
  'Wall Walk',
  'Weighted Pull-Up',
  'Weighted Ring Dip',
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const UNITS: PRUnit[] = ['kg', 'reps', 'min'];

function formatDate(ts: any): string {
  try {
    const date = ts?.toDate ? ts.toDate() : new Date();
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  } catch {
    return '--/--/----';
  }
}

// ── Screen ───────────────────────────────────────────────────────────────────

const PRsScreen: React.FC = () => {
  const router = useRouter();
  const { appUser } = useAuth();

  const [prs, setPrs] = useState<PR[]>([]);
  const [loading, setLoading] = useState(true);

  // New PR form
  const [formOpen, setFormOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState<PRUnit>('kg');
  const [saving, setSaving] = useState(false);

  // Movement picker modal
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [movementSearch, setMovementSearch] = useState('');

  // Edit PR modal
  const [editingPR, setEditingPR] = useState<PR | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editUnit, setEditUnit] = useState<PRUnit>('kg');
  const [editSaving, setEditSaving] = useState(false);

  const load = useCallback(async () => {
    if (!appUser) return;
    setLoading(true);
    try {
      const data = await getUserPRs(appUser.id);
      setPrs(data);
    } finally {
      setLoading(false);
    }
  }, [appUser?.id]);

  useEffect(() => { load(); }, [load]);

  const filteredMovements = MOVEMENTS.filter((m) =>
    m.toLowerCase().includes(movementSearch.toLowerCase())
  );

  const cycleUnit = () => setUnit((u) => UNITS[(UNITS.indexOf(u) + 1) % UNITS.length]);
  const cycleEditUnit = () => setEditUnit((u) => UNITS[(UNITS.indexOf(u) + 1) % UNITS.length]);

  const handleSave = async () => {
    if (!appUser || !selectedMovement || !value.trim()) return;
    setSaving(true);
    try {
      const id = await createPR(appUser.id, selectedMovement, value.trim(), unit);
      const newPR: PR = {
        id,
        userId: appUser.id,
        movement: selectedMovement,
        value: value.trim(),
        unit,
        createdAt: { toDate: () => new Date() } as any,
      };
      setPrs((prev) => [newPR, ...prev]);
      setFormOpen(false);
      setSelectedMovement('');
      setValue('');
      setUnit('kg');
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o recorde.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSave = async () => {
    if (!editingPR || !editValue.trim()) return;
    setEditSaving(true);
    try {
      await updatePR(editingPR.id, editValue.trim(), editUnit);
      setPrs((prev) =>
        prev.map((p) =>
          p.id === editingPR.id ? { ...p, value: editValue.trim(), unit: editUnit } : p
        )
      );
      setEditingPR(null);
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar o recorde.');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeletePR = async () => {
    if (!editingPR) return;
    try {
      await deletePR(editingPR.id);
      setPrs((prev) => prev.filter((p) => p.id !== editingPR.id));
      setEditingPR(null);
    } catch {
      Alert.alert('Erro', 'Não foi possível excluir o recorde.');
    }
  };

  const canSave = !!selectedMovement && !!value.trim();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: Colors.backgroundDark },
          headerTintColor: Colors.white,
          headerTitle: () => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: Colors.white, fontFamily: Fonts.sansBold, fontSize: 16 }}>
                Meus Recordes
              </Text>
              <Text style={{ color: Colors.primary, fontFamily: Fonts.sansBold, fontSize: 10, letterSpacing: 1.5 }}>
                CROSSFIT TVK
              </Text>
            </View>
          ),
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
              <Icon name="arrow-back-ios" size={22} color={Colors.white} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={{ paddingRight: 8 }}>
              <Icon name="emoji-events" size={26} color={Colors.primary} />
            </View>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* ── Novo Registro (collapsible card) ── */}
        <View style={[styles.newPRCard, formOpen && styles.newPRCardOpen]}>
          <TouchableOpacity
            style={styles.newPRButton}
            onPress={() => setFormOpen((o) => !o)}
            activeOpacity={0.85}
          >
            <View style={styles.newPRButtonLeft}>
              <Icon name="add" size={20} color={Colors.backgroundDark} />
              <Text style={styles.newPRButtonText}>Novo Registro</Text>
            </View>
            <Icon name={formOpen ? 'expand-less' : 'expand-more'} size={22} color={Colors.backgroundDark} />
          </TouchableOpacity>

          {formOpen && (
            <View style={styles.formFields}>
              {/* Movimento */}
              <TouchableOpacity
                style={styles.movementField}
                onPress={() => { setMovementSearch(''); setMovementModalOpen(true); }}
              >
                <Text style={selectedMovement ? styles.movementSelected : styles.movementPlaceholder}>
                  {selectedMovement || 'Selecionar movimento'}
                </Text>
                <Icon name="keyboard-arrow-down" size={22} color={Colors.textMuted} />
              </TouchableOpacity>

              {/* Valor + Unidade */}
              <View style={styles.valueRow}>
                <TextInput
                  style={styles.valueInput}
                  value={value}
                  onChangeText={setValue}
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="decimal-pad"
                />
                <TouchableOpacity style={styles.unitToggle} onPress={cycleUnit}>
                  <Text style={styles.unitText}>{unit}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={!canSave || saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={Colors.backgroundDark} />
                ) : (
                  <Text style={styles.saveButtonText}>SALVAR RECORDE</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── Histórico de Conquistas ── */}
        <Text style={styles.sectionTitle}>Histórico de Conquistas</Text>

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 32 }} />
        ) : prs.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="emoji-events" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Nenhum recorde registrado</Text>
            <Text style={styles.emptySubtitle}>Adicione seu primeiro PR acima!</Text>
          </View>
        ) : (
          prs.map((pr) => (
            <View key={pr.id} style={styles.prItem}>
              <View style={styles.prAccent} />
              <View style={styles.prIconWrap}>
                <Icon name="fitness-center" size={20} color={Colors.primary} />
              </View>
              <View style={styles.prInfo}>
                <Text style={styles.prMovement}>{pr.movement}</Text>
                <Text style={styles.prDate}>{formatDate(pr.createdAt)}</Text>
              </View>
              <View style={styles.prRight}>
                <Text style={styles.prValue}>{pr.value} {pr.unit}</Text>
                <TouchableOpacity
                  onPress={() => { setEditingPR(pr); setEditValue(pr.value); setEditUnit(pr.unit); }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={{ marginTop: 6 }}
                >
                  <Icon name="edit" size={15} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* ── Movement Picker Modal ── */}
      <Modal
        visible={movementModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setMovementModalOpen(false)}
      >
        <View style={styles.modalContainer}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setMovementModalOpen(false)} />
          <View style={styles.movementSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Selecionar Movimento</Text>
            <TextInput
              style={styles.searchInput}
              value={movementSearch}
              onChangeText={setMovementSearch}
              placeholder="Pesquisar..."
              placeholderTextColor={Colors.textMuted}
              autoFocus
            />
            <FlatList
              data={filteredMovements}
              keyExtractor={(item) => item}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.movementItem}
                  onPress={() => { setSelectedMovement(item); setMovementModalOpen(false); }}
                >
                  <Text style={[styles.movementItemText, item === selectedMovement && styles.movementItemActive]}>
                    {item}
                  </Text>
                  {item === selectedMovement && (
                    <Icon name="check" size={18} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </View>
      </Modal>

      {/* ── Edit PR Modal ── */}
      {editingPR && (
        <Modal
          visible
          animationType="fade"
          transparent
          onRequestClose={() => setEditingPR(null)}
        >
          <View style={styles.editModalContainer}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setEditingPR(null)} />
            <View style={styles.editModalCard}>
              <Text style={styles.editModalTitle}>Editar Recorde</Text>
              <Text style={styles.editModalMovement}>{editingPR.movement}</Text>

              <View style={styles.valueRow}>
                <TextInput
                  style={styles.valueInput}
                  value={editValue}
                  onChangeText={setEditValue}
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="decimal-pad"
                  autoFocus
                />
                <TouchableOpacity style={styles.unitToggle} onPress={cycleEditUnit}>
                  <Text style={styles.unitText}>{editUnit}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.editActions}>
                <TouchableOpacity style={styles.editDeleteButton} onPress={handleDeletePR}>
                  <Text style={styles.editDeleteText}>Excluir</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, { flex: 1, marginTop: 0 }, !editValue.trim() && styles.saveButtonDisabled]}
                  onPress={handleEditSave}
                  disabled={!editValue.trim() || editSaving}
                >
                  {editSaving ? (
                    <ActivityIndicator size="small" color={Colors.backgroundDark} />
                  ) : (
                    <Text style={styles.saveButtonText}>SALVAR</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.backgroundDark },
  container: { padding: 24, paddingBottom: 100 },

  // ── Novo Registro card ──
  newPRCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  newPRCardOpen: {
    borderColor: Colors.primary,
  },
  newPRButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  newPRButtonLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  newPRButtonText: {
    color: Colors.backgroundDark,
    fontFamily: Fonts.sansBold,
    fontSize: 15,
  },

  // ── Form fields ──
  formFields: {
    backgroundColor: Colors.cardDark,
    padding: 20,
    gap: 16,
  },
  movementField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  movementSelected: {
    color: Colors.white,
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    flex: 1,
  },
  movementPlaceholder: {
    color: Colors.textMuted,
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    flex: 1,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  valueInput: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
    borderRadius: 12,
    padding: 14,
    color: Colors.white,
    fontFamily: Fonts.sansBold,
    fontSize: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    textAlign: 'center',
  },
  unitToggle: {
    backgroundColor: Colors.backgroundDark,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.primary,
    minWidth: 72,
    alignItems: 'center',
  },
  unitText: {
    color: Colors.primary,
    fontFamily: Fonts.sansBold,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  saveButtonDisabled: { opacity: 0.4 },
  saveButtonText: {
    color: Colors.backgroundDark,
    fontFamily: Fonts.sansBold,
    fontSize: 13,
    letterSpacing: 0.5,
  },

  // ── Section ──
  sectionTitle: {
    color: Colors.white,
    fontFamily: Fonts.sansBold,
    fontSize: 18,
    marginBottom: 16,
  },

  // ── PR Item ──
  prItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardDark,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    overflow: 'hidden',
  },
  prAccent: {
    width: 4,
    alignSelf: 'stretch',
    backgroundColor: Colors.primary,
  },
  prIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(232,184,67,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 14,
    marginRight: 12,
    flexShrink: 0,
  },
  prInfo: { flex: 1, paddingVertical: 16 },
  prMovement: {
    color: Colors.white,
    fontFamily: Fonts.sansBold,
    fontSize: 14,
  },
  prDate: {
    color: Colors.textMuted,
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    marginTop: 2,
  },
  prRight: {
    alignItems: 'flex-end',
    paddingRight: 16,
    paddingVertical: 16,
  },
  prValue: {
    color: Colors.primary,
    fontFamily: Fonts.sansBold,
    fontSize: 16,
  },

  // ── Empty State ──
  emptyState: {
    alignItems: 'center',
    paddingTop: 48,
    gap: 8,
  },
  emptyTitle: {
    color: Colors.textMuted,
    fontFamily: Fonts.sansBold,
    fontSize: 16,
    marginTop: 8,
  },
  emptySubtitle: {
    color: Colors.textMuted,
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
  },

  // ── Movement Modal ──
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  movementSheet: {
    backgroundColor: Colors.cardDark,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    color: Colors.white,
    fontFamily: Fonts.sansBold,
    fontSize: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: Colors.backgroundDark,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: Colors.white,
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    marginHorizontal: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  movementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  movementItemText: {
    color: Colors.white,
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
  },
  movementItemActive: {
    color: Colors.primary,
    fontFamily: Fonts.sansBold,
  },
  separator: { height: 1, backgroundColor: Colors.border },

  // ── Edit Modal ──
  editModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 24,
  },
  editModalCard: {
    backgroundColor: Colors.cardDark,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 16,
  },
  editModalTitle: {
    color: Colors.white,
    fontFamily: Fonts.sansBold,
    fontSize: 18,
  },
  editModalMovement: {
    color: Colors.textMuted,
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    marginTop: -8,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  editDeleteButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.red[500],
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  editDeleteText: {
    color: Colors.red[500],
    fontFamily: Fonts.sansBold,
    fontSize: 13,
  },
});

export default PRsScreen;
