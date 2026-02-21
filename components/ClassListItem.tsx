
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Fonts } from '../theme';
import Icon from './Icon';

interface ClassListItemProps {
  item: {
    time: string;
    coach: string;
    spots: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    color: string;
    isFull: boolean;
    opacity: number;
  };
  onPress?: () => void;
}

const ClassListItem: React.FC<ClassListItemProps> = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={[styles.classCard, { opacity: item.opacity }]} onPress={onPress}>
      <View style={styles.classInfo}>
        <View style={[styles.classIconContainer, { backgroundColor: `${item.color}20`, borderColor: `${item.color}30` }]}>
          <Icon name={item.icon} size={24} color={item.color} />
        </View>
        <View>
          <Text style={styles.classTime}>{item.time}</Text>
          <View style={styles.classDetails}>
            <Text style={styles.coachName}>Coach: {item.coach}</Text>
            <View style={styles.dot} />
            <Text style={[styles.spots, { color: item.color }]}>{item.spots}</Text>
          </View>
        </View>
      </View>
      {item.isFull ? <Icon name="group" size={24} color={Colors.primary} /> : <Icon name="chevron-right" size={24} color={Colors.slate[500]} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  classCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.backgroundDark, padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  classInfo: { flexDirection: 'row', alignItems: 'center' },
  classIconContainer: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginRight: 16 },
  classTime: { color: Colors.white, fontFamily: Fonts.sansBold, fontSize: 14, textTransform: 'uppercase', letterSpacing: -0.5 },
  classDetails: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  coachName: { fontSize: 11, color: Colors.slate[400] },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.slate[600], marginHorizontal: 8 },
  spots: { fontSize: 11, fontFamily: Fonts.sansBold },
});

export default ClassListItem;
