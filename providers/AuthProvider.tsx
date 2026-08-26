import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {
  AuthError,
  Session,
  User,
} from '@supabase/supabase-js';

import { supabase } from '../lib/supabase';

import type {
  AccountType,
} from '../navigation/AuthStack';

/*
 * Direct Gain now uses real Supabase
 * authentication.
 *
 * The old fake development session
 * system is intentionally disabled.
 */
const DEVELOPMENT_AUTH_ENABLED =
  false;

const DEV_SESSION_KEY =
  '@direct-gain/development-session';

const DEV_ONBOARDING_KEY =
  '@direct-gain/onboarding-active';

type SignUpInput = {
  accountType:
    AccountType;

  fullName:
    string;

  email:
    string;

  password:
    string;
};

type SignInInput = {
  email:
    string;

  password:
    string;
};

type SignUpResult = {
  user:
    User | null;

  session:
    Session | null;

  error:
    AuthError | null;
};

type SignInResult = {
  user:
    User | null;

  session:
    Session | null;

  error:
    AuthError | null;
};

type AuthContextType = {
  session:
    Session | null;

  loading:
    boolean;

  isAuthenticated:
    boolean;

  isOnboarding:
    boolean;

  isDevelopmentAuth:
    boolean;

  signUp: (
    input:
      SignUpInput,
  ) => Promise<SignUpResult>;

  signIn: (
    input:
      SignInInput,
  ) => Promise<SignInResult>;

  completeOnboarding:
    () => Promise<void>;

  signOut:
    () => Promise<void>;
};

const AuthContext =
  createContext<AuthContextType>({
    session:
      null,

    loading:
      true,

    isAuthenticated:
      false,

    isOnboarding:
      false,

    isDevelopmentAuth:
      DEVELOPMENT_AUTH_ENABLED,

    signUp:
      async () => ({
        user:
          null,

        session:
          null,

        error:
          null,
      }),

    signIn:
      async () => ({
        user:
          null,

        session:
          null,

        error:
          null,
      }),

    completeOnboarding:
      async () =>
        undefined,

    signOut:
      async () =>
        undefined,
  });

function createDevelopmentSession({
  accountType,
  fullName,
  email,
}: Omit<
  SignUpInput,
  'password'
>): Session {
  const createdAt =
    new Date().toISOString();

  const userId =
    `dev-user-${Date.now()}`;

  const developmentUser = {
    id:
      userId,

    aud:
      'authenticated',

    role:
      'authenticated',

    email,

    email_confirmed_at:
      createdAt,

    confirmed_at:
      createdAt,

    last_sign_in_at:
      createdAt,

    app_metadata: {
      provider:
        'email',

      providers: [
        'email',
      ],
    },

    user_metadata: {
      full_name:
        fullName,

      account_type:
        accountType,

      development_account:
        true,
    },

    identities:
      [],

    created_at:
      createdAt,

    updated_at:
      createdAt,

    is_anonymous:
      false,
  } as User;

  return {
    access_token:
      `development-access-${userId}`,

    refresh_token:
      `development-refresh-${userId}`,

    token_type:
      'bearer',

    expires_in:
      60 *
      60 *
      24 *
      365,

    expires_at:
      Math.floor(
        Date.now() /
          1000,
      ) +
      60 *
        60 *
        24 *
        365,

    user:
      developmentUser,
  } as Session;
}

