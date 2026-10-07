import { Keyboard, StyleSheet, View } from 'react-native';

import DGReveal from '../DGReveal';
import DGSearchBar from '../DGSearchBar';

import { spacing } from '../../theme/designSystem';

type DiscoverSearchSectionProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export default function DiscoverSearchSection({
  value,
  onChangeText,
}: DiscoverSearchSectionProps) {
  return (
    <DGReveal delay={110} duration={410} distance={10}>
      <View style={styles.container}>
        <DGSearchBar
          value={value}
          onChangeText={onChangeText}
          placeholder="Filter what's on this page"
          accessibilityLabel="Filter what's on this page"
          showFilter={false}
          onSubmit={() => {
            Keyboard.dismiss();
          }}
        />
      </View>
    </DGReveal>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});
