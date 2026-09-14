import type {
  ProfessionalAvailability,
  ProfessionalCredential,
  ProfessionalCredentialSaveInput,
  ProfessionalCredentialType,
  ProfessionalExperience,
  ProfessionalExperienceSaveInput,
  ProfessionalProfileCore,
  ProfessionalSkill,
  ProfessionalWorkPreference,
  SaveOwnProfessionalProfileInput,
} from '../../types/professionalProfile';

import {
  PROFESSIONAL_ABOUT_MAX,
  PROFESSIONAL_AVAILABILITIES,
  PROFESSIONAL_HEADLINE_MAX,
  PROFESSIONAL_HEADLINE_MIN,
  PROFESSIONAL_SERVICE_AREA_MAX,
  PROFESSIONAL_SKILL_NAME_MAX,
  PROFESSIONAL_SKILL_NAME_MIN,
  PROFESSIONAL_CREDENTIAL_TYPES,
  PROFESSIONAL_SKILLS_MAX,
  PROFESSIONAL_WORK_PREFERENCES,
} from '../../types/professionalProfile';

export type ProfessionalProfileRow = {
  profile_id: string;
  professional_headline: string | null;
  professional_about: string | null;
  availability: string | null;
  service_area: string | null;
  work_preference: string | null;
};

export type ProfessionalSkillRow = {
  id: string;
  profile_id: string;
  name: string;
  position: number;
};

export function optionalProfessionalText(
  value: string | null | undefined,
): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed ? trimmed : null;
}

export function isProfessionalAvailability(
  value: unknown,
): value is ProfessionalAvailability {
  return PROFESSIONAL_AVAILABILITIES.some(
    item => item === value,
  );
}

export function isProfessionalWorkPreference(
  value: unknown,
): value is ProfessionalWorkPreference {
  return PROFESSIONAL_WORK_PREFERENCES.some(
    item => item === value,
  );
}

export function isProfessionalProfileRow(
  value: unknown,
): value is ProfessionalProfileRow {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const row = value as ProfessionalProfileRow;

  return (
    typeof row.profile_id === 'string' &&
    (row.professional_headline === null ||
      typeof row.professional_headline === 'string') &&
    (row.professional_about === null ||
      typeof row.professional_about === 'string') &&
    (row.availability === null ||
      typeof row.availability === 'string') &&
    (row.service_area === null ||
      typeof row.service_area === 'string') &&
    (row.work_preference === null ||
      typeof row.work_preference === 'string')
  );
}

export function isProfessionalSkillRow(
  value: unknown,
): value is ProfessionalSkillRow {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const row = value as ProfessionalSkillRow;

  return (
    typeof row.id === 'string' &&
    typeof row.profile_id === 'string' &&
    typeof row.name === 'string' &&
    typeof row.position === 'number'
  );
}

export function adaptProfessionalSkills(
  rows: ProfessionalSkillRow[],
): ProfessionalSkill[] {
  return [...rows]
    .sort((left, right) => left.position - right.position)
    .map(row => ({
      id: row.id,
      name: row.name,
      position: row.position,
    }));
}

export function adaptProfessionalProfile(
  row: ProfessionalProfileRow,
  skillRows: ProfessionalSkillRow[],
): ProfessionalProfileCore {
  return {
    profileId: row.profile_id.toLowerCase(),
    headline: optionalProfessionalText(
      row.professional_headline,
    ),
    about: optionalProfessionalText(row.professional_about),
    availability: isProfessionalAvailability(
      row.availability,
    )
      ? row.availability
      : null,
    serviceArea: optionalProfessionalText(row.service_area),
    workPreference: isProfessionalWorkPreference(
      row.work_preference,
    )
      ? row.work_preference
      : null,
    skills: adaptProfessionalSkills(skillRows),
  };
}

export function formatProfessionalAvailabilityLabel(
  value: ProfessionalAvailability,
): string {
  switch (value) {
    case 'available_now':
      return 'Available now';
    case 'open_to_opportunities':
      return 'Open to opportunities';
    case 'not_available':
      return 'Not currently available';
  }
}

export function formatProfessionalWorkPreferenceLabel(
  value: ProfessionalWorkPreference,
): string {
  switch (value) {
    case 'one_off':
      return 'One-off';
    case 'casual':
      return 'Casual';
    case 'part_time':
      return 'Part-time';
    case 'full_time':
      return 'Full-time';
    case 'contract':
      return 'Contract';
  }
}

export function getMissingProfessionalCoreFieldLabels(
  profile: ProfessionalProfileCore | null,
): string[] {
  const missing: string[] = [];

  if (!profile?.headline) {
    missing.push('Professional headline');
  }

  if (!profile?.about) {
    missing.push('Professional About');
  }

  if (!profile?.availability) {
    missing.push('Availability');
  }

  if (!profile?.serviceArea) {
    missing.push('Service area');
  }

  if (!profile?.workPreference) {
    missing.push('Work preference');
  }

  if (!profile?.skills.length) {
    missing.push('Skills');
  }

  return missing;
}

