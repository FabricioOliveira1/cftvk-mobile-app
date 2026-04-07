import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from './Icon';
import { useNetwork } from '../src/context/NetworkContext';
import { Colors, Fonts } from '../theme';

export default function OfflineBanner() {
  const { isOnline } = useNetwork();
  const { top } = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: isOnline ? -60 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOnline, translateY]);

  return (
    <Animated.View style={[styles.banner, { paddingTop: top + 6, transform: [{ translateY }] }]}>
      <View style={styles.content}>
        <Icon name="wifi-off" size={16} color={Colors.white} />
        <Text style={styles.text}>Você está offline. Os dados podem não estar atualizados.</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.red[500],
    zIndex: 999,
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    color: Colors.white,
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    flexShrink: 1,
  },
});
