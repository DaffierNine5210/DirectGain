import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  formatProfessionalCredentialExpiry,
  formatProfessionalCredentialIssued,
  formatProfessionalCredentialTypeLabel,
} from '../../../services/profile/professionalProfileAdapter';

import type { ProfessionalCredential } from '../../../types/professionalProfile';

import {
  alpha,
  radius,
  spacing,
  surface,
  textColor,
} from '../../../theme/designSystem';

type ProfessionalCredentialCardProps = {
  credential: Pick<
    ProfessionalCredential,
    | 'credentialType'
    | 'name'
    | 'issuer'
    | 'issuedYear'
    | 'issuedMonth'
    | 'expiresYear'
    | 'expiresMonth'
    | 'doesNotExpire'
  >;
  footer?: ReactNode;
};

export default function ProfessionalCredentialCard({
  credential,
  footer,
}: ProfessionalCredentialCardProps) {
  const issued = formatProfessionalCredentialIssued(credential);
  const expiry = formatProfessionalCredentialExpiry(credential);

  return (
    <View style={styles.card}>
      <Text style={styles.type}>
        {formatProfessionalCredentialTypeLabel(
          credential.credentialType,
        )}
      </Text>
      <Text style={styles.name} numberOfLines={2}>
        {credential.name}
      </Text>
      {credential.issuer ? (
        <Text style={styles.issuer} numberOfLines={2}>
          {credential.issuer}
        </Text>
      ) : null}
      {issued ? <Text style={styles.meta}>{issued}</Text> : null}
      {expiry ? <Text style={styles.meta}>{expiry}</Text> : null}
      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: alpha.white08,
    backgroundColor: surface.cardRaised,
    gap: 4,
  },

  type: {
    color: textColor.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },

  name: {
    color: textColor.primary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
  },

  issuer: {
    color: textColor.secondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },

  meta: {
    color: textColor.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
});
