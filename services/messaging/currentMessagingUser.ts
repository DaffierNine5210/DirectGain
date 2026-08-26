import { supabase } from '../../lib/supabase';

export type MessagingUserIdentity = {
  userId: string;
  email?: string;
};

export async function getCurrentMessagingUser(): Promise<
  MessagingUserIdentity | null
> {
  const {
    data,
    error,
  } =
    await supabase.auth.getUser();

  if (error) {
    console.warn(
      '[Direct Gain] Unable to load current messaging user:',
      error.message,
    );

    return null;
  }

  if (!data.user) {
    return null;
  }

  return {
    userId:
      data.user.id,

    email:
      data.user.email ??
      undefined,
  };
}