export function sanitiseOwnProfessionalProfileInput(
  input: SaveOwnProfessionalProfileInput,
):
  | {
      ok: true;
      headline: string | null;
      about: string | null;
      availability: ProfessionalAvailability | null;
      serviceArea: string | null;
      workPreference: ProfessionalWorkPreference | null;
      skills: string[];
    }
  | {
      ok: false;
      error: string;
    } {
  const headline = optionalProfessionalText(input.headline);
  const about = optionalProfessionalText(input.about);
  const serviceArea = optionalProfessionalText(
    input.serviceArea,
  );

  if (
    headline &&
    (headline.length < PROFESSIONAL_HEADLINE_MIN ||
      headline.length > PROFESSIONAL_HEADLINE_MAX)
  ) {
    return {
      ok: false,
      error:
        'Professional headline must be between 2 and 100 characters.',
    };
  }

  if (about && about.length > PROFESSIONAL_ABOUT_MAX) {
    return {
      ok: false,
      error:
        'Keep your professional about to 1500 characters or fewer.',
    };
  }

  if (
    serviceArea &&
    serviceArea.length > PROFESSIONAL_SERVICE_AREA_MAX
  ) {
    return {
      ok: false,
      error: 'Service area must be 120 characters or fewer.',
    };
  }

  if (
    input.availability !== null &&
    !isProfessionalAvailability(input.availability)
  ) {
    return {
      ok: false,
      error: 'Choose a valid availability.',
    };
  }

  if (
    input.workPreference !== null &&
    !isProfessionalWorkPreference(input.workPreference)
  ) {
    return {
      ok: false,
      error: 'Choose a valid work preference.',
    };
  }

  const skills: string[] = [];
  const seen = new Set<string>();

  for (const raw of input.skills) {
    const name = optionalProfessionalText(raw);

    if (!name) {
      continue;
    }

    if (
      name.length < PROFESSIONAL_SKILL_NAME_MIN ||
      name.length > PROFESSIONAL_SKILL_NAME_MAX
    ) {
      return {
        ok: false,
        error: 'Each skill must be 50 characters or fewer.',
      };
    }

    const key = name.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    skills.push(name);
  }

  if (skills.length > PROFESSIONAL_SKILLS_MAX) {
    return {
      ok: false,
      error: 'You can add up to 20 skills.',
    };
  }

  return {
    ok: true,
    headline,
    about,
    availability: input.availability,
    serviceArea,
    workPreference: input.workPreference,
    skills,
  };
}

