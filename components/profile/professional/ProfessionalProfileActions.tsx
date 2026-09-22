import { Alert, StyleSheet, View } from 'react-native';

import DGButton from '../../DGButton';

import { layout, spacing } from '../../../theme/designSystem';

type ProfessionalProfileActionsProps = {
  onMessage?: () => void;
  loading?: boolean;
  visitor?: boolean;
  professionalIsLive?: boolean;
};

function ownerPreviewMessageBody(professionalIsLive: boolean) {
  return professionalIsLive
    ? 'This is your owner preview. Visitors can message you from your live Professional profile.'
    : 'Message will be available to visitors when your Professional profile is live.';
}

export default function ProfessionalProfileActions({
  onMessage,
  loading = false,
  visitor = false,
  professionalIsLive = false,
}: ProfessionalProfileActionsProps) {
  const ownerMessageBody =
    ownerPreviewMessageBody(professionalIsLive);

  return (
    <View style={styles.root}>
      <DGButton
        title="Message"
        variant="primary"
        size="small"
        icon="chatbubble-outline"
        fullWidth
        loading={loading}
        disabled={loading}
        onPress={
          onMessage ??
          (() => {
            Alert.alert('Message', ownerMessageBody);
          })
        }
        accessibilityLabel="Message"
        accessibilityHint={
          visitor
            ? 'Open a conversation with this member'
            : ownerMessageBody
        }
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    maxWidth: layout.maximumContentWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },

  button: {
    minHeight: 44,
  },
});
