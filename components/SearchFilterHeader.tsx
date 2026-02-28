import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors, Fonts } from '../theme';
import Icon from './Icon';

interface SearchFilterHeaderProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onFilterPress?: () => void;
  hasActiveFilters?: boolean;
}

const SearchFilterHeader: React.FC<SearchFilterHeaderProps> = ({
  value,
  onChangeText,
  onFilterPress,
  hasActiveFilters,
}) => {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Icon name="search" size={20} color={Colors.slate[500]} style={styles.searchIcon} />
        <TextInput
          placeholder="Buscar aluno..."
          placeholderTextColor={Colors.slate[500]}
          style={styles.searchInput}
          value={value}
          onChangeText={onChangeText}
        />
      </View>
      <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
        <Icon name="tune" size={24} color={Colors.backgroundDark} />
        {hasActiveFilters && <View style={styles.activeDot} />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 },
  searchInputContainer: { flex: 1, position: 'relative' },
  searchIcon: { position: 'absolute', left: 12, top: 14, zIndex: 1 },
  searchInput: { backgroundColor: Colors.slate[200], borderRadius: 16, height: 48, paddingLeft: 40, paddingRight: 16, color: Colors.backgroundDark, fontFamily: Fonts.sansMedium },
  filterButton: { width: 48, height: 48, backgroundColor: Colors.slate[200], borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  activeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    borderWidth: 1.5,
    borderColor: Colors.backgroundDark,
  },
});

export default SearchFilterHeader;
