import { Stack, useFocusEffect, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Timestamp, doc, getDoc } from 'firebase/firestore';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/Icon';
import UserAvatar from '../../components/UserAvatar';
import { useAuth } from '../../src/context';
import { db } from '../../src/services/firebase';
import { uploadProfilePhoto } from '../../src/services/photoService';
import { AppUser } from '../../src/types';
import { Colors, Fonts } from '../../theme';

function formatExpiry(ts?: Timestamp): string | null {
  if (!ts) return null;
  const d = ts.toDate();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function daysRemaining(ts?: Timestamp): number | null {
  if (!ts) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = ts.toDate();
  exp.setHours(0, 0, 0, 0);
  return Math.round((exp.getTime() - now.getTime()) / 86400000);
}

const roleLabel = (role?: string) => {
  if (role === 'admin') return 'Administrador';
  if (role === 'coach') return 'Coach';
  return 'Atleta';
};

const roleColor = (role?: string) => {
  if (role === 'admin') return Colors.accentGold;
  if (role === 'coach') return Colors.primary;
  return Colors.slate[400];
};

const StudentProfileScreen: React.FC = () => {
  const router = useRouter();
  const { appUser, signOut } = useAuth();

  const [profileData, setProfileData] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!appUser?.id) return;
      setLoading(true);
      getDoc(doc(db, 'users', appUser.id))
        .then((snap) => {
          if (snap.exists()) setProfileData({ id: snap.id, ...snap.data() } as AppUser);
        })
        .finally(() => setLoading(false));
    }, [appUser?.id])
  );

  const launchPicker = async (source: 'camera' | 'gallery') => {
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    };

    let result: ImagePicker.ImagePickerResult;
    if (source === 'camera') {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permissão necessária', 'Permita acesso à câmera nas configurações do dispositivo.');
        return;
      }
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permissão necessária', 'Permita acesso à galeria nas configurações do dispositivo.');
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (!result.canceled && appUser) {
      setUploading(true);
      try {
        const url = await uploadProfilePhoto(appUser.id, result.assets[0].uri);
        setProfileData((prev) => (prev ? { ...prev, photoURL: url } : prev));
      } catch {
        Alert.alert('Erro', 'Não foi possível atualizar a foto. Tente novamente.');
      } finally {
        setUploading(false);
      }
    }
  };

  const handlePickPhoto = () => {
    Alert.alert('Foto de perfil', 'Como deseja atualizar sua foto?', [
      { text: 'Câmera', onPress: () => launchPicker('camera') },
      { text: 'Galeria', onPress: () => launchPicker('gallery') },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const tagColor = roleColor(profileData?.role);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Avatar + nome */}
        <View style={styles.profileHeader}>
          <UserAvatar
            photoURL={profileData?.photoURL}
            size={112}
            onPress={handlePickPhoto}
            uploading={uploading}
          />
          <Text style={styles.name}>{profileData?.name ?? '—'}</Text>
          <View style={[styles.tag, { backgroundColor: `${tagColor}20`, borderColor: `${tagColor}30` }]}>
            <Text style={[styles.tagText, { color: tagColor }]}>{roleLabel(profileData?.role)}</Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => appUser && router.push({ pathname: '/edit-member', params: { id: appUser.id } })}
          >
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Informações pessoais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Icon name="mail" size={20} color={Colors.slate[500]} />
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardLabel}>Email</Text>
                <Text style={styles.cardValue}>{profileData?.email ?? '—'}</Text>
              </View>
            </View>
            <View style={styles.cardDivider} />
            <View style={styles.cardRow}>
              <Icon name="phone" size={20} color={Colors.slate[500]} />
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardLabel}>Telefone</Text>
                <Text style={styles.cardValue}>{profileData?.phone || '—'}</Text>
              </View>
            </View>
            <View style={styles.cardDivider} />
            <View style={styles.cardRow}>
              <Icon name="cake" size={20} color={Colors.slate[500]} />
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardLabel}>Data de Nascimento</Text>
                <Text style={styles.cardValue}>{profileData?.birthDate || '—'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Plano + matrícula */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Matrícula</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Icon name="card-membership" size={20} color={Colors.slate[500]} />
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardLabel}>Plano</Text>
                <Text style={styles.cardValue}>{profileData?.plan || '—'}</Text>
              </View>
            </View>
            {profileData?.planExpiresAt && (
              <>
                <View style={styles.cardDivider} />
                <View style={styles.cardRow}>
                  <Icon name="event" size={20} color={Colors.slate[500]} />
                  <View style={styles.cardTextContainer}>
                    <Text style={styles.cardLabel}>Válido até</Text>
                    <Text style={styles.cardValue}>{formatExpiry(profileData.planExpiresAt)}</Text>
                  </View>
                </View>
              </>
            )}
            <View style={styles.cardDivider} />
            <View style={styles.cardRow}>
              <View style={[styles.statusDot, { backgroundColor: profileData?.enrollmentActive !== false ? Colors.green[500] : Colors.red[500] }]} />
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardLabel}>Status</Text>
                <Text style={styles.cardValue}>
                  {profileData?.enrollmentActive !== false ? 'Ativo para treinar' : 'Matrícula inativa'}
                </Text>
                {(() => {
                  const days = daysRemaining(profileData?.planExpiresAt);
                  if (days === null) return null;
                  if (days <= 0) return <Text style={styles.expiryExpired}>Plano vencido</Text>;
                  return <Text style={styles.expiryOk}>Vence em {days} dia{days !== 1 ? 's' : ''}</Text>;
                })()}
              </View>
            </View>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Icon name="logout" size={20} color={Colors.red[500]} />
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.backgroundDark },
  container: { padding: 24, paddingBottom: 80 },
  profileHeader: { alignItems: 'center', marginBottom: 32 },
  name: { marginTop: 16, fontSize: 24, fontFamily: Fonts.sansBold, color: Colors.white },
  tag: { marginTop: 4, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99, borderWidth: 1 },
  tagText: { fontSize: 10, fontFamily: Fonts.sansBold, textTransform: 'uppercase', letterSpacing: 1 },
  editButton: { marginTop: 20, width: '100%', backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  editButtonText: { color: Colors.backgroundDark, fontFamily: Fonts.sansBold, fontSize: 14 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontFamily: Fonts.sansBold, color: Colors.slate[400], textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 4, marginBottom: 12 },
  card: { backgroundColor: Colors.cardDark, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  cardRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  cardDivider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 16 },
  cardTextContainer: { marginLeft: 16 },
  cardLabel: { fontSize: 10, color: Colors.slate[500], marginBottom: 2 },
  cardValue: { fontSize: 14, fontFamily: Fonts.sansMedium, color: Colors.white },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  expiryOk: { fontSize: 11, fontFamily: Fonts.sansMedium, color: Colors.textMuted, marginTop: 2 },
  expiryExpired: { fontSize: 11, fontFamily: Fonts.sansBold, color: Colors.red[500], marginTop: 2 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', backgroundColor: 'rgba(239,68,68,0.1)', marginTop: 8 },
  logoutButtonText: { color: Colors.red[500], fontFamily: Fonts.sansBold, fontSize: 14, marginLeft: 8 },
});

export default StudentProfileScreen;
