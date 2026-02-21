import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Fonts } from '../theme';
import Icon from './Icon';

interface ScreenHeaderProps {
  boxName?: string;
  adminName?: string;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({ boxName = 'CFTVK', adminName }) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerInfo}>
        <View style={styles.logoPlaceholder}>
          <Icon name="fitness-center" size={24} color={Colors.primary} />
        </View>
        <View>
          <Text style={styles.headerTitle}>{boxName}</Text>
          <Text style={styles.headerSubtitle}>
            {adminName ? `Olá, ${adminName}` : 'Dashboard Gerencial'}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.notificationButton}>
        <Icon name="notifications" size={24} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  headerInfo: { flexDirection: 'row', alignItems: 'center' },
  logoPlaceholder: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: Colors.primary, marginRight: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(232,184,67,0.1)' },
  headerTitle: { color: Colors.white, fontSize: 20, fontFamily: Fonts.sansBold },
  headerSubtitle: { color: Colors.textMuted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  notificationButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceDark, alignItems: 'center', justifyContent: 'center' },
});

export default ScreenHeader;
