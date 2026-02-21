
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Fonts } from '../theme';
import Icon from './Icon';

interface StatCardProps {
  label: string;
  value: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconBgColor: string;
  iconColor: string;
/*   trend?: {
    value: string;
    direction: 'up' | 'down';
  }; */
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, iconBgColor, iconColor }) => {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: iconBgColor }]}>
        <Icon name={icon} size={24} color={iconColor} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
{/*       {trend && (
        <View style={styles.statTrendContainer}>
          <Icon name={trend.direction === 'up' ? 'trending-up' : 'trending-down'} size={14} color={Colors.green[500]} />
          <Text style={styles.statTrend}> {trend.value}</Text>
        </View>
      )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  statCard: { flex: 1, backgroundColor: Colors.surfaceDark, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: Colors.border, marginHorizontal: 6 },
  statIconContainer: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statLabel: { color: Colors.textMuted, fontSize: 14, fontFamily: Fonts.sansMedium, marginBottom: 4 },
  statValue: { color: Colors.white, fontSize: 32, fontFamily: Fonts.sansBold, marginBottom: 4 },
  statTrendContainer: { flexDirection: 'row', alignItems: 'center' },
  statTrend: { color: Colors.green[500], fontSize: 12, fontFamily: Fonts.sansMedium },
});

export default StatCard;
