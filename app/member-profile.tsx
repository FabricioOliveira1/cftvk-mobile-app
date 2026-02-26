import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from '../components/Icon';
import { db } from '../src/services/firebase';
import { AppUser, UserRole } from '../src/types';
import { Colors, Fonts } from '../theme';

const roleLabel = (role: UserRole) => {
  if (role === 'admin') return 'Administrador';
  if (role === 'coach') return 'Coach';
  return 'Atleta';
};

const roleColor = (role: UserRole) => {
  if (role === 'admin') return Colors.accentGold;
  if (role === 'coach') return Colors.primary;
  return Colors.slate[400];
};

const MemberProfileScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [member, setMember] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, 'users', id))
      .then((snap) => {
        if (snap.exists()) setMember({ id: snap.id, ...snap.data() } as AppUser);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const tagColor = member ? roleColor(member.role) : Colors.primary;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: Colors.backgroundDark },
          headerTintColor: Colors.white,
          headerTitle: 'Perfil do Membro',
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
              <Icon name="arrow-back-ios" size={22} color={Colors.white} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          ),
        }}
      />

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      ) : !member ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Membro não encontrado.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                <Icon name="person" size={48} color={Colors.textMuted} />
              </View>
              <View style={styles.verifiedBadge}>
                <Icon name="verified" size={16} color={Colors.backgroundDark} />
              </View>
            </View>
            <Text style={styles.name}>{member.name}</Text>
            <View style={[styles.tag, { backgroundColor: `${tagColor}20`, borderColor: `${tagColor}30` }]}>
              <Text style={[styles.tagText, { color: tagColor }]}>{roleLabel(member.role)}</Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push({ pathname: '/edit-member', params: { id: member.id } })}
            >
              <Text style={styles.editButtonText}>Editar Perfil</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações Pessoais</Text>
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <Icon name="mail" size={20} color={Colors.slate[500]} />
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardLabel}>Email</Text>
                  <Text style={styles.cardValue}>{member.email}</Text>
                </View>
              </View>
              <View style={styles.cardDivider} />
              <View style={styles.cardRow}>
                <Icon name="phone" size={20} color={Colors.slate[500]} />
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardLabel}>Telefone</Text>
                  <Text style={styles.cardValue}>{member.phone || '—'}</Text>
                </View>
              </View>
              <View style={styles.cardDivider} />
              <View style={styles.cardRow}>
                <Icon name="cake" size={20} color={Colors.slate[500]} />
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardLabel}>Data de Nascimento</Text>
                  <Text style={styles.cardValue}>{member.birthDate || '—'}</Text>
                </View>
              </View>
              <View style={styles.cardDivider} />
              <View style={styles.cardRow}>
                <Icon name="verified-user" size={20} color={Colors.slate[500]} />
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardLabel}>Tipo de Usuário</Text>
                  <Text style={[styles.cardValue, { color: tagColor }]}>{roleLabel(member.role)}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status da Matrícula</Text>
            <View style={[styles.card, styles.cardRow, { justifyContent: 'space-between' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.statusDot} />
                <Text style={styles.cardValue}>Ativo</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.backgroundDark },
  container: { padding: 24, paddingBottom: 50 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: Colors.textMuted, fontSize: 14 },
  profileHeader: { alignItems: 'center', marginBottom: 24 },
  avatarContainer: { position: 'relative' },
  avatarPlaceholder: { width: 112, height: 112, borderRadius: 56, borderWidth: 2, borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surfaceDark },
  verifiedBadge: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: Colors.backgroundDark },
  name: { marginTop: 16, fontSize: 24, fontFamily: Fonts.sansBold, color: Colors.white },
  tag: { marginTop: 4, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99, borderWidth: 1 },
  tagText: { fontSize: 10, fontFamily: Fonts.sansBold, textTransform: 'uppercase', letterSpacing: 1 },
  editButton: { marginTop: 24, width: '100%', backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  editButtonText: { color: Colors.backgroundDark, fontFamily: Fonts.sansBold, fontSize: 14 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontFamily: Fonts.sansBold, color: Colors.slate[400], textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 4, marginBottom: 12 },
  card: { backgroundColor: Colors.cardDark, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  cardRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  cardTextContainer: { marginLeft: 16 },
  cardLabel: { fontSize: 10, color: Colors.slate[500], marginBottom: 2 },
  cardValue: { fontSize: 14, fontFamily: Fonts.sansMedium, color: Colors.white },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.green[500], marginRight: 12 },
  cardDivider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 16 },
});

export default MemberProfileScreen;
