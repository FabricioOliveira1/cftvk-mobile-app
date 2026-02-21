
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { Colors, Fonts } from '../theme';
import Icon from './Icon';

interface ActionButtonProps {
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
}

const ActionButton: React.FC<ActionButtonProps> = ({ title, icon, onPress, variant = 'secondary' }) => {
  const isPrimary = variant === 'primary';
  const containerStyle: ViewStyle = isPrimary ? styles.actionButtonPrimary : styles.actionButtonSecondary;
  const textStyle: TextStyle = isPrimary ? styles.actionButtonTextPrimary : styles.actionButtonTextSecondary;
  const iconColor = isPrimary ? Colors.black : Colors.white;

  return (
    <TouchableOpacity style={containerStyle} onPress={onPress}>
      <Icon name={icon} size={20} color={iconColor} />
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  actionButtonPrimary: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 99, marginRight: 12 },
  actionButtonTextPrimary: { color: Colors.black, fontFamily: Fonts.sansMedium, marginLeft: 8 },
  actionButtonSecondary: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceDark, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 99, borderWidth: 1, borderColor: Colors.border, marginRight: 12 },
  actionButtonTextSecondary: { color: Colors.white, fontFamily: Fonts.sansMedium, marginLeft: 8 },
});

export default ActionButton;
