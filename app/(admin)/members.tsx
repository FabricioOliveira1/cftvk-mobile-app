import { Stack, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts } from '../../theme';

import FAB from '../../components/FAB';
import Icon from '../../components/Icon';
import ListItem from '../../components/ListItem';
import SearchFilterHeader from '../../components/SearchFilterHeader';
import { getMembers } from '../../src/services';
import { AppUser, UserRole } from '../../src/types';

// ── Filter types ───────────────────────────────────────────────────────────────

type RoleFilter = 'all' | 'coach' | 'student';
type StatusFilter = 'all' | 'active' | 'inactive';

interface Filters {
  role: RoleFilter;
  status: StatusFilter;
  plan: string; // '' = todos
}

const DEFAULT_FILTERS: Filters = { role: 'all', status: 'all', plan: '' };

// ── Helpers ────────────────────────────────────────────────────────────────────

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

function applyFilters(list: AppUser[], query: string, filters: Filters): AppUser[] {
  let result = list;

  if (query.trim()) {
    const lower = query.toLowerCase();
    result = result.filter((m) => m.name.toLowerCase().includes(lower));
  }

  if (filters.role !== 'all') {
    result = result.filter((m) => m.role === filters.role);
  }

  if (filters.status !== 'all') {
    // undefined é tratado como ativo (padrão ao criar membro)
    const isActive = (m: AppUser) => m.enrollmentActive !== false;
    result = result.filter((m) =>
      filters.status === 'active' ? isActive(m) : !isActive(m)
    );
  }

  if (filters.plan) {
    result = result.filter((m) => m.plan === filters.plan);
  }

  return result;
}

function hasFiltersChanged(f: Filters): boolean {
  return f.role !== 'all' || f.status !== 'all' || !!f.plan;
}

// ── Screen ─────────────────────────────────────────────────────────────────────

