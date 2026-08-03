import * as Haptics from 'expo-haptics';

export async function lightTap() {
  await Haptics.impactAsync(
    Haptics.ImpactFeedbackStyle.Light,
  );
}

export async function mediumTap() {
  await Haptics.impactAsync(
    Haptics.ImpactFeedbackStyle.Medium,
  );
}

export async function heavyTap() {
  await Haptics.impactAsync(
    Haptics.ImpactFeedbackStyle.Heavy,
  );
}

export async function successHaptic() {
  await Haptics.notificationAsync(
    Haptics.NotificationFeedbackType.Success,
  );
}

export async function warningHaptic() {
  await Haptics.notificationAsync(
    Haptics.NotificationFeedbackType.Warning,
  );
}

export async function errorHaptic() {
  await Haptics.notificationAsync(
    Haptics.NotificationFeedbackType.Error,
  );
}

export async function selectionHaptic() {
  await Haptics.selectionAsync();
}