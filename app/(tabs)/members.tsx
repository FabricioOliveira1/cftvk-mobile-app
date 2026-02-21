import { Stack, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../../theme';

import FAB from '../../components/FAB';
import Icon from '../../components/Icon';
import ListItem from '../../components/ListItem';
import SearchFilterHeader from '../../components/SearchFilterHeader';
import { getMembers } from '../../src/services';
import { AppUser, UserRole } from '../../src/types';

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

const MembersListScreen: React.FC = () => {
  const router = useRouter();

  const [members, setMembers] = useState<AppUser[]>([]);
  const [filtered, setFiltered] = useState<AppUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      getMembers()
        .then((data) => { setMembers(data); setFiltered(data); })
        .finally(() => setLoading(false));
    }, [])
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFiltered(members);
    } else {
      const lower = query.toLowerCase();
      setFiltered(members.filter((m) => m.name.toLowerCase().includes(lower)));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: Colors.backgroundDark },
          headerTintColor: Colors.white,
          headerTitle: 'Lista de Alunos',
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
              <Icon name="arrow-back-ios" size={22} color={Colors.white} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          ),
        }}
      />
      <SearchFilterHeader value={searchQuery} onChangeText={handleSearch} />
      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={filtered}
          renderItem={({ item }) => (
            <ListItem
              name={item.name}
              role={roleLabel(item.role)}
              tagColor={roleColor(item.role)}
              onPress={() => router.push({ pathname: '/member-profile', params: { id: item.id } })}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum membro encontrado.</Text>}
        />
      )}
      <FAB onPress={() => { /* Adicionar membro - próxima versão */ }} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.backgroundDark },
  listContainer: { paddingHorizontal: 24, paddingBottom: 100 },
  emptyText: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: 32 },
});

export default MembersListScreen;
