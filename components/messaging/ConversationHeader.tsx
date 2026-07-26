import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../theme/colors';
import type {
  ConversationContext,
  ConversationParticipant,
} from '../../types/Messaging';

type Props = {
  participant: ConversationParticipant;
  context: ConversationContext;
  onBackPress: () => void;
  onProfilePress?: () => void;
  onCallPress?: () => void;
  onMorePress?: () => void;
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getContextIcon(
  type: ConversationContext['type'],
):
  | 'storefront-outline'
  | 'briefcase-outline'
  | 'hammer-outline'
  | 'shield-checkmark-outline' {
  if (type === 'job') {
    return 'briefcase-outline';
  }

  if (type === 'auction') {
    return 'hammer-outline';
  }

  if (type === 'support') {
    return 'shield-checkmark-outline';
  }

  return 'storefront-outline';
}

function getContextLabel(
  type: ConversationContext['type'],
): string {
  if (type === 'job') {
    return 'Job';
  }

  if (type === 'auction') {
    return 'Auction';
  }

  if (type === 'support') {
    return 'Support';
  }

  return 'Market';
}

export default function ConversationHeader({
  participant,
  context,
  onBackPress,
  onProfilePress,
  onCallPress,
  onMorePress,
}: Props) {
  const initials = getInitials(participant.name);

  return (
    <View style={styles.container}>
      <View style={styles.mainRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBackPress}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={colors.text}
          />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open ${participant.name} profile`}
          onPress={onProfilePress}
          style={({ pressed }) => [
            styles.profileArea,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.avatarArea}>
            <View style={styles.avatar}>
              {participant.profileImage ? (
                <Image
                  source={participant.profileImage}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarInitials}>
                  {initials}
                </Text>
              )}
            </View>

            {participant.isOnline && (
              <View style={styles.onlineRing}>
                <View style={styles.onlineDot} />
              </View>
            )}
          </View>

          <View style={styles.profileContent}>
            <View style={styles.nameRow}>
              <Text
                style={styles.name}
                numberOfLines={1}
              >
                {participant.name}
              </Text>

              {participant.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons
                    name="checkmark"
                    size={11}
                    color="#080B09"
                  />
                </View>
              )}
            </View>

            <Text
              style={[
                styles.statusText,
                participant.isOnline &&
                  styles.onlineText,
              ]}
              numberOfLines={1}
            >
              {participant.isOnline
                ? 'Online now'
                : participant.responseTime ??
                  'Direct Gain member'}
            </Text>
          </View>
        </Pressable>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Call participant"
            onPress={onCallPress}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="call-outline"
              size={19}
              color={colors.text}
            />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open conversation options"
            onPress={onMorePress}
            style={({ pressed }) => [
              styles.iconButton,
              styles.lastIconButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={colors.text}
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.trustRow}>
        <View style={styles.contextBadge}>
          <Ionicons
            name={getContextIcon(context.type)}
            size={13}
            color={colors.primary}
          />

          <Text style={styles.contextBadgeText}>
            {getContextLabel(context.type)}
          </Text>
        </View>

        <Text
          style={styles.contextTitle}
          numberOfLines={1}
        >
          {context.title}
        </Text>

        {participant.gainScore !== undefined && (
          <View style={styles.gainScoreBadge}>
            <Ionicons
              name="trending-up"
              size={12}
              color={colors.primary}
            />

            <Text style={styles.gainScoreText}>
              {participant.gainScore}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.detailsRow}>
        {participant.rating !== undefined && (
          <View style={styles.detailBadge}>
            <Ionicons
              name="star"
              size={12}
              color={colors.primary}
            />

            <Text style={styles.detailText}>
              {participant.rating.toFixed(1)}
              {participant.reviewCount !== undefined
                ? ` (${participant.reviewCount})`
                : ''}
            </Text>
          </View>
        )}

        {participant.isVerified && (
          <View style={styles.detailBadge}>
            <Ionicons
              name="shield-checkmark-outline"
              size={12}
              color={colors.primary}
            />

            <Text style={styles.detailText}>
              Verified
            </Text>
          </View>
        )}

        {participant.responseTime && (
          <View style={styles.detailBadge}>
            <Ionicons
              name="flash-outline"
              size={12}
              color={colors.primary}
            />

            <Text
              style={styles.detailText}
              numberOfLines={1}
            >
              {participant.responseTime}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor:
      'rgba(255, 255, 255, 0.07)',
    backgroundColor: '#080B09',
  },

  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconButton: {
    width: 42,
    height: 42,
    marginRight: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor:
      'rgba(255, 255, 255, 0.10)',
    backgroundColor:
      'rgba(255, 255, 255, 0.045)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  lastIconButton: {
    marginRight: 0,
  },

  profileArea: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatarArea: {
    position: 'relative',
    marginRight: 10,
  },

  avatar: {
    width: 46,
    height: 46,
    overflow: 'hidden',
    borderRadius: 15,
    borderWidth: 1,
    borderColor:
      'rgba(158, 246, 90, 0.18)',
    backgroundColor:
      'rgba(158, 246, 90, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarImage: {
    width: '100%',
    height: '100%',
  },

  avatarInitials: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '900',
  },

  onlineRing: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 16,
    height: 16,
    padding: 3,
    borderRadius: 8,
    backgroundColor: '#080B09',
  },

  onlineDot: {
    flex: 1,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },

  profileContent: {
    flex: 1,
    minWidth: 0,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  name: {
    flexShrink: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },

  verifiedBadge: {
    width: 18,
    height: 18,
    marginLeft: 6,
    borderRadius: 7,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusText: {
    marginTop: 3,
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
  },

  onlineText: {
    color: colors.primary,
  },

  actions: {
    marginLeft: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },

  trustRow: {
    marginTop: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },

  contextBadge: {
    marginRight: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
    backgroundColor:
      'rgba(158, 246, 90, 0.07)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  contextBadgeText: {
    marginLeft: 5,
    color: colors.text,
    fontSize: 8,
    fontWeight: '800',
  },

  contextTitle: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },

  gainScoreBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
    borderWidth: 1,
    borderColor:
      'rgba(158, 246, 90, 0.15)',
    backgroundColor:
      'rgba(158, 246, 90, 0.05)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  gainScoreText: {
    marginLeft: 5,
    color: colors.primary,
    fontSize: 9,
    fontWeight: '900',
  },

  detailsRow: {
    marginTop: 9,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  detailBadge: {
    maxWidth: '100%',
    marginRight: 7,
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
    backgroundColor:
      'rgba(255, 255, 255, 0.035)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailText: {
    flexShrink: 1,
    marginLeft: 5,
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '700',
  },

  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.985 }],
  },
});