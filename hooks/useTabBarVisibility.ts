import { useContext } from 'react';

import { TabBarVisibilityContext } from '../providers/TabBarVisibilityProvider';

export default function useTabBarVisibility() {
  const context = useContext(
    TabBarVisibilityContext,
  );

  if (!context) {
    throw new Error(
      'useTabBarVisibility must be used inside TabBarVisibilityProvider.',
    );
  }

  return context;
}