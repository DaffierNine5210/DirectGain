import { StyleSheet, View } from 'react-native';

import ProfileSectionEmptyState from '../ProfileSectionEmptyState';

export default function ProfessionalExperience() {
  return (
    <View style={styles.root}>
      <ProfileSectionEmptyState
        compact
        icon="briefcase-outline"
        title="Add your experience"
        body="Work history, qualifications and résumé will live here."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 148,
  },
});