export function AuthProvider({
  children,
}: {
  children:
    React.ReactNode;
}) {
  const [
    session,
    setSession,
  ] =
    useState<Session | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    );

  const [
    isOnboarding,
    setIsOnboarding,
  ] =
    useState(
      false,
    );

  /*
   * Restore whichever authentication
   * system Direct Gain is currently using.
   *
   * DEVELOPMENT_AUTH_ENABLED is now false,
   * so normal app use restores the real
   * Supabase session from AsyncStorage.
   */
  useEffect(() => {
    if (
      DEVELOPMENT_AUTH_ENABLED
    ) {
      const restoreDevelopmentAuth =
        async () => {
          try {
            const [
              storedSession,
              storedOnboarding,
            ] =
              await Promise.all([
                AsyncStorage.getItem(
                  DEV_SESSION_KEY,
                ),

                AsyncStorage.getItem(
                  DEV_ONBOARDING_KEY,
                ),
              ]);

          if (
            storedSession
          ) {
            const restoredSession =
              JSON.parse(
                storedSession,
              ) as Session;

            setSession(
              restoredSession,
            );
          }

          setIsOnboarding(
            storedOnboarding ===
              'true',
          );
        } catch (
          error
        ) {
          console.error(
            'Unable to restore development authentication:',
            error,
          );
        } finally {
          setLoading(
            false,
          );
        }
      };

      void restoreDevelopmentAuth();

      return;
    }

    let isMounted =
      true;

    const restoreSession =
      async () => {
        const {
          data,
          error,
        } =
          await supabase.auth.getSession();

        if (
          !isMounted
        ) {
          return;
        }

        if (error) {
          console.error(
            'Unable to restore Supabase session:',
            error.message,
          );
        }

        setSession(
          data.session,
        );

        setLoading(
          false,
        );
      };

    void restoreSession();

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (
          event,
          nextSession,
        ) => {
          if (
            !isMounted
          ) {
            return;
          }

          setSession(
            nextSession,
          );

          setLoading(
            false,
          );

          if (
            event ===
            'SIGNED_OUT'
          ) {
            setIsOnboarding(
              false,
            );
          }
        },
      );

    return () => {
      isMounted =
        false;

      subscription.unsubscribe();
    };
  }, []);

  /*
   * Create a new Direct Gain account.
   */
  const signUp =
    async ({
      accountType,
      fullName,
      email,
      password,
    }: SignUpInput):
      Promise<SignUpResult> => {
      const normalizedName =
        fullName.trim();

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      if (
        DEVELOPMENT_AUTH_ENABLED
      ) {
        await new Promise<void>(
          resolve => {
            setTimeout(
              resolve,
              450,
            );
          },
        );

        const developmentSession =
          createDevelopmentSession({
            accountType,

            fullName:
              normalizedName,

            email:
              normalizedEmail,
          });

        setSession(
          developmentSession,
        );

        setIsOnboarding(
          true,
        );

        await Promise.all([
          AsyncStorage.setItem(
            DEV_SESSION_KEY,
            JSON.stringify(
              developmentSession,
            ),
          ),

          AsyncStorage.setItem(
            DEV_ONBOARDING_KEY,
            'true',
          ),
        ]);

        return {
          user:
            developmentSession.user,

          session:
            developmentSession,

          error:
            null,
        };
      }

      const {
        data,
        error,
      } =
        await supabase.auth.signUp({
          email:
            normalizedEmail,

          password,

          options: {
            data: {
              full_name:
                normalizedName,

              account_type:
                accountType,
            },
          },
        });

      if (
        !error &&
        data.session
      ) {
        setSession(
          data.session,
        );

        /*
         * Newly registered users still
         * need to complete Direct Gain's
         * onboarding flow.
         */
        setIsOnboarding(
          true,
        );
      }

      return {
        user:
          data.user,

        session:
          data.session,

        error,
      };
    };

  /*
   * Sign into an existing Supabase account.
   */
  const signIn =
    async ({
      email,
      password,
    }: SignInInput):
      Promise<SignInResult> => {
      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      if (
        DEVELOPMENT_AUTH_ENABLED
      ) {
        console.warn(
          '[Direct Gain] Real sign-in requested while development authentication is enabled.',
        );

        return {
          user:
            null,

          session:
            null,

          error:
            null,
        };
      }

      const {
        data,
        error,
      } =
        await supabase.auth.signInWithPassword({
          email:
            normalizedEmail,

          password,
        });

      if (error) {
        console.warn(
          '[Direct Gain] Supabase sign-in failed:',
          error.message,
        );

        return {
          user:
            data.user,

          session:
            data.session,

          error,
        };
      }

      setSession(
        data.session,
      );

      /*
       * Existing users go directly into
       * Direct Gain rather than being sent
       * through onboarding again.
       */
      setIsOnboarding(
        false,
      );

      console.log(
        '[Direct Gain] Signed in with Supabase:',
        data.user?.id,
      );

      return {
        user:
          data.user,

        session:
          data.session,

        error:
          null,
      };
    };

  const completeOnboarding =
    async () => {
      if (!session) {
        console.error(
          'Onboarding cannot finish without an active session.',
        );

        return;
      }

      setIsOnboarding(
        false,
      );

      if (
        DEVELOPMENT_AUTH_ENABLED
      ) {
        await AsyncStorage.setItem(
          DEV_ONBOARDING_KEY,
          'false',
        );
      }
    };

  const signOut =
    async () => {
      if (
        DEVELOPMENT_AUTH_ENABLED
      ) {
        await AsyncStorage.multiRemove([
          DEV_SESSION_KEY,
          DEV_ONBOARDING_KEY,
        ]);

        setSession(
          null,
        );

        setIsOnboarding(
          false,
        );

        return;
      }

      const {
        error,
      } =
        await supabase.auth.signOut();

      if (error) {
        console.error(
          'Unable to sign out:',
          error.message,
        );

        return;
      }

      setSession(
        null,
      );

      setIsOnboarding(
        false,
      );

      console.log(
        '[Direct Gain] Signed out.',
      );
    };

  const value =
    useMemo(
      () => ({
        session,

        loading,

        isAuthenticated:
          Boolean(
            session,
          ),

        isOnboarding,

        isDevelopmentAuth:
          DEVELOPMENT_AUTH_ENABLED,

        signUp,

        signIn,

        completeOnboarding,

        signOut,
      }),
      [
        session,
        loading,
        isOnboarding,
      ],
    );

  return (
    <AuthContext.Provider
      value={
        value
      }
    >
      {children}
    </AuthContext.Provider>
  );
}

export {
  AuthContext,
};

export default AuthProvider;