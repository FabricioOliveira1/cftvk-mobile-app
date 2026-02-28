
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ReservationStatus } from '../src/types';
import { Colors, Fonts } from '../theme';
import Icon from './Icon';

// 'expired'  → prazo de 15min encerrado — card dimmed, badge "Encerrado"
// 'pending'  → janela de 12h ainda não abriu — badge com horário de abertura
type TimeStatus =
  | { type: 'expired' }
  | { type: 'pending'; opensLabel: string };

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
  myReservationId?: string;
  onReserve?: () => void;
  onCancelReservation?: () => void;
  onCheckIn?: () => void;
  reservationStatus?: ReservationStatus;
  isCheckInWindow?: boolean;
  reserving?: boolean;
  timeStatus?: TimeStatus;
  historyMode?: boolean;
}

const ClassListItem: React.FC<ClassListItemProps> = ({
  item,
  onPress,
  myReservationId,
  onReserve,
  onCancelReservation,
  onCheckIn,
  reservationStatus,
  isCheckInWindow = false,
  reserving = false,
  timeStatus,
  historyMode = false,
}) => {
  const hasReservation = !!myReservationId;

  const renderRightAction = () => {
    // Modo histórico: badge read-only, sem ações
    if (historyMode && hasReservation) {
      if (reservationStatus === 'CHECKED_IN') {
        return (
          <View style={styles.confirmedBadge}>
            <Icon name="check-circle" size={14} color={Colors.green[500]} />
            <Text style={styles.confirmedText}>Presente</Text>
          </View>
        );
      }
      return (
        <View style={styles.noShowBadge}>
          <Icon name="cancel" size={14} color={Colors.textMuted} />
          <Text style={styles.noShowText}>Faltou</Text>
        </View>
      );
    }
    if (reserving) {
      return <ActivityIndicator size="small" color={Colors.primary} style={styles.actionLoader} />;
    }
    // Se já tem reserva, exibe ação conforme status e janela de check-in
    if (hasReservation) {
      if (reservationStatus === 'CHECKED_IN') {
        return (
          <View style={styles.confirmedBadge}>
            <Icon name="check-circle" size={14} color={Colors.green[500]} />
            <Text style={styles.confirmedText}>Confirmado</Text>
          </View>
        );
      }
      if (isCheckInWindow) {
        return (
          <TouchableOpacity
            style={styles.checkInButton}
            onPress={onCheckIn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.checkInButtonText}>Check-in</Text>
          </TouchableOpacity>
        );
      }
      return (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancelReservation}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      );
    }
    // Prazo encerrado
    if (timeStatus?.type === 'expired') {
      return (
        <View style={styles.lockedBadge}>
          <Icon name="lock-clock" size={12} color={Colors.textMuted} />
          <Text style={styles.lockedText}>Encerrado</Text>
        </View>
      );
    }
    // Janela ainda não abriu
    if (timeStatus?.type === 'pending') {
      return (
        <View style={styles.pendingBadge}>
          <Icon name="schedule" size={12} color={Colors.slate[400]} />
          <Text style={styles.pendingText}>{timeStatus.opensLabel}</Text>
        </View>
      );
    }
    if (item.isFull) {
      return <Icon name="group" size={24} color={Colors.primary} />;
    }
    return (
      <TouchableOpacity
        style={styles.reserveButton}
        onPress={onReserve}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.reserveButtonText}>Reservar</Text>
      </TouchableOpacity>
    );
  };

  // Card dimmed apenas quando encerrado e sem reserva própria
  const cardOpacity = (!hasReservation && timeStatus?.type === 'expired') ? 0.5 : item.opacity;

  return (
    <TouchableOpacity style={[styles.classCard, { opacity: cardOpacity }]} onPress={onPress}>
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
      {renderRightAction()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  classCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.backgroundDark, padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  classInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  classIconContainer: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginRight: 16 },
  classTime: { color: Colors.white, fontFamily: Fonts.sansBold, fontSize: 14, textTransform: 'uppercase', letterSpacing: -0.5 },
  classDetails: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  coachName: { fontSize: 11, color: Colors.slate[400] },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.slate[600], marginHorizontal: 8 },
  spots: { fontSize: 11, fontFamily: Fonts.sansBold },
  reserveButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  reserveButtonText: {
    color: Colors.backgroundDark,
    fontFamily: Fonts.sansBold,
    fontSize: 12,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: Colors.red[500],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  cancelButtonText: {
    color: Colors.red[500],
    fontFamily: Fonts.sansBold,
    fontSize: 12,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  lockedText: {
    color: Colors.textMuted,
    fontFamily: Fonts.sansBold,
    fontSize: 11,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  pendingText: {
    color: Colors.slate[400],
    fontFamily: Fonts.sansMedium,
    fontSize: 11,
  },
  actionLoader: {
    width: 60,
    alignItems: 'center',
  },
  checkInButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  checkInButtonText: {
    color: Colors.backgroundDark,
    fontFamily: Fonts.sansBold,
    fontSize: 12,
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
  },
  confirmedText: {
    color: Colors.green[500],
    fontFamily: Fonts.sansBold,
    fontSize: 12,
  },
  noShowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  noShowText: {
    color: Colors.textMuted,
    fontFamily: Fonts.sansBold,
    fontSize: 12,
  },
});

export default ClassListItem;
