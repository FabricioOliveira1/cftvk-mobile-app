import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import logoMain from '../assets/images/logo.png';
import Icon from '../components/Icon';
import { auth } from '../src/services/firebase';
import { Colors, Fonts } from '../theme';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password) return;
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // Navigation handled automatically by onAuthStateChanged + route guard in _layout.tsx
    } catch {
      setError('Email ou senha incorretos. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Esqueci minha senha', 'Digite seu email primeiro.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert('Email enviado', 'Verifique sua caixa de entrada para redefinir a senha.');
    } catch {
      Alert.alert('Erro', 'Não foi possível enviar o email. Verifique o endereço informado.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.logoContainer}>
            <Image source={logoMain} style={styles.logo} resizeMode="contain" />
            <Text style={styles.title}>CROSSFIT VK</Text>
            <Text style={styles.subtitle}>Sua melhor versão</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Icon name="mail" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="atleta@cftvk.com"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Senha</Text>
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgotPassword}>Esqueci minha senha</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputContainer}>
                <Icon name="lock" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={styles.visibilityIcon}
                  onPress={() => setShowPassword((v) => !v)}
                >
                  <Icon
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={22}
                    color={Colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.backgroundDark} />
              ) : (
                <Text style={styles.loginButtonText}>Entrar no Box</Text>
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
    padding: 20,
  },
  logoContainer: { alignItems: 'center', justifyContent: 'space-around', marginBottom: 20 },
  logo: { width: 180, height: 180, marginBottom: 8 },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 32,
    color: Colors.primary,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 4,
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
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    marginLeft: 4,
  },
  forgotPassword: {
    fontSize: 12,
    fontFamily: Fonts.sansMedium,
    color: Colors.primary,
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
  errorText: {
    color: Colors.red[500],
    fontSize: 13,
    fontFamily: Fonts.sansMedium,
    marginBottom: 12,
    marginLeft: 4,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontFamily: Fonts.displayBold,
    fontSize: 18,
    color: Colors.backgroundDark,
    textTransform: 'uppercase',
  },
});

export default LoginScreen;
