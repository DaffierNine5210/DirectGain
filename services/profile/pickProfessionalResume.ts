import * as DocumentPicker from 'expo-document-picker';

import {
  normalizeProfessionalResumeFilename,
} from './professionalProfileAdapter';

import {
  PROFESSIONAL_RESUME_MAX_BYTES,
  PROFESSIONAL_RESUME_PDF_MIME,
} from '../../types/professionalProfile';

export type PendingProfessionalResume = {
  uri: string;
  byteSize: number;
  originalFilename: string;
};

export type PickProfessionalResumeResult =
  | { kind: 'cancelled' }
  | { kind: 'invalid'; error: string }
  | { kind: 'unavailable'; message: string }
  | { kind: 'prepared'; resume: PendingProfessionalResume };

export async function pickProfessionalResumePdf(): Promise<
  PickProfessionalResumeResult
> {
  let pickerResult: DocumentPicker.DocumentPickerResult;

  try {
    pickerResult = await DocumentPicker.getDocumentAsync({
      type: PROFESSIONAL_RESUME_PDF_MIME,
      copyToCacheDirectory: true,
      multiple: false,
    });
  } catch (error) {
    console.warn(
      '[Direct Gain] Résumé picker failed to open.',
      error instanceof Error ? error.message : error,
    );

    return {
      kind: 'unavailable',
      message: 'Files could not be opened. Please try again.',
    };
  }

  if (pickerResult.canceled || !pickerResult.assets?.[0]) {
    return { kind: 'cancelled' };
  }

  const asset = pickerResult.assets[0];
  const originalFilename = normalizeProfessionalResumeFilename(
    asset.name ?? '',
  );

  if (!originalFilename) {
    return {
      kind: 'invalid',
      error: 'Choose a PDF file with a valid filename.',
    };
  }

  const mime = (asset.mimeType ?? '').trim().toLowerCase();

  if (mime && mime !== PROFESSIONAL_RESUME_PDF_MIME) {
    return {
      kind: 'invalid',
      error: 'Résumés must be PDF files.',
    };
  }

  const reportedSize = asset.size;

  if (
    typeof reportedSize === 'number' &&
    Number.isFinite(reportedSize)
  ) {
    if (reportedSize <= 0) {
      return {
        kind: 'invalid',
        error: 'That PDF is empty. Please choose another file.',
      };
    }

    if (reportedSize > PROFESSIONAL_RESUME_MAX_BYTES) {
      return {
        kind: 'invalid',
        error: 'Résumés must be 5 MB or smaller.',
      };
    }
  }

  if (!asset.uri) {
    return {
      kind: 'invalid',
      error: 'That PDF could not be prepared. Please try again.',
    };
  }

  return {
    kind: 'prepared',
    resume: {
      uri: asset.uri,
      byteSize:
        typeof reportedSize === 'number' &&
        Number.isFinite(reportedSize)
          ? reportedSize
          : 0,
      originalFilename,
    },
  };
}
