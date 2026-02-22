import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
import { createMember, deleteMember, updateMember } from '../src/services';
import { db } from '../src/services/firebase';
import { UserRole } from '../src/types';
import { Colors, Fonts } from '../theme';

const PERFIS: { label: string; value: UserRole }[] = [
  { label: 'Aluno', value: 'student' },
  { label: 'Coach', value: 'coach' },
];

const EditMemberScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [enrollmentActive, setEnrollmentActive] = useState(true);
  const [plan, setPlan] = useState('Trimestral - VIP');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

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
      }
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Campos obrigatórios', 'O nome não pode estar vazio.');
      return;
    }
    if (isEditing) {
      if (!id) return;
      setSaving(true);
      try {
        await updateMember(id, { name: name.trim(), role });
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
      await createMember(name.trim(), email.trim(), role, password);
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
              router.replace('/(tabs)/members');
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
                    onChangeText={setPhone}
                    placeholderTextColor={Colors.textMuted}
                    placeholder="(11) 98877-6655"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
              <View style={[styles.inputGroup, styles.half]}>
                <Text style={styles.label}>Data Nasc.</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={birthDate}
                    onChangeText={setBirthDate}
                    placeholderTextColor={Colors.textMuted}
                    placeholder="DD/MM/AAAA"
                  />
                  <Icon name="calendar-today" size={18} color={Colors.textMuted} style={styles.inputRightIcon} />
                </View>
              </View>
            </View>
          </View>

          {/* PERFIL DO USUÁRIO */}
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
              <Text style={styles.label}>Plano Atual</Text>
              <TouchableOpacity style={styles.inputContainer}>
                <Text style={styles.planText}>{plan}</Text>
                <Icon name="expand-more" size={22} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
            <View style={styles.statusCard}>
              <View>
                <Text style={styles.statusTitle}>Status da Matrícula</Text>
                <Text style={styles.statusSubtitle}>ATIVO PARA TREINAR</Text>
              </View>
              <Switch
                value={enrollmentActive}
                onValueChange={setEnrollmentActive}
                trackColor={{ false: Colors.surfaceDark, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>
          </View>

          {/* <View style={styles.bottomSpacer} /> */}
        </ScrollView>

        {/* Footer buttons */}
        <View style={styles.footer}>
          {isEditing && (
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
  bottomSpacer: { height: 24 },
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
