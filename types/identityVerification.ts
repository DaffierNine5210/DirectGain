export type OwnIdentityVerification =
  | {
      kind: 'not_submitted';
    }
  | {
      kind: 'pending';
      submittedAt: string;
    }
  | {
      kind: 'verified';
      submittedAt: string;
      reviewedAt: string;
      verifiedAt: string;
    }
  | {
      kind: 'rejected';
      submittedAt: string;
      reviewedAt: string;
      rejectionReason: string;
    };

export type PublicIdentityVerified = {
  profileId: string;
  verified: boolean;
};
