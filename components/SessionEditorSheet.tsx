import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from './Icon';
import { Session } from '../src/types';
import { Colors, Fonts } from '../theme';

interface Props {
  sessions: Session[];
  onChange: (sessions: Session[]) => void;
}

const SessionEditorSheet: React.FC<Props> = ({ sessions, onChange }) => {
  const updateTitle = (id: string, title: string) =>
    onChange(sessions.map((s) => (s.id === id ? { ...s, title } : s)));

  const updateDetails = (id: string, details: string) =>
    onChange(sessions.map((s) => (s.id === id ? { ...s, details } : s)));

  const deleteSession = (id: string) =>
    onChange(sessions.filter((s) => s.id !== id));

  const addSession = () =>
    onChange([...sessions, { id: Date.now().toString(), title: 'Nova Sessão', details: '' }]);

  return (
    <>
      {sessions.map((session) => (
        <View key={session.id} style={styles.sessionCard}>
          <View style={styles.sessionHeader}>
            <View style={styles.sessionTitleRow}>
              <Icon name="drag-indicator" size={24} color={Colors.textMuted} />
              <TextInput
                style={styles.sessionTitleInput}
                value={session.title}
                onChangeText={(t) => updateTitle(session.id, t)}
                placeholderTextColor={Colors.textMuted}
                placeholder="Título da sessão"
              />
            </View>
            <TouchableOpacity onPress={() => deleteSession(session.id)}>
              <Icon name="delete" size={22} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.sessionDetailsInput}
            multiline
            value={session.details}
            onChangeText={(t) => updateDetails(session.id, t)}
            placeholder="Descreva os exercícios..."
            placeholderTextColor={Colors.textMuted}
          />
        </View>
      ))}

      <TouchableOpacity style={styles.addSessionButton} onPress={addSession}>
        <Icon name="add-circle" size={22} color={Colors.primary} />
        <Text style={styles.addSessionButtonText}>Adicionar Nova Sessão</Text>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  sessionCard: {
    backgroundColor: Colors.cardDark,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    marginBottom: 16,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sessionTitleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  sessionTitleInput: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: Fonts.sansBold,
    flex: 1,
    marginLeft: 8,
    padding: 0,
  },
  sessionDetailsInput: {
    backgroundColor: Colors.backgroundDark,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 16,
    minHeight: 100,
    color: Colors.textMuted,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  addSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    borderRadius: 12,
    marginBottom: 28,
  },
  addSessionButtonText: { color: Colors.primary, fontFamily: Fonts.sansBold, marginLeft: 8 },
});

export default SessionEditorSheet;
