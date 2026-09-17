import type {
  ProfessionalAvailability,
  ProfessionalCredential,
  ProfessionalCredentialSaveInput,
  ProfessionalCredentialType,
  ProfessionalExperience,
  ProfessionalExperienceSaveInput,
  ProfessionalPortfolioDraftProject,
  ProfessionalPortfolioMedia,
  ProfessionalPortfolioMediaSaveInput,
  ProfessionalPortfolioProject,
  ProfessionalPortfolioProjectSaveInput,
  ProfessionalProfileCore,
  ProfessionalSkill,
  ProfessionalWorkPreference,
  SaveOwnProfessionalProfileInput,
} from '../../types/professionalProfile';

import {
  PROFESSIONAL_ABOUT_MAX,
  PROFESSIONAL_AVAILABILITIES,
  PROFESSIONAL_CREDENTIAL_EXPIRY_YEAR_HORIZON,
  PROFESSIONAL_CREDENTIAL_ISSUER_MAX,
  PROFESSIONAL_CREDENTIAL_NAME_MAX,
  PROFESSIONAL_CREDENTIAL_NAME_MIN,
  PROFESSIONAL_CREDENTIALS_MAX,
  PROFESSIONAL_CREDENTIAL_TYPES,
  PROFESSIONAL_EXPERIENCE_DESCRIPTION_MAX,
  PROFESSIONAL_EXPERIENCE_ORGANISATION_MAX,
  PROFESSIONAL_EXPERIENCE_ORGANISATION_MIN,
  PROFESSIONAL_EXPERIENCE_TITLE_MAX,
  PROFESSIONAL_EXPERIENCE_TITLE_MIN,
  PROFESSIONAL_EXPERIENCES_MAX,
  PROFESSIONAL_HEADLINE_MAX,
  PROFESSIONAL_HEADLINE_MIN,
  PROFESSIONAL_PORTFOLIO_DESCRIPTION_MAX,
  PROFESSIONAL_PORTFOLIO_JPEG_MIME,
  PROFESSIONAL_PORTFOLIO_MEDIA_MAX,
  PROFESSIONAL_PORTFOLIO_MEDIA_MAX_BYTES,
  PROFESSIONAL_PORTFOLIO_PROJECTS_MAX,
  PROFESSIONAL_PORTFOLIO_TITLE_MAX,
  PROFESSIONAL_PORTFOLIO_TITLE_MIN,
  PROFESSIONAL_SERVICE_AREA_MAX,
  PROFESSIONAL_SKILL_NAME_MAX,
  PROFESSIONAL_SKILL_NAME_MIN,
  PROFESSIONAL_SKILLS_MAX,
  PROFESSIONAL_WORK_PREFERENCES,
  PROFESSIONAL_YEAR_MIN,
  PROFESSIONAL_YEAR_STRUCTURAL_MAX,
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
    missing.push('Skills & services');
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

export const PROFESSIONAL_MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export function getProfessionalDeviceCalendarYear(): number {
  return new Date().getFullYear();
}

export function getProfessionalCredentialExpiryYearMax(
  currentYear = getProfessionalDeviceCalendarYear(),
): number {
  return Math.min(
    currentYear + PROFESSIONAL_CREDENTIAL_EXPIRY_YEAR_HORIZON,
    PROFESSIONAL_YEAR_STRUCTURAL_MAX,
  );
}

export function formatProfessionalMonthLabel(
  month: number,
): string | null {
  if (month < 1 || month > 12) {
    return null;
  }

  return PROFESSIONAL_MONTH_LABELS[month - 1];
}

export function formatProfessionalYearMonth(
  year: number,
  month: number | null,
): string {
  const label =
    month == null ? null : formatProfessionalMonthLabel(month);

  return label ? `${label} ${year}` : String(year);
}

export function formatProfessionalExperienceDateRange(
  experience: Pick<
    ProfessionalExperience,
    'startYear' | 'startMonth' | 'endYear' | 'endMonth' | 'isCurrent'
  >,
): string {
  const start = formatProfessionalYearMonth(
    experience.startYear,
    experience.startMonth,
  );

  if (experience.isCurrent) {
    return `${start} – Current`;
  }

  if (experience.endYear == null) {
    return start;
  }

  return `${start} – ${formatProfessionalYearMonth(
    experience.endYear,
    experience.endMonth,
  )}`;
}

export function formatProfessionalCredentialTypeLabel(
  value: ProfessionalCredentialType,
): string {
  switch (value) {
    case 'qualification':
      return 'Qualification';
    case 'licence':
      return 'Licence';
    case 'certification':
      return 'Certification';
  }
}

export function formatProfessionalCredentialIssued(
  credential: Pick<
    ProfessionalCredential,
    'issuedYear' | 'issuedMonth'
  >,
): string | null {
  if (credential.issuedYear == null) {
    return null;
  }

  return `Issued ${formatProfessionalYearMonth(
    credential.issuedYear,
    credential.issuedMonth,
  )}`;
}

export function formatProfessionalCredentialExpiry(
  credential: Pick<
    ProfessionalCredential,
    'doesNotExpire' | 'expiresYear' | 'expiresMonth'
  >,
): string | null {
  if (credential.doesNotExpire) {
    return 'Does not expire';
  }

  if (credential.expiresYear == null) {
    return null;
  }

  return `Expires ${formatProfessionalYearMonth(
    credential.expiresYear,
    credential.expiresMonth,
  )}`;
}

function isValidMonth(
  value: number | null,
): boolean {
  return (
    value === null ||
    (Number.isInteger(value) && value >= 1 && value <= 12)
  );
}

function chronologyValue(
  year: number,
  month: number | null,
  missingMonth: number,
): number {
  return year * 12 + (month ?? missingMonth);
}

export function professionalStartIsDefinitelyAfterEnd(
  startYear: number,
  startMonth: number | null,
  endYear: number,
  endMonth: number | null,
): boolean {
  return (
    chronologyValue(startYear, startMonth, 1) >
    chronologyValue(endYear, endMonth, 12)
  );
}

function parseOptionalYearText(
  value: string,
): number | null | 'invalid' {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (!/^\d{4}$/.test(trimmed)) {
    return 'invalid';
  }

  return Number(trimmed);
}

function optionalPersistedId(
  value: string | null | undefined,
): string | undefined {
  const id = value?.trim();
  return id ? id.toLowerCase() : undefined;
}

export type ProfessionalExperienceDraftFields = {
  id?: string | null;
  title: string;
  organisation: string;
  startYearText: string;
  startMonth: number | null;
  isCurrent: boolean;
  endYearText: string;
  endMonth: number | null;
  description: string;
};

export type ProfessionalCredentialDraftFields = {
  id?: string | null;
  credentialType: ProfessionalCredentialType | null;
  name: string;
  issuer: string;
  issuedYearText: string;
  issuedMonth: number | null;
  doesNotExpire: boolean;
  expiresYearText: string;
  expiresMonth: number | null;
};

export function sanitiseOwnProfessionalExperiences(
  drafts: ProfessionalExperienceDraftFields[],
  currentYear = getProfessionalDeviceCalendarYear(),
):
  | {
      ok: true;
      entries: ProfessionalExperienceSaveInput[];
    }
  | {
      ok: false;
      error: string;
    } {
  if (drafts.length > PROFESSIONAL_EXPERIENCES_MAX) {
    return {
      ok: false,
      error: 'You can add up to 12 experience entries.',
    };
  }

  const entries: ProfessionalExperienceSaveInput[] = [];

  for (let index = 0; index < drafts.length; index += 1) {
    const draft = drafts[index];
    const label = `Experience ${index + 1}`;
    const title = draft.title.trim();
    const organisation = draft.organisation.trim();
    const description = optionalProfessionalText(
      draft.description,
    );

    if (
      title.length < PROFESSIONAL_EXPERIENCE_TITLE_MIN ||
      title.length > PROFESSIONAL_EXPERIENCE_TITLE_MAX
    ) {
      return {
        ok: false,
        error: `${label}: role / title must be between 2 and 80 characters.`,
      };
    }

    if (
      organisation.length <
        PROFESSIONAL_EXPERIENCE_ORGANISATION_MIN ||
      organisation.length >
        PROFESSIONAL_EXPERIENCE_ORGANISATION_MAX
    ) {
      return {
        ok: false,
        error: `${label}: organisation must be between 1 and 80 characters.`,
      };
    }

    const startYear = parseOptionalYearText(draft.startYearText);

    if (startYear === null || startYear === 'invalid') {
      return {
        ok: false,
        error: `${label}: choose a start year.`,
      };
    }

    if (
      startYear < PROFESSIONAL_YEAR_MIN ||
      startYear > currentYear
    ) {
      return {
        ok: false,
        error: `${label}: start year must be between ${PROFESSIONAL_YEAR_MIN} and ${currentYear}.`,
      };
    }

    if (!isValidMonth(draft.startMonth)) {
      return {
        ok: false,
        error: `${label}: choose a valid start month.`,
      };
    }

    if (
      description &&
      description.length > PROFESSIONAL_EXPERIENCE_DESCRIPTION_MAX
    ) {
      return {
        ok: false,
        error: `${label}: keep the description to 800 characters or fewer.`,
      };
    }

    if (draft.isCurrent) {
      entries.push({
        id: optionalPersistedId(draft.id),
        title,
        organisation,
        startYear,
        startMonth: draft.startMonth,
        endYear: null,
        endMonth: null,
        isCurrent: true,
        description,
      });
      continue;
    }

    const endYear = parseOptionalYearText(draft.endYearText);

    if (endYear === null || endYear === 'invalid') {
      return {
        ok: false,
        error: `${label}: choose an end year, or mark this as a current role.`,
      };
    }

    if (
      endYear < PROFESSIONAL_YEAR_MIN ||
      endYear > currentYear
    ) {
      return {
        ok: false,
        error: `${label}: end year must be between ${PROFESSIONAL_YEAR_MIN} and ${currentYear}.`,
      };
    }

    if (!isValidMonth(draft.endMonth)) {
      return {
        ok: false,
        error: `${label}: choose a valid end month.`,
      };
    }

    if (
      professionalStartIsDefinitelyAfterEnd(
        startYear,
        draft.startMonth,
        endYear,
        draft.endMonth,
      )
    ) {
      return {
        ok: false,
        error: `${label}: the start date cannot be after the end date.`,
      };
    }

    entries.push({
      id: optionalPersistedId(draft.id),
      title,
      organisation,
      startYear,
      startMonth: draft.startMonth,
      endYear,
      endMonth: draft.endMonth,
      isCurrent: false,
      description,
    });
  }

  return {
    ok: true,
    entries,
  };
}

export function sanitiseOwnProfessionalCredentials(
  drafts: ProfessionalCredentialDraftFields[],
  currentYear = getProfessionalDeviceCalendarYear(),
):
  | {
      ok: true;
      entries: ProfessionalCredentialSaveInput[];
    }
  | {
      ok: false;
      error: string;
    } {
  if (drafts.length > PROFESSIONAL_CREDENTIALS_MAX) {
    return {
      ok: false,
      error:
        'You can add up to 15 qualifications, licences and certifications.',
    };
  }

  const expiryYearMax =
    getProfessionalCredentialExpiryYearMax(currentYear);
  const entries: ProfessionalCredentialSaveInput[] = [];

  for (let index = 0; index < drafts.length; index += 1) {
    const draft = drafts[index];
    const label = `Credential ${index + 1}`;
    const name = draft.name.trim();
    const issuer = optionalProfessionalText(draft.issuer);

    if (!isProfessionalCredentialType(draft.credentialType)) {
      return {
        ok: false,
        error: `${label}: choose Qualification, Licence or Certification.`,
      };
    }

    if (
      name.length < PROFESSIONAL_CREDENTIAL_NAME_MIN ||
      name.length > PROFESSIONAL_CREDENTIAL_NAME_MAX
    ) {
      return {
        ok: false,
        error: `${label}: name must be between 2 and 120 characters.`,
      };
    }

    if (
      issuer &&
      issuer.length > PROFESSIONAL_CREDENTIAL_ISSUER_MAX
    ) {
      return {
        ok: false,
        error: `${label}: issuer must be 120 characters or fewer.`,
      };
    }

    const issuedYear = parseOptionalYearText(
      draft.issuedYearText,
    );

    if (issuedYear === 'invalid') {
      return {
        ok: false,
        error: `${label}: issued year must be a 4-digit year.`,
      };
    }

    if (
      issuedYear != null &&
      (issuedYear < PROFESSIONAL_YEAR_MIN ||
        issuedYear > currentYear)
    ) {
      return {
        ok: false,
        error: `${label}: issued year must be between ${PROFESSIONAL_YEAR_MIN} and ${currentYear}.`,
      };
    }

    if (draft.issuedMonth != null && issuedYear == null) {
      return {
        ok: false,
        error: `${label}: choose an issued year before an issued month.`,
      };
    }

    if (!isValidMonth(draft.issuedMonth)) {
      return {
        ok: false,
        error: `${label}: choose a valid issued month.`,
      };
    }

    if (draft.doesNotExpire) {
      entries.push({
        id: optionalPersistedId(draft.id),
        credentialType: draft.credentialType,
        name,
        issuer,
        issuedYear,
        issuedMonth: issuedYear == null ? null : draft.issuedMonth,
        expiresYear: null,
        expiresMonth: null,
        doesNotExpire: true,
      });
      continue;
    }

    const expiresYear = parseOptionalYearText(
      draft.expiresYearText,
    );

    if (expiresYear === 'invalid') {
      return {
        ok: false,
        error: `${label}: expiry year must be a 4-digit year.`,
      };
    }

    if (
      expiresYear != null &&
      (expiresYear < PROFESSIONAL_YEAR_MIN ||
        expiresYear > expiryYearMax)
    ) {
      return {
        ok: false,
        error: `${label}: expiry year must be between ${PROFESSIONAL_YEAR_MIN} and ${expiryYearMax}.`,
      };
    }

    if (draft.expiresMonth != null && expiresYear == null) {
      return {
        ok: false,
        error: `${label}: choose an expiry year before an expiry month.`,
      };
    }

    if (!isValidMonth(draft.expiresMonth)) {
      return {
        ok: false,
        error: `${label}: choose a valid expiry month.`,
      };
    }

    if (
      issuedYear != null &&
      expiresYear != null &&
      professionalStartIsDefinitelyAfterEnd(
        issuedYear,
        draft.issuedMonth,
        expiresYear,
        draft.expiresMonth,
      )
    ) {
      return {
        ok: false,
        error: `${label}: the issued date cannot be after the expiry date.`,
      };
    }

    entries.push({
      id: optionalPersistedId(draft.id),
      credentialType: draft.credentialType,
      name,
      issuer,
      issuedYear,
      issuedMonth: issuedYear == null ? null : draft.issuedMonth,
      expiresYear,
      expiresMonth:
        expiresYear == null ? null : draft.expiresMonth,
      doesNotExpire: false,
    });
  }

  return {
    ok: true,
    entries,
  };
}

const PROFESSIONAL_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const PROFESSIONAL_PORTFOLIO_STORAGE_PATH =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$/;

function isProfessionalUuid(value: string): boolean {
  return PROFESSIONAL_UUID_PATTERN.test(value.toLowerCase());
}

export type ProfessionalPortfolioProjectRow = {
  id: string;
  profile_id: string;
  title: string;
  description: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

export type ProfessionalPortfolioProjectRpcRow = {
  id: string;
  profile_id: string;
  title: string;
  description: string | null;
  sort_position: number;
  created_at: string;
  updated_at: string;
};

export type ProfessionalPortfolioMediaRow = {
  id: string;
  project_id: string;
  profile_id: string;
  storage_path: string;
  position: number;
  media_type: string;
  mime_type: string;
  byte_size: number;
  created_at: string;
};

export function isProfessionalPortfolioStoragePath(
  value: string,
  profileId: string,
  projectId: string,
): boolean {
  const path = value.trim().toLowerCase();
  const owner = profileId.trim().toLowerCase();
  const project = projectId.trim().toLowerCase();

  if (
    !PROFESSIONAL_PORTFOLIO_STORAGE_PATH.test(path) ||
    !isProfessionalUuid(owner) ||
    !isProfessionalUuid(project)
  ) {
    return false;
  }

  const [pathOwner, pathProject] = path.split('/');

  return pathOwner === owner && pathProject === project;
}

export function isProfessionalPortfolioProjectRow(
  value: unknown,
): value is ProfessionalPortfolioProjectRow {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const row = value as ProfessionalPortfolioProjectRow;

  return (
    typeof row.id === 'string' &&
    isProfessionalUuid(row.id) &&
    typeof row.profile_id === 'string' &&
    isProfessionalUuid(row.profile_id) &&
    typeof row.title === 'string' &&
    (row.description === null ||
      typeof row.description === 'string') &&
    isFiniteNumber(row.position) &&
    typeof row.created_at === 'string' &&
    typeof row.updated_at === 'string'
  );
}

export function isProfessionalPortfolioProjectRpcRow(
  value: unknown,
): value is ProfessionalPortfolioProjectRpcRow {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const row = value as ProfessionalPortfolioProjectRpcRow;

  return (
    typeof row.id === 'string' &&
    isProfessionalUuid(row.id) &&
    typeof row.profile_id === 'string' &&
    isProfessionalUuid(row.profile_id) &&
    typeof row.title === 'string' &&
    (row.description === null ||
      typeof row.description === 'string') &&
    isFiniteNumber(row.sort_position) &&
    typeof row.created_at === 'string' &&
    typeof row.updated_at === 'string'
  );
}

export function isProfessionalPortfolioMediaRow(
  value: unknown,
): value is ProfessionalPortfolioMediaRow {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const row = value as ProfessionalPortfolioMediaRow;

  return (
    typeof row.id === 'string' &&
    isProfessionalUuid(row.id) &&
    typeof row.project_id === 'string' &&
    isProfessionalUuid(row.project_id) &&
    typeof row.profile_id === 'string' &&
    isProfessionalUuid(row.profile_id) &&
    typeof row.storage_path === 'string' &&
    isProfessionalPortfolioStoragePath(
      row.storage_path,
      row.profile_id,
      row.project_id,
    ) &&
    isFiniteNumber(row.position) &&
    row.position >= 0 &&
    row.position <= 4 &&
    row.media_type === 'photo' &&
    row.mime_type === PROFESSIONAL_PORTFOLIO_JPEG_MIME &&
    isFiniteNumber(row.byte_size) &&
    row.byte_size > 0 &&
    row.byte_size <= PROFESSIONAL_PORTFOLIO_MEDIA_MAX_BYTES &&
    typeof row.created_at === 'string'
  );
}

export function mapProfessionalPortfolioMediaRow(
  row: ProfessionalPortfolioMediaRow,
): ProfessionalPortfolioMedia {
  return {
    id: row.id.toLowerCase(),
    projectId: row.project_id.toLowerCase(),
    profileId: row.profile_id.toLowerCase(),
    storagePath: row.storage_path.toLowerCase(),
    mimeType: PROFESSIONAL_PORTFOLIO_JPEG_MIME,
    byteSize: row.byte_size,
    position: row.position,
    createdAt: row.created_at,
  };
}

export function mapProfessionalPortfolioProjectRow(
  row: ProfessionalPortfolioProjectRow,
  mediaRows: ProfessionalPortfolioMediaRow[],
): ProfessionalPortfolioProject {
  const projectId = row.id.toLowerCase();

  return {
    id: projectId,
    profileId: row.profile_id.toLowerCase(),
    title: row.title,
    description: optionalProfessionalText(row.description),
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    media: mediaRows
      .filter(item => item.project_id.toLowerCase() === projectId)
      .sort((left, right) => left.position - right.position)
      .map(mapProfessionalPortfolioMediaRow),
  };
}

export function toOwnProfessionalPortfolioRpcEntry(
  input: ProfessionalPortfolioProjectSaveInput,
): Record<string, unknown> {
  return {
    id: input.id.toLowerCase(),
    title: input.title,
    description: input.description,
    media: input.media.map(item => {
      const entry: Record<string, unknown> = {
        storage_path: item.storagePath.toLowerCase(),
        mime_type: PROFESSIONAL_PORTFOLIO_JPEG_MIME,
        byte_size: item.byteSize,
      };

      const id = item.id?.trim();

      if (id) {
        entry.id = id.toLowerCase();
      }

      return entry;
    }),
  };
}

export function validateProfessionalPortfolioDrafts(
  drafts: ProfessionalPortfolioDraftProject[],
):
  | { ok: true }
  | { ok: false; error: string } {
  if (drafts.length > PROFESSIONAL_PORTFOLIO_PROJECTS_MAX) {
    return {
      ok: false,
      error: 'You can add up to 12 portfolio projects.',
    };
  }

  const seenProjectIds = new Set<string>();

  for (let index = 0; index < drafts.length; index += 1) {
    const draft = drafts[index];
    const label = `Project ${index + 1}`;
    const projectId = draft.id.trim().toLowerCase();
    const title = draft.title.trim();
    const description = optionalProfessionalText(
      draft.description,
    );

    if (!isProfessionalUuid(projectId)) {
      return {
        ok: false,
        error: `${label}: this project could not be saved.`,
      };
    }

    if (seenProjectIds.has(projectId)) {
      return {
        ok: false,
        error: `${label}: each project can only appear once.`,
      };
    }

    seenProjectIds.add(projectId);

    if (
      title.length < PROFESSIONAL_PORTFOLIO_TITLE_MIN ||
      title.length > PROFESSIONAL_PORTFOLIO_TITLE_MAX
    ) {
      return {
        ok: false,
        error: `${label}: title must be between 2 and 80 characters.`,
      };
    }

    if (
      description &&
      description.length > PROFESSIONAL_PORTFOLIO_DESCRIPTION_MAX
    ) {
      return {
        ok: false,
        error: `${label}: keep the description to 800 characters or fewer.`,
      };
    }

    if (
      draft.media.length < 1 ||
      draft.media.length > PROFESSIONAL_PORTFOLIO_MEDIA_MAX
    ) {
      return {
        ok: false,
        error: `${label}: add between 1 and 5 photos.`,
      };
    }

    for (const item of draft.media) {
      const hasLocal = Boolean(item.localPreviewUri?.trim());
      const hasPath = Boolean(item.storagePath?.trim());

      if (!hasLocal && !hasPath) {
        return {
          ok: false,
          error: `${label}: each photo needs an image.`,
        };
      }

      if (
        !Number.isInteger(item.byteSize) ||
        item.byteSize < 1 ||
        item.byteSize > PROFESSIONAL_PORTFOLIO_MEDIA_MAX_BYTES
      ) {
        return {
          ok: false,
          error: `${label}: each photo must be 2 MB or smaller.`,
        };
      }
    }
  }

  return { ok: true };
}

export function sanitiseOwnProfessionalPortfolio(
  drafts: ProfessionalPortfolioDraftProject[],
):
  | {
      ok: true;
      entries: ProfessionalPortfolioProjectSaveInput[];
    }
  | {
      ok: false;
      error: string;
    } {
  if (drafts.length > PROFESSIONAL_PORTFOLIO_PROJECTS_MAX) {
    return {
      ok: false,
      error: 'You can add up to 12 portfolio projects.',
    };
  }

  const seenProjectIds = new Set<string>();
  const seenMediaIds = new Set<string>();
  const seenPaths = new Set<string>();
  const entries: ProfessionalPortfolioProjectSaveInput[] = [];

  for (let index = 0; index < drafts.length; index += 1) {
    const draft = drafts[index];
    const label = `Project ${index + 1}`;
    const projectId = draft.id.trim().toLowerCase();
    const title = draft.title.trim();
    const description = optionalProfessionalText(
      draft.description,
    );

    if (!isProfessionalUuid(projectId)) {
      return {
        ok: false,
        error: `${label}: this project could not be saved.`,
      };
    }

    if (seenProjectIds.has(projectId)) {
      return {
        ok: false,
        error: `${label}: each project can only appear once.`,
      };
    }

    seenProjectIds.add(projectId);

    if (
      title.length < PROFESSIONAL_PORTFOLIO_TITLE_MIN ||
      title.length > PROFESSIONAL_PORTFOLIO_TITLE_MAX
    ) {
      return {
        ok: false,
        error: `${label}: title must be between 2 and 80 characters.`,
      };
    }

    if (
      description &&
      description.length > PROFESSIONAL_PORTFOLIO_DESCRIPTION_MAX
    ) {
      return {
        ok: false,
        error: `${label}: keep the description to 800 characters or fewer.`,
      };
    }

    if (
      draft.media.length < 1 ||
      draft.media.length > PROFESSIONAL_PORTFOLIO_MEDIA_MAX
    ) {
      return {
        ok: false,
        error: `${label}: add between 1 and 5 photos.`,
      };
    }

    const media: ProfessionalPortfolioMediaSaveInput[] = [];

    for (const item of draft.media) {
      const storagePath = item.storagePath?.trim().toLowerCase();

      if (
        !storagePath ||
        !PROFESSIONAL_PORTFOLIO_STORAGE_PATH.test(storagePath)
      ) {
        return {
          ok: false,
          error: `${label}: each photo must be prepared before save.`,
        };
      }

      const pathProject = storagePath.split('/')[1];

      if (pathProject !== projectId) {
        return {
          ok: false,
          error: `${label}: a photo path does not match this project.`,
        };
      }

      if (seenPaths.has(storagePath)) {
        return {
          ok: false,
          error: `${label}: each photo can only be used once.`,
        };
      }

      seenPaths.add(storagePath);

      if (
        !Number.isInteger(item.byteSize) ||
        item.byteSize < 1 ||
        item.byteSize > PROFESSIONAL_PORTFOLIO_MEDIA_MAX_BYTES
      ) {
        return {
          ok: false,
          error: `${label}: each photo must be 2 MB or smaller.`,
        };
      }

      const persistedId = item.persistedId?.trim().toLowerCase();

      if (persistedId) {
        if (!isProfessionalUuid(persistedId)) {
          return {
            ok: false,
            error: `${label}: a photo could not be saved.`,
          };
        }

        if (seenMediaIds.has(persistedId)) {
          return {
            ok: false,
            error: `${label}: each photo can only appear once.`,
          };
        }

        seenMediaIds.add(persistedId);
      }

      media.push({
        id: persistedId,
        storagePath,
        mimeType: PROFESSIONAL_PORTFOLIO_JPEG_MIME,
        byteSize: item.byteSize,
      });
    }

    entries.push({
      id: projectId,
      title,
      description,
      media,
    });
  }

  return {
    ok: true,
    entries,
  };
}
