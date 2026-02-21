import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors, Fonts } from '../../theme';

import ActionButton from '../../components/ActionButton';
import FAB from '../../components/FAB';
import ListItem from '../../components/ListItem';
import ScreenHeader from '../../components/ScreenHeader';
import SectionHeader from '../../components/SectionHeader';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../src/context';
import {
  getClassCountForToday,
  getMemberCount,
  getMembers,
} from '../../src/services';
import { AppUser } from '../../src/types';

const roleLabel = (role: AppUser['role']) => {
  if (role === 'admin') return 'Administrador';
  if (role === 'coach') return 'Coach';
  return 'Atleta';
};

const roleColor = (role: AppUser['role']) => {
  if (role === 'admin') return Colors.accentGold;
  if (role === 'coach') return Colors.primary;
  return Colors.slate[400];
};

const DashboardScreen: React.FC = () => {
  const router = useRouter();
  const { appUser } = useAuth();

  const [memberCount, setMemberCount] = useState<number>(0);
  const [classCount, setClassCount] = useState<number>(0);
  const [recentMembers, setRecentMembers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!appUser) return;
      setLoading(true);
      const load = async () => {
        try {
          const [count, classes, members] = await Promise.all([
            getMemberCount(),
            getClassCountForToday(),
            getMembers(),
          ]);
          setMemberCount(count);
          setClassCount(classes);
          setRecentMembers(members.slice(0, 4));
        } finally {
          setLoading(false);
        }
      };
      load();
    }, [appUser?.id])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <ScreenHeader
          boxName="CFTVK"
          adminName={appUser?.name?.split(' ')[0]}
        />

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginBottom: 32 }} />
        ) : (
          <View style={styles.statsContainer}>
            <StatCard
              label="Total de Alunos"
              value={String(memberCount)}
              icon="groups"
              iconColor={Colors.primary}
              iconBgColor="rgba(232, 184, 67, 0.1)"
            />
            <StatCard
              label="Aulas Hoje"
              value={String(classCount)}
              icon="fitness-center"
              iconColor={Colors.accentGold}
              iconBgColor="rgba(201, 164, 76, 0.1)"
            />
          </View>
        )}

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Gestão de Hoje</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsContainer}>
            <ActionButton
              title="Nova Aula"
              icon="add-circle"
              variant="primary"
              onPress={() => router.push('/new-class')}
            />
            <ActionButton
              title="Matricular"
              icon="person-add"
              onPress={() => router.push('/edit-member')}
            />
          </ScrollView>
        </View>

        <View style={styles.usersSection}>
          <SectionHeader title="Lista de Usuários" onSeeAll={() => router.push('/(tabs)/members')} />
          {recentMembers.map((member) => (
            <ListItem
              key={member.id}
              name={member.name}
              role={roleLabel(member.role)}
              tagColor={roleColor(member.role)}
              onPress={() => router.push({ pathname: '/member-profile', params: { id: member.id } })}
            />
          ))}
          {!loading && recentMembers.length === 0 && (
            <Text style={styles.emptyText}>Nenhum membro cadastrado ainda.</Text>
          )}
        </View>
      </ScrollView>
      <FAB onPress={() => router.push('/new-class')} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.backgroundDark },
  scrollView: { flex: 1 },
  contentContainer: { padding: 24, paddingBottom: 100 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  actionsSection: { marginBottom: 32 },
  sectionTitle: { color: Colors.white, fontSize: 18, fontFamily: Fonts.sansBold, marginBottom: 12 },
  actionsContainer: { paddingBottom: 8 },
  usersSection: { marginBottom: 32 },
  emptyText: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: 16 },
});

export default DashboardScreen;
