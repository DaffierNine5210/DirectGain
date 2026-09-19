import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import {
  iconSize,
  palette,
} from '../../theme/designSystem';

type IdentityVerifiedMarkProps = {
  identityVerified: boolean;
};

export default function IdentityVerifiedMark({
  identityVerified,
}: IdentityVerifiedMarkProps) {
  if (!identityVerified) {
    return null;
  }

  return (
    <View
      style={styles.row}
      accessibilityRole="text"
      accessibilityLabel="Identity verified. Direct Gain has confirmed the identity of this account holder."
    >
      <Ionicons
        name="shield-checkmark"
        size={iconSize.xs}
        color={palette.opportunityGreen}
      />
      <Text style={styles.label}>Identity verified</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    maxWidth: '100%',
  },

  label: {
    color: palette.opportunityGreen,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