const MembersListScreen: React.FC = () => {
  const router = useRouter();

  const [members, setMembers] = useState<AppUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [pendingFilters, setPendingFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      getMembers()
        .then(setMembers)
        .finally(() => setLoading(false));
    }, [])
  );

  // Planos únicos existentes na base
  const distinctPlans = useMemo(() => {
    const plans = members.map((m) => m.plan).filter(Boolean) as string[];
    return [...new Set(plans)].sort();
  }, [members]);

  const filtered = useMemo(
    () => applyFilters(members, searchQuery, filters),
    [members, searchQuery, filters]
  );

  const hasActiveFilters = hasFiltersChanged(filters);

  const openFilter = () => {
    setPendingFilters(filters);
    setShowFilterModal(true);
  };

  const applyAndClose = () => {
    setFilters(pendingFilters);
    setShowFilterModal(false);
  };

  const clearPending = () => setPendingFilters(DEFAULT_FILTERS);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: Colors.backgroundDark },
          headerTintColor: Colors.white,
          headerTitle: 'Lista de Usuários',
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
              <Icon name="arrow-back-ios" size={22} color={Colors.white} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          ),
        }}
      />

      <SearchFilterHeader
        value={searchQuery}
        onChangeText={setSearchQuery}
        onFilterPress={openFilter}
        hasActiveFilters={hasActiveFilters}
      />

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 32 }} />
      ) : (
        <>
          {hasActiveFilters && (
            <View style={styles.activeBanner}>
              <Text style={styles.activeBannerText}>
                {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} com filtros ativos
              </Text>
              <TouchableOpacity onPress={() => setFilters(DEFAULT_FILTERS)}>
                <Text style={styles.activeBannerClear}>Limpar</Text>
              </TouchableOpacity>
            </View>
          )}
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
        </>
      )}

      <FAB onPress={() => { /* Adicionar membro - próxima versão */ }} />

      {/* ── Filter Modal ──────────────────────────────────────────────────── */}
      <Modal
        animationType="slide"
        transparent
        visible={showFilterModal}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowFilterModal(false)}>
          <View style={styles.filterSheet}>
            <View style={styles.handle} />

            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filtros</Text>
              <TouchableOpacity onPress={clearPending}>
                <Text style={styles.clearText}>Limpar tudo</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Perfil */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionLabel}>PERFIL</Text>
                <View style={styles.chipsRow}>
                  {(
                    [
                      { label: 'Todos', value: 'all' },
                      { label: 'Coach', value: 'coach' },
                      { label: 'Aluno', value: 'student' },
                    ] as { label: string; value: RoleFilter }[]
                  ).map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.chip, pendingFilters.role === opt.value && styles.chipActive]}
                      onPress={() => setPendingFilters((f) => ({ ...f, role: opt.value }))}
                    >
                      <Text style={[styles.chipText, pendingFilters.role === opt.value && styles.chipTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Status da matrícula */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionLabel}>STATUS DA MATRÍCULA</Text>
                <View style={styles.chipsRow}>
                  {(
                    [
                      { label: 'Todos', value: 'all' },
                      { label: 'Ativo', value: 'active' },
                      { label: 'Inativo', value: 'inactive' },
                    ] as { label: string; value: StatusFilter }[]
                  ).map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.chip, pendingFilters.status === opt.value && styles.chipActive]}
                      onPress={() => setPendingFilters((f) => ({ ...f, status: opt.value }))}
                    >
                      <Text style={[styles.chipText, pendingFilters.status === opt.value && styles.chipTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Plano — aparece apenas se houver dados */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionLabel}>PLANO</Text>
                <View style={styles.chipsRow}>
                  <TouchableOpacity
                    style={[styles.chip, pendingFilters.plan === '' && styles.chipActive]}
                    onPress={() => setPendingFilters((f) => ({ ...f, plan: '' }))}
                  >
                    <Text style={[styles.chipText, pendingFilters.plan === '' && styles.chipTextActive]}>
                      Todos
                    </Text>
                  </TouchableOpacity>
                  {distinctPlans.map((plan) => (
                    <TouchableOpacity
                      key={plan}
                      style={[styles.chip, pendingFilters.plan === plan && styles.chipActive]}
                      onPress={() => setPendingFilters((f) => ({ ...f, plan }))}
                    >
                      <Text style={[styles.chipText, pendingFilters.plan === plan && styles.chipTextActive]}>
                        {plan}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {distinctPlans.length === 0 && (
                    <Text style={styles.noPlansText}>Nenhum plano cadastrado ainda.</Text>
                  )}
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.applyButton} onPress={applyAndClose}>
              <Text style={styles.applyButtonText}>APLICAR FILTROS</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.backgroundDark },
  listContainer: { paddingHorizontal: 24, paddingBottom: 100 },
  emptyText: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: 32 },

  // Active filters banner
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 10,
  },
  activeBannerText: { color: Colors.textMuted, fontFamily: Fonts.sansMedium, fontSize: 13 },
  activeBannerClear: { color: Colors.primary, fontFamily: Fonts.sansBold, fontSize: 13 },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  filterSheet: {
    backgroundColor: Colors.backgroundDark,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 48,
    borderTopWidth: 1,
    borderColor: Colors.border,
    maxHeight: '80%',
  },
  handle: {
    width: 48,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  filterTitle: { color: Colors.white, fontFamily: Fonts.sansBold, fontSize: 20 },
  clearText: { color: Colors.primary, fontFamily: Fonts.sansMedium, fontSize: 14 },

  filterSection: { marginBottom: 24 },
  filterSectionLabel: {
    color: Colors.textMuted,
    fontFamily: Fonts.sansBold,
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.cardDark,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { color: Colors.white, fontFamily: Fonts.sansMedium, fontSize: 14 },
  chipTextActive: { color: Colors.backgroundDark, fontFamily: Fonts.sansBold },

  noPlansText: { color: Colors.textMuted, fontFamily: Fonts.sansMedium, fontSize: 13, fontStyle: 'italic' },

  applyButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  applyButtonText: {
    color: Colors.backgroundDark,
    fontFamily: Fonts.sansBold,
    fontSize: 15,
    letterSpacing: 0.5,
  },
});

export default MembersListScreen;
