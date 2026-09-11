import { StyleSheet, View } from 'react-native';

import ProfileSectionEmptyState from '../ProfileSectionEmptyState';

export default function ProfessionalPortfolio() {
  return (
    <View style={styles.root}>
      <ProfileSectionEmptyState
        compact
        icon="images-outline"
        title="Build your portfolio"
        body="Show people the work you're proud of. Project cards will appear here."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 148,
  },
});
