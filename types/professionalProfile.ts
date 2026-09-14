export type ProfessionalAvailability =
  | 'available_now'
  | 'open_to_opportunities'
  | 'not_available';

export type ProfessionalWorkPreference =
  | 'one_off'
  | 'casual'
  | 'part_time'
  | 'full_time'
  | 'contract';

export const PROFESSIONAL_HEADLINE_MIN = 2;
export const PROFESSIONAL_HEADLINE_MAX = 100;
export const PROFESSIONAL_ABOUT_MAX = 1500;
export const PROFESSIONAL_SERVICE_AREA_MAX = 120;
export const PROFESSIONAL_SKILL_NAME_MIN = 1;
export const PROFESSIONAL_SKILL_NAME_MAX = 50;
export const PROFESSIONAL_SKILLS_MAX = 20;

export const PROFESSIONAL_AVAILABILITIES: ProfessionalAvailability[] =
  [
    'available_now',
    'open_to_opportunities',
    'not_available',
  ];

export const PROFESSIONAL_WORK_PREFERENCES: ProfessionalWorkPreference[] =
  [
    'one_off',
    'casual',
    'part_time',
    'full_time',
    'contract',
  ];

export type ProfessionalSkill = {
  id: string;
  name: string;
  position: number;
};

export type ProfessionalProfileCore = {
  profileId: string;
  headline: string | null;
  about: string | null;
  availability: ProfessionalAvailability | null;
  serviceArea: string | null;
  workPreference: ProfessionalWorkPreference | null;
  skills: ProfessionalSkill[];
};

export type SaveOwnProfessionalProfileInput = {
  headline: string;
  about: string;
  availability: ProfessionalAvailability | null;
  serviceArea: string;
  workPreference: ProfessionalWorkPreference | null;
  skills: string[];
};

export type ProfessionalCredentialType =
  | 'qualification'
  | 'licence'
  | 'certification';

export const PROFESSIONAL_CREDENTIAL_TYPES: ProfessionalCredentialType[] =
  [
    'qualification',
    'licence',
    'certification',
  ];

export const PROFESSIONAL_EXPERIENCES_MAX = 12;
export const PROFESSIONAL_CREDENTIALS_MAX = 15;

export type ProfessionalExperience = {
  id: string;
  profileId: string;
  title: string;
  organisation: string;
  startYear: number;
  startMonth: number | null;
  endYear: number | null;
  endMonth: number | null;
  isCurrent: boolean;
  description: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type ProfessionalCredential = {
  id: string;
  profileId: string;
  credentialType: ProfessionalCredentialType;
  name: string;
  issuer: string | null;
  issuedYear: number | null;
  issuedMonth: number | null;
  expiresYear: number | null;
  expiresMonth: number | null;
  doesNotExpire: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type ProfessionalExperienceSaveInput = {
  id?: string | null;
  title: string;
  organisation: string;
  startYear: number;
  startMonth: number | null;
  endYear: number | null;
  endMonth: number | null;
  isCurrent: boolean;
  description: string | null;
};

export type ProfessionalCredentialSaveInput = {
  id?: string | null;
  credentialType: ProfessionalCredentialType;
  name: string;
  issuer: string | null;
  issuedYear: number | null;
  issuedMonth: number | null;
  expiresYear: number | null;
  expiresMonth: number | null;
  doesNotExpire: boolean;
};
