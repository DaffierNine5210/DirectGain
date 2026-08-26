import type {
  DealAgreement,
} from '../types/DealAgreement';

export const dealAgreements:
  DealAgreement[] = [];

export function getDealAgreementById(
  agreementId: string,
) {
  return dealAgreements.find(
    (agreement) =>
      agreement.id === agreementId,
  );
}

export function getDealAgreementsForConversation(
  conversationId: string,
) {
  return dealAgreements.filter(
    (agreement) =>
      agreement.conversationId ===
      conversationId,
  );
}

export function getActiveDealAgreementForConversation(
  conversationId: string,
) {
  return dealAgreements.find(
    (agreement) =>
      agreement.conversationId ===
        conversationId &&
      (
        agreement.status === 'draft' ||
        agreement.status === 'pending' ||
        agreement.status === 'confirmed'
      ),
  );
}