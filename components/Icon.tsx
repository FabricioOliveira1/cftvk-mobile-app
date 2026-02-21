
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Colors } from '../theme';

interface IconProps {
  name: keyof typeof MaterialIcons.glyphMap;
  size?: number;
  color?: string;
  style?: object;
}

const Icon: React.FC<IconProps> = ({ name, size = 24, color = Colors.white, style }) => {
  return <MaterialIcons name={name} size={size} color={color} style={style} />;
};

export default Icon;
