import { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import DGButton from '../../components/DGButton';
import type {
  AccountType,
  AuthStackParamList,
} from '../../navigation/AuthStack';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'ChooseProfile'
>;

export default function ChooseProfileScreen({
  navigation,
}: Props) {
  const [selectedProfile, setSelectedProfile] =
    useState<AccountType>('personal');

  function handleContinue() {
    navigation.navigate('Register', {
      accountType: selectedProfile,
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#080B09"
      />

      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>
            GETTING STARTED
          </Text>

          <Text style={styles.title}>
            How will you use{'\n'}
            <Text style={styles.titleHighlight}>
              Direct Gain?
            </Text>
          </Text>

          <Text style={styles.subtitle}>
            Choose how you would like to begin. You can
            add or switch profiles later.
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          <ProfileCard
            title="Personal"
            eyebrow="FOR EVERYDAY USERS"
            description="Buy and sell, find work, discover local opportunities and connect with your community."
            features={[
              'Use the Direct Gain Market',
              'Apply for jobs and opportunities',
              'Build your personal Gain Score',
            ]}
            symbol="●"
            selected={selectedProfile === 'personal'}
            onPress={() =>
              setSelectedProfile('personal')
            }
          />

          <ProfileCard
            title="Business or Professional"
            eyebrow="FOR BUSINESS GROWTH"
            description="Promote your services, find clients, hire workers and build a trusted business presence."
            features={[
              'Advertise services and opportunities',
              'Find clients or hire workers',
              'Build a trusted business reputation',
            ]}
            symbol="◆"
            selected={selectedProfile === 'business'}
            onPress={() =>
              setSelectedProfile('business')
            }
          />
        </View>

        <View style={styles.notice}>
          <View style={styles.noticeIcon}>
            <Text style={styles.noticeIconText}>
              ↗
            </Text>
          </View>

          <View style={styles.noticeContent}>
            <Text style={styles.noticeTitle}>
              Your choice is flexible
            </Text>

            <Text style={styles.noticeText}>
              One Direct Gain account can support
              multiple profiles as you grow.
            </Text>
          </View>
        </View>

        <DGButton
          title="Continue"
          size="large"
          fullWidth
          onPress={handleContinue}
        />

        <DGButton
          title="I already have an account"
          variant="ghost"
          fullWidth
          onPress={() =>
            navigation.navigate('Login')
          }
          style={styles.loginButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

type ProfileCardProps = {
  title: string;
  eyebrow: string;
  description: string;
  features: string[];
  symbol: string;
  selected: boolean;
  onPress: () => void;
};

function ProfileCard({
  title,
  eyebrow,
  description,
  features,
  symbol,
  selected,
  onPress,
}: ProfileCardProps) {
  return (
    <View
      onTouchEnd={onPress}
      style={[
        styles.profileCard,
        selected && styles.profileCardSelected,
      ]}
    >
      <View style={styles.profileCardTopRow}>
        <View
          style={[
            styles.symbolContainer,
            selected &&
              styles.symbolContainerSelected,
          ]}
        >
          <Text style={styles.symbol}>
            {symbol}
          </Text>
        </View>

        <View
          style={[
            styles.selectionCircle,
            selected &&
              styles.selectionCircleSelected,
          ]}
        >
          {selected ? (
            <View style={styles.selectionDot} />
          ) : null}
        </View>
      </View>

      <Text style={styles.cardEyebrow}>
        {eyebrow}
      </Text>

      <Text style={styles.cardTitle}>
        {title}
      </Text>

      <Text style={styles.cardDescription}>
        {description}
      </Text>

      <View style={styles.featureList}>
        {features.map((feature) => (
          <View
            key={feature}
            style={styles.featureRow}
          >
            <View style={styles.featureDot} />

            <Text style={styles.featureText}>
              {feature}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#080B09',
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 34,
    paddingBottom: 30,
  },

  glowTop: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor:
      'rgba(158, 246, 90, 0.05)',
  },

  glowBottom: {
    position: 'absolute',
    bottom: 20,
    left: -140,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor:
      'rgba(158, 246, 90, 0.03)',
  },

  header: {
    marginBottom: 26,
  },

  eyebrow: {
    marginBottom: 12,
    color: '#9EF65A',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '900',
    letterSpacing: -1.2,
  },

  titleHighlight: {
    color: '#9EF65A',
  },

  subtitle: {
    maxWidth: 360,
    marginTop: 14,
    color: '#9DA69F',
    fontSize: 15,
    lineHeight: 23,
  },

  cardsContainer: {
    gap: 14,
  },

  profileCard: {
    width: '100%',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#252C26',
    backgroundColor: '#111512',
  },

  profileCardSelected: {
    borderColor: '#9EF65A',
    backgroundColor: '#151C15',
    shadowColor: '#9EF65A',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 4,
  },

  profileCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  symbolContainer: {
    width: 52,
    height: 52,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2B342D',
    backgroundColor: '#1A201B',
  },

  symbolContainerSelected: {
    borderColor: '#9EF65A',
    backgroundColor: '#9EF65A',
  },

  symbol: {
    color: '#071004',
    fontSize: 24,
    fontWeight: '900',
  },

  selectionCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#444C46',
  },

  selectionCircleSelected: {
    borderColor: '#9EF65A',
  },

  selectionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#9EF65A',
  },

  cardEyebrow: {
    marginBottom: 6,
    color: '#9EF65A',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  cardTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  cardDescription: {
    marginTop: 9,
    color: '#AAB2AC',
    fontSize: 14,
    lineHeight: 21,
  },

  featureList: {
    marginTop: 17,
    gap: 9,
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  featureDot: {
    width: 6,
    height: 6,
    marginRight: 10,
    borderRadius: 3,
    backgroundColor: '#9EF65A',
  },

  featureText: {
    flex: 1,
    color: '#D9DEDA',
    fontSize: 13,
    fontWeight: '600',
  },

  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 22,
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#202721',
    backgroundColor: '#0E120F',
  },

  noticeIcon: {
    width: 38,
    height: 38,
    marginRight: 12,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#192018',
  },

  noticeIconText: {
    color: '#9EF65A',
    fontSize: 19,
    fontWeight: '900',
  },

  noticeContent: {
    flex: 1,
  },

  noticeTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  noticeText: {
    marginTop: 3,
    color: '#929A94',
    fontSize: 12,
    lineHeight: 17,
  },

  loginButton: {
    marginTop: 4,
  },
});