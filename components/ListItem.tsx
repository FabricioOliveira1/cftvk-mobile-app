
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Fonts } from '../theme';
import Icon from './Icon';

interface ListItemProps {
  name: string;
  role: string;
  imageUrl?: string | null;
  tagColor?: string;
  onPress?: () => void;
}

const ListItem: React.FC<ListItemProps> = ({ name, role, imageUrl, tagColor = Colors.slate[400], onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.info}>
        <View style={styles.avatarContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Icon name="person" size={24} color={Colors.slate[500]} />
            </View>
          )}
        </View>
        <View>
          <Text style={styles.name}>{name}</Text>
          <View style={[styles.tag, { backgroundColor: `${tagColor}20`, borderColor: `${tagColor}50` }]}>
            <Text style={[styles.tagText, { color: tagColor }]}>{role}</Text>
          </View>
        </View>
      </View>
      <Icon name="chevron-right" size={24} color={Colors.slate[400]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surfaceDark, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 12 },
  info: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { width: 56, height: 56, borderRadius: 28, marginRight: 16, overflow: 'hidden' },
  avatar: { width: '100%', height: '100%' },
  avatarPlaceholder: { width: '100%', height: '100%', backgroundColor: Colors.slate[800], alignItems: 'center', justifyContent: 'center' },
  name: { color: Colors.white, fontSize: 14, fontFamily: Fonts.sansBold },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99, borderWidth: 1, marginTop: 4, alignSelf: 'flex-start' },
  tagText: { fontSize: 10, textTransform: 'uppercase', fontFamily: Fonts.sansBold },
});

export default ListItem;