export type ProfessionalExperienceRow = {
  id: string;
  profile_id: string;
  title: string;
  organisation: string;
  start_year: number;
  start_month: number | null;
  end_year: number | null;
  end_month: number | null;
  is_current: boolean;
  description: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

export type ProfessionalExperienceRpcRow = {
  id: string;
  profile_id: string;
  title: string;
  organisation: string;
  start_year: number;
  start_month: number | null;
  end_year: number | null;
  end_month: number | null;
  is_current: boolean;
  description: string | null;
  sort_position: number;
  created_at: string;
  updated_at: string;
};

export type ProfessionalCredentialRow = {
  id: string;
  profile_id: string;
  credential_type: ProfessionalCredentialType;
  name: string;
  issuer: string | null;
  issued_year: number | null;
  issued_month: number | null;
  expires_year: number | null;
  expires_month: number | null;
  does_not_expire: boolean;
  position: number;
  created_at: string;
  updated_at: string;
};

export type ProfessionalCredentialRpcRow = {
  id: string;
  profile_id: string;
  credential_type: ProfessionalCredentialType;
  name: string;
  issuer: string | null;
  issued_year: number | null;
  issued_month: number | null;
  expires_year: number | null;
  expires_month: number | null;
  does_not_expire: boolean;
  sort_position: number;
  created_at: string;
  updated_at: string;
};

function isFiniteNumber(
  value: unknown,
): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isNullableFiniteNumber(
  value: unknown,
): value is number | null {
  return value === null || isFiniteNumber(value);
}

export function isProfessionalCredentialType(
  value: unknown,
): value is ProfessionalCredentialType {
  return PROFESSIONAL_CREDENTIAL_TYPES.some(
    item => item === value,
  );
}

function isExperienceSharedFields(row: {
  id: unknown;
  profile_id: unknown;
  title: unknown;
  organisation: unknown;
  start_year: unknown;
  start_month: unknown;
  end_year: unknown;
  end_month: unknown;
  is_current: unknown;
  description: unknown;
  created_at: unknown;
  updated_at: unknown;
}): boolean {
  return (
    typeof row.id === 'string' &&
    typeof row.profile_id === 'string' &&
    typeof row.title === 'string' &&
    typeof row.organisation === 'string' &&
    isFiniteNumber(row.start_year) &&
    isNullableFiniteNumber(row.start_month) &&
    isNullableFiniteNumber(row.end_year) &&
    isNullableFiniteNumber(row.end_month) &&
    typeof row.is_current === 'boolean' &&
    (row.description === null ||
      typeof row.description === 'string') &&
    typeof row.created_at === 'string' &&
    typeof row.updated_at === 'string'
  );
}

export function isProfessionalExperienceRow(
  value: unknown,
): value is ProfessionalExperienceRow {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const row = value as ProfessionalExperienceRow;

  return (
    isExperienceSharedFields(row) &&
    isFiniteNumber(row.position)
  );
}

export function isProfessionalExperienceRpcRow(
  value: unknown,
): value is ProfessionalExperienceRpcRow {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const row = value as ProfessionalExperienceRpcRow;

  return (
    isExperienceSharedFields(row) &&
    isFiniteNumber(row.sort_position)
  );
}

function isCredentialSharedFields(row: {
  id: unknown;
  profile_id: unknown;
  credential_type: unknown;
  name: unknown;
  issuer: unknown;
  issued_year: unknown;
  issued_month: unknown;
  expires_year: unknown;
  expires_month: unknown;
  does_not_expire: unknown;
  created_at: unknown;
  updated_at: unknown;
}): boolean {
  return (
    typeof row.id === 'string' &&
    typeof row.profile_id === 'string' &&
    isProfessionalCredentialType(row.credential_type) &&
    typeof row.name === 'string' &&
    (row.issuer === null || typeof row.issuer === 'string') &&
    isNullableFiniteNumber(row.issued_year) &&
    isNullableFiniteNumber(row.issued_month) &&
    isNullableFiniteNumber(row.expires_year) &&
    isNullableFiniteNumber(row.expires_month) &&
    typeof row.does_not_expire === 'boolean' &&
    typeof row.created_at === 'string' &&
    typeof row.updated_at === 'string'
  );
}

export function isProfessionalCredentialRow(
  value: unknown,
): value is ProfessionalCredentialRow {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const row = value as ProfessionalCredentialRow;

  return (
    isCredentialSharedFields(row) &&
    isFiniteNumber(row.position)
  );
}

export function isProfessionalCredentialRpcRow(
  value: unknown,
): value is ProfessionalCredentialRpcRow {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const row = value as ProfessionalCredentialRpcRow;

  return (
    isCredentialSharedFields(row) &&
    isFiniteNumber(row.sort_position)
  );
}

export function mapProfessionalExperienceRow(
  row: ProfessionalExperienceRow,
): ProfessionalExperience {
  return {
    id: row.id.toLowerCase(),
    profileId: row.profile_id.toLowerCase(),
    title: row.title,
    organisation: row.organisation,
    startYear: row.start_year,
    startMonth: row.start_month,
    endYear: row.end_year,
    endMonth: row.end_month,
    isCurrent: row.is_current,
    description: row.description,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapProfessionalExperienceRpcRow(
  row: ProfessionalExperienceRpcRow,
): ProfessionalExperience {
  return mapProfessionalExperienceRow({
    ...row,
    position: row.sort_position,
  });
}

export function mapProfessionalCredentialRow(
  row: ProfessionalCredentialRow,
): ProfessionalCredential {
  return {
    id: row.id.toLowerCase(),
    profileId: row.profile_id.toLowerCase(),
    credentialType: row.credential_type,
    name: row.name,
    issuer: row.issuer,
    issuedYear: row.issued_year,
    issuedMonth: row.issued_month,
    expiresYear: row.expires_year,
    expiresMonth: row.expires_month,
    doesNotExpire: row.does_not_expire,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapProfessionalCredentialRpcRow(
  row: ProfessionalCredentialRpcRow,
): ProfessionalCredential {
  return mapProfessionalCredentialRow({
    ...row,
    position: row.sort_position,
  });
}

export function toOwnProfessionalExperienceRpcEntry(
  input: ProfessionalExperienceSaveInput,
): Record<string, unknown> {
  const entry: Record<string, unknown> = {
    title: input.title,
    organisation: input.organisation,
    start_year: input.startYear,
    start_month: input.startMonth,
    end_year: input.endYear,
    end_month: input.endMonth,
    is_current: input.isCurrent,
    description: input.description,
  };

  const id = input.id?.trim();

  if (id) {
    entry.id = id.toLowerCase();
  }

  return entry;
}

export function toOwnProfessionalCredentialRpcEntry(
  input: ProfessionalCredentialSaveInput,
): Record<string, unknown> {
  const entry: Record<string, unknown> = {
    credential_type: input.credentialType,
    name: input.name,
    issuer: input.issuer,
    issued_year: input.issuedYear,
    issued_month: input.issuedMonth,
    expires_year: input.expiresYear,
    expires_month: input.expiresMonth,
    does_not_expire: input.doesNotExpire,
  };

  const id = input.id?.trim();

  if (id) {
    entry.id = id.toLowerCase();
  }

  return entry;
}
