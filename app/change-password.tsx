import { Stack, useRouter } from 'expo-router';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import React, { useState } from 'react';
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
import { Colors, Fonts } from '../theme';

const ChangePasswordScreen: React.FC = () => {
  const router = useRouter();
  const { firebaseUser } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!currentPassword) {
      Alert.alert('Campo obrigatório', 'Informe sua senha atual.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Senha inválida', 'A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Senhas diferentes', 'A confirmação de senha não coincide.');
      return;
    }
    if (!firebaseUser?.email) return;

    setSaving(true);
    try {
      const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
      await reauthenticateWithCredential(firebaseUser, credential);
      await updatePassword(firebaseUser, newPassword);
      Alert.alert('Senha alterada', 'Sua senha foi atualizada com sucesso.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: unknown) {
      const code = e && typeof e === 'object' && 'code' in e ? (e as { code: string }).code : '';
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        Alert.alert('Senha incorreta', 'A senha atual informada está errada.');
      } else {
        Alert.alert('Erro', 'Não foi possível alterar a senha. Tente novamente.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: Colors.backgroundDark },
          headerTintColor: Colors.white,
          headerTitle: 'Alterar Senha',
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
              <Icon name="arrow-back-ios" size={22} color={Colors.white} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          ),
        }}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

          <View style={styles.iconWrapper}>
            <Icon name="lock-reset" size={48} color={Colors.primary} />
          </View>

          <Text style={styles.title}>Alterar Senha</Text>
          <Text style={styles.subtitle}>
            Informe sua senha atual e escolha uma nova senha.
          </Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha Atual</Text>
              <View style={styles.inputContainer}>
                <Icon name="lock-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Sua senha atual"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showCurrent}
                  autoCapitalize="none"
                />
                <TouchableOpacity style={styles.visibilityIcon} onPress={() => setShowCurrent((v) => !v)}>
                  <Icon name={showCurrent ? 'visibility-off' : 'visibility'} size={22} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nova Senha</Text>
              <View style={styles.inputContainer}>
                <Icon name="lock" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showNew}
                  autoCapitalize="none"
                />
                <TouchableOpacity style={styles.visibilityIcon} onPress={() => setShowNew((v) => !v)}>
                  <Icon name={showNew ? 'visibility-off' : 'visibility'} size={22} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar Nova Senha</Text>
              <View style={styles.inputContainer}>
                <Icon name="lock" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Repita a nova senha"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                />
                <TouchableOpacity style={styles.visibilityIcon} onPress={() => setShowConfirm((v) => !v)}>
                  <Icon name={showConfirm ? 'visibility-off' : 'visibility'} size={22} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, saving && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={Colors.backgroundDark} />
              ) : (
                <Text style={styles.buttonText}>ALTERAR SENHA</Text>
              )}
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.backgroundDark },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${Colors.primary}18`,
    borderWidth: 1,
    borderColor: `${Colors.primary}30`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontFamily: Fonts.sansBold,
    color: Colors.white,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.sans,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 36,
    paddingHorizontal: 8,
  },
  form: { width: '100%' },
  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: 12,
    fontFamily: Fonts.sansBold,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 4,
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    height: 56,
  },
  inputIcon: { position: 'absolute', left: 16 },
  input: {
    flex: 1,
    height: '100%',
    paddingLeft: 48,
    paddingRight: 48,
    color: Colors.white,
    fontSize: 16,
  },
  visibilityIcon: { position: 'absolute', right: 16 },
  button: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    fontFamily: Fonts.displayBold,
    fontSize: 16,
    color: Colors.backgroundDark,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default ChangePasswordScreen;
