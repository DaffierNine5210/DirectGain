import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import ProfileAboutSection from './ProfileAboutSection';
import ProfileContentTabs, {
  type ProfileContentTabKey,
} from './ProfileContentTabs';
import ProfileSectionEmptyState from './ProfileSectionEmptyState';

import type { ProfileAboutContent } from './profilePresentation';
import type { ProfileHeroMode } from './profilePresentation';

import { layout, spacing } from '../../theme/designSystem';

type ProfileContentAreaProps = {
  mode: ProfileHeroMode;
  selectedTab: ProfileContentTabKey;
  onSelectTab: (tab: ProfileContentTabKey) => void;
  about: ProfileAboutContent;
  editProfileDisabled?: boolean;
  onEditProfilePress?: () => void;
  ownerWorkManagement?: ReactNode;
};

export default function ProfileContentArea({
  mode,
  selectedTab,
  onSelectTab,
  about,
  editProfileDisabled = false,
  onEditProfilePress,
  ownerWorkManagement = null,
}: ProfileContentAreaProps) {
  return (
    <View style={styles.root}>
      <ProfileContentTabs
        selectedTab={selectedTab}
        onSelectTab={onSelectTab}
      />

      <View style={styles.panel}>
        {selectedTab === 'posts' ? (
          <ProfileSectionEmptyState
            icon="images-outline"
            title="No posts yet"
            body={
              mode === 'owner'
                ? "Share something when you're ready."
                : undefined
            }
          />
        ) : null}

        {selectedTab === 'work' ? (
          <View style={styles.workPanel}>
            <ProfileSectionEmptyState
              icon="briefcase-outline"
              title="No public work to show yet."
              body={
                mode === 'owner'
                  ? 'Work you choose to share on your profile will appear here.'
                  : undefined
              }
            />
            {mode === 'owner' && ownerWorkManagement
              ? ownerWorkManagement
              : null}
          </View>
        ) : null}

        {selectedTab === 'reviews' ? (
          <ProfileSectionEmptyState
            icon="star-outline"
            title="No reviews yet"
            body={
              mode === 'owner'
                ? 'Reviews from Direct Gain activity will appear here.'
                : undefined
            }
          />
        ) : null}

        {selectedTab === 'about' ? (
          <ProfileAboutSection
            about={about}
            mode={mode}
            editProfileDisabled={editProfileDisabled}
            onEditProfilePress={onEditProfilePress}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    maxWidth: layout.maximumContentWidth,
    alignSelf: 'center',
    paddingTop: spacing.sm,
  },

  panel: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },

  workPanel: {
    gap: spacing.sm,
  },
});
