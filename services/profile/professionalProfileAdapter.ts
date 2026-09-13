import type {
  ProfessionalAvailability,
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
