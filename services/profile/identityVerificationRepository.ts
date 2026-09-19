import { supabase } from '../../lib/supabase';

import { getAuthenticatedUserId } from './profileRepository';

import type {
  OwnIdentityVerification,
  PublicIdentityVerified,
} from '../../types/identityVerification';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

type OwnerRpcRow = {
  status: unknown;
  submitted_at: unknown;
  reviewed_at: unknown;
  verified_at: unknown;
  rejection_reason: unknown;
};

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value.toLowerCase());
}

function isPresentTimestamp(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  return Number.isFinite(Date.parse(trimmed));
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function asOwnerRows(data: unknown): OwnerRpcRow[] {
  const list = Array.isArray(data) ? data : data ? [data] : [];
  const rows: OwnerRpcRow[] = [];

  for (const item of list) {
    const record = asRecord(item);

    if (!record) {
      continue;
    }

    rows.push({
      status: record.status,
      submitted_at: record.submitted_at,
      reviewed_at: record.reviewed_at,
      verified_at: record.verified_at,
      rejection_reason: record.rejection_reason,
    });
  }

  return rows;
}

function formatIdentityError(
  error: {
    message?: string;
    code?: string;
  } | null,
  fallback: string,
): string {
  if (!error?.message) {
    return fallback;
  }

  const message = error.message;
  const lowered = message.toLowerCase();
  const code = error.code ?? '';

  if (
    code === '42501' ||
    lowered.includes('row-level security') ||
    lowered.includes('permission denied')
  ) {
    return 'You do not have permission to do that.';
  }

  if (lowered.includes('signed in')) {
    return 'Sign in to continue.';
  }

  if (lowered.includes('profile could not be found')) {
    return 'Your profile could not be found.';
  }

  if (lowered.includes('already in review')) {
    return 'Identity verification is already in review.';
  }

  if (lowered.includes('already verified')) {
    return 'Your identity is already verified.';
  }

  if (lowered.includes('cannot be withdrawn')) {
    if (lowered.includes('rejected')) {
      return 'Rejected identity verification cannot be withdrawn. Submit again instead.';
    }

    if (lowered.includes('verified')) {
      return 'Verified identity cannot be withdrawn.';
    }

    return 'This identity verification cannot be withdrawn.';
  }

  if (lowered.includes('no pending')) {
    return 'There is no pending identity verification to withdraw.';
  }

  if (lowered.includes('cannot be submitted')) {
    return 'Identity verification cannot be submitted.';
  }

  return fallback;
}

function mapOwnerRow(
  row: OwnerRpcRow,
): OwnIdentityVerification | null {
  if (row.status === 'pending') {
    if (
      !isPresentTimestamp(row.submitted_at) ||
      row.reviewed_at != null ||
      row.verified_at != null ||
      row.rejection_reason != null
    ) {
      return null;
    }

    return {
      kind: 'pending',
      submittedAt: row.submitted_at.trim(),
    };
  }

  if (row.status === 'verified') {
    if (
      !isPresentTimestamp(row.submitted_at) ||
      !isPresentTimestamp(row.reviewed_at) ||
      !isPresentTimestamp(row.verified_at) ||
      row.rejection_reason != null
    ) {
      return null;
    }

    return {
      kind: 'verified',
      submittedAt: row.submitted_at.trim(),
      reviewedAt: row.reviewed_at.trim(),
      verifiedAt: row.verified_at.trim(),
    };
  }

  if (row.status === 'rejected') {
    if (
      !isPresentTimestamp(row.submitted_at) ||
      !isPresentTimestamp(row.reviewed_at) ||
      row.verified_at != null ||
      typeof row.rejection_reason !== 'string' ||
      !row.rejection_reason.trim()
    ) {
      return null;
    }

    return {
      kind: 'rejected',
      submittedAt: row.submitted_at.trim(),
      reviewedAt: row.reviewed_at.trim(),
      rejectionReason: row.rejection_reason.trim(),
    };
  }

  return null;
}

function mapOwnerRpcData(
  data: unknown,
): OwnIdentityVerification | null {
  const rows = asOwnerRows(data);

  if (rows.length === 0) {
    return {
      kind: 'not_submitted',
    };
  }

  if (rows.length !== 1) {
    return null;
  }

  return mapOwnerRow(rows[0]);
}

async function callOwnerStatusRpc(
  rpcName:
    | 'get_own_identity_verification'
    | 'submit_own_identity_verification',
  fallback: string,
): Promise<{
  state: OwnIdentityVerification | null;
  error: string | null;
}> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      state: null,
      error: 'Sign in to continue.',
    };
  }

  const result = await supabase.rpc(rpcName);

  if (result.error) {
    return {
      state: null,
      error: formatIdentityError(result.error, fallback),
    };
  }

  const state = mapOwnerRpcData(result.data);

  if (!state) {
    return {
      state: null,
      error: fallback,
    };
  }

  return {
    state,
    error: null,
  };
}

export async function getOwnIdentityVerification(): Promise<{
  state: OwnIdentityVerification | null;
  error: string | null;
}> {
  return callOwnerStatusRpc(
    'get_own_identity_verification',
    'Your identity verification could not be loaded. Try again.',
  );
}

export async function submitOwnIdentityVerification(): Promise<{
  state: OwnIdentityVerification | null;
  error: string | null;
}> {
  const result = await callOwnerStatusRpc(
    'submit_own_identity_verification',
    'Your identity verification could not be submitted. Try again.',
  );

  if (result.error) {
    return result;
  }

  if (result.state?.kind !== 'pending') {
    return {
      state: null,
      error:
        'Your identity verification could not be submitted. Try again.',
    };
  }

  return result;
}

export async function withdrawOwnPendingIdentityVerification(): Promise<{
  state: OwnIdentityVerification | null;
  error: string | null;
}> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      state: null,
      error: 'Sign in to continue.',
    };
  }

  const result = await supabase.rpc(
    'withdraw_own_pending_identity_verification',
  );

  if (result.error) {
    return {
      state: null,
      error: formatIdentityError(
        result.error,
        'Your identity verification could not be withdrawn. Try again.',
      ),
    };
  }

  return {
    state: {
      kind: 'not_submitted',
    },
    error: null,
  };
}

export async function getProfileIdentityVerified(
  profileId: string,
): Promise<{
  result: PublicIdentityVerified | null;
  error: string | null;
}> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      result: null,
      error: 'Sign in to continue.',
    };
  }

  const id = profileId.trim().toLowerCase();

  if (!isUuid(id)) {
    return {
      result: null,
      error: 'This profile could not be found.',
    };
  }

  const rpcResult = await supabase.rpc(
    'get_profile_identity_verified',
    {
      p_profile_id: id,
    },
  );

  if (rpcResult.error) {
    return {
      result: null,
      error: formatIdentityError(
        rpcResult.error,
        'Identity verification could not be loaded. Try again.',
      ),
    };
  }

  if (rpcResult.data === true) {
    return {
      result: {
        profileId: id,
        verified: true,
      },
      error: null,
    };
  }

  if (rpcResult.data === false) {
    return {
      result: {
        profileId: id,
        verified: false,
      },
      error: null,
    };
  }

  return {
    result: null,
    error:
      'Identity verification could not be loaded. Try again.',
  };
}
