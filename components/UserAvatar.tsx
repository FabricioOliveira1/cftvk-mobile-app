import { Image } from 'expo-image';
import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Colors } from '../theme';
import Icon from './Icon';

interface Props {
  photoURL?: string | null;
  size?: number;
  onPress?: () => void;
  uploading?: boolean;
}

const UserAvatar: React.FC<Props> = ({ photoURL, size = 112, onPress, uploading = false }) => {
  const radius = size / 2;
  const iconSize = Math.round(size * 0.43);

  const inner = (
    <View style={[styles.base, { width: size, height: size, borderRadius: radius }]}>
      {uploading ? (
        <ActivityIndicator color={Colors.primary} />
      ) : photoURL ? (
        <Image
          source={{ uri: photoURL }}
          style={{ width: size, height: size, borderRadius: radius }}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <Icon name="person" size={iconSize} color={Colors.textMuted} />
      )}
      {onPress && !uploading && (
        <View style={styles.cameraBadge}>
          <Icon name="photo-camera" size={14} color={Colors.backgroundDark} />
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {inner}
      </TouchableOpacity>
    );
  }
  return inner;
};

const styles = StyleSheet.create({
  base: {
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceDark,
    overflow: 'hidden',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.backgroundDark,
  },
});

export default UserAvatar;
