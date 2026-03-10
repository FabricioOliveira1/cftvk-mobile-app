import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Icon from '../components/Icon';
import { useAuth } from '../src/context';
import { createMember, deleteMember, updateMember } from '../src/services';
import { db, functions } from '../src/services/firebase';
import { PLAN_CONFIG, PlanType, UserRole } from '../src/types';
import { Colors, Fonts } from '../theme';

const PERFIS: { label: string; value: UserRole }[] = [
  { label: 'Aluno', value: 'student' },
  { label: 'Coach', value: 'coach' },
];

const PLANS = Object.entries(PLAN_CONFIG).map(([key, cfg]) => ({
  value: key as PlanType,
  label: cfg.label,
  days: cfg.days,
}));

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const formatBirthDate = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

const EditMemberScreen: React.FC = () => {
  const router = useRouter();
  const { appUser } = useAuth();
  const isAdmin = appUser?.role === 'admin';
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [enrollmentActive, setEnrollmentActive] = useState(true);
  const [planType, setPlanType] = useState<PlanType | null>(null);
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [planModalVisible, setPlanModalVisible] = useState(false);
  const [tempPlanType, setTempPlanType] = useState<PlanType | null>(null);

  // Track originals to detect enrollment changes
  const origPlanType = useRef<PlanType | null>(null);
  const origEnrollmentActive = useRef(true);

  const screenTitle = isEditing ? 'Editar Aluno' : 'Novo Aluno';
  const displayId = isEditing && id ? `#${id.slice(-5)}` : '—';

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    getDoc(doc(db, 'users', id)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setName(data.name ?? '');
        setEmail(data.email ?? '');
        setRole(data.role ?? 'student');
        setPhone(data.phone ?? '');
        setBirthDate(data.birthDate ?? '');
        const loadedPlanType = (data.planType ?? null) as PlanType | null;
        const loadedEnrollmentActive = data.enrollmentActive ?? true;
        setPlanType(loadedPlanType);
        setEnrollmentActive(loadedEnrollmentActive);
        origPlanType.current = loadedPlanType;
        origEnrollmentActive.current = loadedEnrollmentActive;
      }
    }).finally(() => setLoading(false));
  }, [id]);

  const planLabel = planType ? PLAN_CONFIG[planType].label : 'Selecionar plano';

  const handleOpenPlanModal = () => {
    setTempPlanType(planType);
    setPlanModalVisible(true);
  };

  const handleConfirmPlan = () => {
    if (tempPlanType) setPlanType(tempPlanType);
    setPlanModalVisible(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Campos obrigatórios', 'O nome não pode estar vazio.');
      return;
    }

    if (isEditing) {
      if (!id) return;
      setSaving(true);
      try {
        // 1. Atualiza campos pessoais via client (campos sem restrição de matrícula)
        await updateMember(id, {
          name: name.trim(),
          ...(isAdmin && { role }),
          phone: phone.trim(),
          birthDate: birthDate.trim(),
        });

        // 2. Se matrícula ou plano mudaram, chamar CF admin-only
        const enrollmentChanged = enrollmentActive !== origEnrollmentActive.current;
        const planChanged = planType !== origPlanType.current;

        if (isAdmin && (enrollmentChanged || planChanged)) {
          await httpsCallable(functions, 'updateMemberEnrollment')({
            uid: id,
            planType: planType ?? undefined,
            enrollmentActive,
          });
        }

        router.back();
      } catch {
        Alert.alert('Erro', 'Não foi possível salvar as alterações.');
      } finally {
        setSaving(false);
      }
      return;
    }

    if (!email.trim()) {
      Alert.alert('Campos obrigatórios', 'Informe o e-mail.');
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert('Campos obrigatórios', 'A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    setSaving(true);
    try {
      await createMember(name.trim(), email.trim(), role, password, planType ?? undefined, enrollmentActive);
      router.back();
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'code' in e
        ? (e as { code: string }).code === 'auth/email-already-in-use'
          ? 'Este e-mail já está cadastrado.'
          : 'Não foi possível criar o aluno.'
        : 'Não foi possível criar o aluno.';
      Alert.alert('Erro', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = () => {
    if (!isEditing || !id) return;
    Alert.alert(
      'Remover Aluno',
      'Tem certeza que deseja remover este aluno da base?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          style: 'destructive',
          onPress: async () => {
            setRemoving(true);
            try {
              await deleteMember(id);
              router.replace('/(admin)/members');
            } catch {
              setRemoving(false);
              Alert.alert('Erro', 'Não foi possível remover o aluno.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerCancel}>
            <Icon name="close" size={22} color={Colors.primary} />
            <Text style={styles.headerCancelText}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{screenTitle}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerCancel} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Icon name="close" size={22} color={Colors.primary} />
          <Text style={styles.headerCancelText}>Cancelar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{screenTitle}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Avatar + ID */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarCircle} />
              <View style={styles.avatarCameraBadge}>
                <Icon name="camera-alt" size={18} color={Colors.backgroundDark} />
              </View>
            </View>
            <Text style={styles.idText}>ID: {displayId}</Text>
          </View>

          {/* DADOS PESSOAIS */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="person" size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>DADOS PESSOAIS</Text>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome Completo</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor={Colors.textMuted}
                  placeholder="Nome completo"
                />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputContainer, !isEditing && styles.inputBorderGold]}>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholderTextColor={Colors.textMuted}
                  placeholder="E-mail"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  editable={!isEditing}
                />
              </View>
            </View>
            {!isEditing && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Senha inicial</Text>
                <View style={[styles.inputContainer, styles.inputBorderGold]}>
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholderTextColor={Colors.textMuted}
                    placeholder="Mínimo 6 caracteres"
                    secureTextEntry
                  />
                </View>
              </View>
            )}
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.half]}>
                <Text style={styles.label}>Telefone</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={(v) => setPhone(formatPhone(v))}
                    placeholderTextColor={Colors.textMuted}
                    placeholder="(11) 98877-6655"
                    keyboardType="phone-pad"
                    maxLength={15}
                  />
                </View>
              </View>
              <View style={[styles.inputGroup, styles.half]}>
                <Text style={styles.label}>Data Nasc.</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={birthDate}
                    onChangeText={(v) => setBirthDate(formatBirthDate(v))}
                    placeholderTextColor={Colors.textMuted}
                    placeholder="DD/MM/AAAA"
                    keyboardType="numeric"
                    maxLength={10}
                  />
                  <Icon name="calendar-today" size={18} color={Colors.textMuted} style={styles.inputRightIcon} />
                </View>
              </View>
            </View>
          </View>

          {/* PERFIL DO USUÁRIO — apenas admin */}
          {isAdmin && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="verified" size={18} color={Colors.primary} />
                <Text style={styles.sectionTitle}>PERFIL DO USUÁRIO</Text>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tipo de Usuário</Text>
                <View style={styles.chipsRow}>
                  {PERFIS.map((perfil) => (
                    <TouchableOpacity
                      key={perfil.value}
                      style={[styles.chip, role === perfil.value && styles.chipActive]}
                      onPress={() => setRole(perfil.value)}
                    >
                      <Text style={[styles.chipText, role === perfil.value && styles.chipTextActive]}>
                        {perfil.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Plano</Text>
                <TouchableOpacity style={styles.inputContainer} onPress={handleOpenPlanModal}>
                  <Text style={[styles.planText, !planType && styles.planTextMuted]}>{planLabel}</Text>
                  <Icon name="expand-more" size={22} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
              <View style={styles.statusCard}>
                <View>
                  <Text style={styles.statusTitle}>Status da Matrícula</Text>
                  <Text style={[styles.statusSubtitle, !enrollmentActive && styles.statusSubtitleInactive]}>
                    {enrollmentActive ? 'ATIVO PARA TREINAR' : 'MATRÍCULA INATIVA'}
                  </Text>
                </View>
                <Switch
                  value={enrollmentActive}
                  onValueChange={setEnrollmentActive}
                  trackColor={{ false: Colors.surfaceDark, true: Colors.primary }}
                  thumbColor={Colors.white}
                />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer buttons */}
        <View style={styles.footer}>
          {isEditing && isAdmin && (
            <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
              <Icon name="delete" size={20} color={Colors.red[500]} />
              <Text style={styles.removeButtonText}>Remover Aluno da Base</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
            <Icon name="save" size={20} color={Colors.backgroundDark} />
            <Text style={styles.saveButtonText}>{saving ? 'Salvando...' : 'Salvar Alterações'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Plan selection modal */}
      <Modal visible={planModalVisible} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setPlanModalVisible(false)}>
          <Pressable style={styles.planModalBox}>
            <Text style={styles.planModalTitle}>Selecionar Plano</Text>
            {PLANS.map((plan) => (
              <TouchableOpacity
                key={plan.value}
                style={[styles.planOption, tempPlanType === plan.value && styles.planOptionActive]}
                onPress={() => setTempPlanType(plan.value)}
              >
                <View style={styles.planOptionLeft}>
                  <View style={[styles.planRadio, tempPlanType === plan.value && styles.planRadioActive]}>
                    {tempPlanType === plan.value && <View style={styles.planRadioDot} />}
                  </View>
                  <Text style={styles.planOptionLabel}>{plan.label}</Text>
                </View>
                <Text style={styles.planOptionDays}>{plan.days} dias</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.planConfirmButton, !tempPlanType && styles.planConfirmButtonDisabled]}
              onPress={handleConfirmPlan}
              disabled={!tempPlanType}
            >
              <Text style={styles.planConfirmButtonText}>CONFIRMAR</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Removing overlay */}
      <Modal visible={removing} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Removendo aluno...</Text>
          </View>
        </View>
      </Modal>
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
  },
  headerCancel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerCancelText: { color: Colors.primary, fontFamily: Fonts.sansBold, fontSize: 15 },
  headerTitle: { color: Colors.white, fontFamily: Fonts.sansBold, fontSize: 18 },
  headerSpacer: { width: 100 },
  scrollContent: { padding: 24, paddingBottom: 160 },
  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatarWrapper: { position: 'relative' },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surfaceDark,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  avatarCameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idText: { color: Colors.white, fontFamily: Fonts.sansMedium, fontSize: 14, marginTop: 10 },
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { color: Colors.white, fontFamily: Fonts.sansBold, fontSize: 12, letterSpacing: 0.5 },
  inputGroup: { marginBottom: 16 },
  label: { color: Colors.white, fontFamily: Fonts.sansMedium, fontSize: 14, marginBottom: 8 },
  inputContainer: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  planText: { flex: 1, color: Colors.white, fontFamily: Fonts.sansMedium, fontSize: 15 },
  planTextMuted: { color: Colors.textMuted },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardDark,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  statusTitle: { color: Colors.white, fontFamily: Fonts.sansBold, fontSize: 15 },
  statusSubtitle: { color: Colors.primary, fontFamily: Fonts.sansBold, fontSize: 11, letterSpacing: 0.5, marginTop: 3 },
  statusSubtitleInactive: { color: Colors.textMuted },
  inputBorderGold: { borderColor: Colors.primary },
  input: { flex: 1, color: Colors.white, fontFamily: Fonts.sansMedium, fontSize: 15, padding: 0 },
  inputRightIcon: { marginLeft: 8 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  chipsRow: { flexDirection: 'row', gap: 10 },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { color: Colors.white, fontFamily: Fonts.sansMedium, fontSize: 13 },
  chipTextActive: { color: Colors.backgroundDark, fontFamily: Fonts.sansBold },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, gap: 12, backgroundColor: Colors.backgroundDark, borderTopWidth: 1, borderTopColor: Colors.border },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    backgroundColor: Colors.cardDark,
    borderRadius: 12,
  },
  removeButtonText: { color: Colors.red[500], fontFamily: Fonts.sansBold, fontSize: 14 },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 16,
  },
  saveButtonText: { color: Colors.backgroundDark, fontFamily: Fonts.sansBold, fontSize: 16 },
  // Plan modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  planModalBox: {
    backgroundColor: Colors.cardDark,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    paddingBottom: 40,
    gap: 12,
  },
  planModalTitle: {
    color: Colors.white,
    fontFamily: Fonts.sansBold,
    fontSize: 17,
    marginBottom: 8,
  },
  planOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceDark,
  },
  planOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}18`,
  },
  planOptionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  planRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planRadioActive: { borderColor: Colors.primary },
  planRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  planOptionLabel: { color: Colors.white, fontFamily: Fonts.sansBold, fontSize: 15 },
  planOptionDays: { color: Colors.textMuted, fontFamily: Fonts.sansMedium, fontSize: 13 },
  planConfirmButton: {
    marginTop: 8,
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planConfirmButtonDisabled: { opacity: 0.4 },
  planConfirmButtonText: { color: Colors.backgroundDark, fontFamily: Fonts.sansBold, fontSize: 15, letterSpacing: 0.5 },
  // Removing overlay
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBox: {
    backgroundColor: Colors.cardDark,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: { color: Colors.white, fontFamily: Fonts.sansMedium, fontSize: 15 },
});

export default EditMemberScreen;
