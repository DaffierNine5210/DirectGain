import * as Location from 'expo-location';
import {
  Platform,
} from 'react-native';

export const CURRENT_LOCATION_LABEL =
  'Current location';

export const LOCATION_TYPE_CURRENT =
  'current';

const MAX_LOCATION_LABEL_LENGTH =
  80;

const MAX_LOCATION_ADDRESS_LENGTH =
  120;

export type ConversationLocationShareDraft = {
  latitude: number;
  longitude: number;
  label: string;
  address?: string;
};

export type ConversationLocationMetadata = {
  client_message_id: string;
  latitude: number;
  longitude: number;
  label: string;
  address?: string;
  locationType:
    typeof LOCATION_TYPE_CURRENT;
};

export type LocationAcquisitionError =
  | 'services-disabled'
  | 'permission-denied'
  | 'unavailable'
  | 'invalid';

export type LocationAcquisitionResult =
  | {
      ok: true;
      location:
        ConversationLocationShareDraft;
    }
  | {
      ok: false;
      error:
        LocationAcquisitionError;
    };

export function isValidLatitude(
  value: unknown,
): value is number {
  return (
    typeof value ===
      'number' &&
    Number.isFinite(
      value,
    ) &&
    value >=
      -90 &&
    value <=
      90
  );
}

export function isValidLongitude(
  value: unknown,
): value is number {
  return (
    typeof value ===
      'number' &&
    Number.isFinite(
      value,
    ) &&
    value >=
      -180 &&
    value <=
      180
  );
}

export function hasValidLocationCoordinates(
  latitude: unknown,
  longitude: unknown,
): boolean {
  return (
    isValidLatitude(
      latitude,
    ) &&
    isValidLongitude(
      longitude,
    )
  );
}

export function sanitizeLocationLabel(
  value: unknown,
): string {
  const sanitized =
    sanitizeLocationText(
      value,
      MAX_LOCATION_LABEL_LENGTH,
    );

  return sanitized.length >
    0
    ? sanitized
    : CURRENT_LOCATION_LABEL;
}

export function sanitizeLocationAddress(
  value: unknown,
): string | undefined {
  const sanitized =
    sanitizeLocationText(
      value,
      MAX_LOCATION_ADDRESS_LENGTH,
    );

  return sanitized.length >
    0
    ? sanitized
    : undefined;
}

export function createValidatedLocationMetadata(
  metadata:
    Record<string, unknown> |
    undefined,
): ConversationLocationMetadata | null {
  const source =
    metadata ??
    {};

  const latitude =
    source.latitude;

  const longitude =
    source.longitude;

  if (
    !isValidLatitude(
      latitude,
    ) ||
    !isValidLongitude(
      longitude,
    )
  ) {
    return null;
  }

  const locationType =
    source.locationType;

  if (
    locationType !==
    LOCATION_TYPE_CURRENT
  ) {
    return null;
  }

  const clientMessageId =
    sanitizeClientMessageId(
      source.client_message_id,
    );

  if (
    !clientMessageId
  ) {
    return null;
  }

  const label =
    sanitizeLocationLabel(
      source.label,
    );

  const address =
    sanitizeLocationAddress(
      source.address,
    );

  const validated: ConversationLocationMetadata = {
    client_message_id:
      clientMessageId,
    latitude,
    longitude,
    label,
    locationType:
      LOCATION_TYPE_CURRENT,
  };

  if (
    address &&
    address !==
      label
  ) {
    validated.address =
      address;
  }

  return validated;
}

export function parseConversationLocationMetadata(
  metadata:
    Record<string, unknown> |
    undefined,
): {
  latitude?: number;
  longitude?: number;
  locationLabel?: string;
  locationAddress?: string;
  isOpenable: boolean;
} {
  const source =
    metadata ??
    {};

  const latitude =
    source.latitude;

  const longitude =
    source.longitude;

  if (
    !isValidLatitude(
      latitude,
    ) ||
    !isValidLongitude(
      longitude,
    )
  ) {
    return {
      isOpenable:
        false,
    };
  }

  const locationLabel =
    sanitizeLocationLabel(
      source.label,
    );

  const locationAddress =
    sanitizeLocationAddress(
      source.address,
    );

  return {
    latitude,
    longitude,
    locationLabel,
    locationAddress:
      locationAddress &&
      locationAddress !==
        locationLabel
        ? locationAddress
        : undefined,
    isOpenable:
      true,
  };
}

export async function acquireCurrentLocationShare(): Promise<LocationAcquisitionResult> {
  try {
    const servicesEnabled =
      await Location.hasServicesEnabledAsync();

    if (
      !servicesEnabled
    ) {
      return {
        ok: false,
        error:
          'services-disabled',
      };
    }

    const permission =
      await Location.requestForegroundPermissionsAsync();

    if (
      !permission.granted
    ) {
      return {
        ok: false,
        error:
          'permission-denied',
      };
    }

    const position =
      await Location.getCurrentPositionAsync({
        accuracy:
          Location.Accuracy.High,
      });

    const latitude =
      position.coords.latitude;

    const longitude =
      position.coords.longitude;

    if (
      !hasValidLocationCoordinates(
        latitude,
        longitude,
      )
    ) {
      return {
        ok: false,
        error:
          'invalid',
      };
    }

    const display =
      await reverseGeocodeLocationDisplay(
        latitude,
        longitude,
      );

    return {
      ok: true,
      location: {
        latitude,
        longitude,
        label:
          display.label,
        address:
          display.address,
      },
    };
  } catch (
    error
  ) {
    console.warn(
      '[Direct Gain] Unable to acquire current location:',
      error instanceof
        Error
        ? error.message
        : error,
    );

    return {
      ok: false,
      error:
        'unavailable',
    };
  }
}

export function getLocationMapUrls({
  latitude,
  longitude,
  label,
}: {
  latitude: number;
  longitude: number;
  label: string;
}): {
  primary: string;
  fallback: string;
} | null {
  if (
    !hasValidLocationCoordinates(
      latitude,
      longitude,
    )
  ) {
    return null;
  }

  const encodedLabel =
    encodeURIComponent(
      sanitizeLocationLabel(
        label,
      ),
    );

  const fallback =
    `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  if (
    Platform.OS ===
    'ios'
  ) {
    return {
      primary:
        `http://maps.apple.com/?ll=${latitude},${longitude}&q=${encodedLabel}`,
      fallback,
    };
  }

  return {
    primary:
      `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodedLabel})`,
    fallback,
  };
}

function sanitizeLocationText(
  value: unknown,
  maxLength: number,
): string {
  if (
    typeof value !==
    'string'
  ) {
    return '';
  }

  const withoutControl =
    value.replace(
      /[\u0000-\u001F\u007F]/g,
      '',
    );

  const withoutScheme =
    withoutControl.replace(
      /https?:\/\//gi,
      '',
    );

  const collapsed =
    withoutScheme
      .replace(
        /\s+/g,
        ' ',
      )
      .trim();

  return collapsed.slice(
    0,
    maxLength,
  );
}

function sanitizeClientMessageId(
  value: unknown,
): string | undefined {
  if (
    typeof value !==
    'string'
  ) {
    return undefined;
  }

  const trimmed =
    value.trim();

  if (
    trimmed.length ===
      0 ||
    trimmed.length >
      120
  ) {
    return undefined;
  }

  if (
    /[\u0000-\u001F\u007F]/.test(
      trimmed,
    )
  ) {
    return undefined;
  }

  return trimmed;
}

async function reverseGeocodeLocationDisplay(
  latitude: number,
  longitude: number,
): Promise<{
  label: string;
  address?: string;
}> {
  try {
    const results =
      await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

    const first =
      results[0];

    if (
      !first
    ) {
      return {
        label:
          CURRENT_LOCATION_LABEL,
      };
    }

    const city =
      sanitizeLocationText(
        first.city ??
          first.subregion,
        MAX_LOCATION_LABEL_LENGTH,
      );

    const region =
      sanitizeLocationText(
        first.region,
        MAX_LOCATION_LABEL_LENGTH,
      );

    const streetLine =
      [
        sanitizeLocationText(
          first.streetNumber,
          20,
        ),
        sanitizeLocationText(
          first.street,
          80,
        ),
      ]
        .filter(
          Boolean,
        )
        .join(
          ' ',
        );

    const label =
      city ||
      region ||
      CURRENT_LOCATION_LABEL;

    const addressParts =
      [
        streetLine,
        city,
        region,
      ].filter(
        (part, index, parts) =>
          part.length >
            0 &&
          parts.indexOf(
            part,
          ) ===
            index,
      );

    const address =
      addressParts.join(
        ', ',
      );

    if (
      !address ||
      address ===
        label
    ) {
      return {
        label,
      };
    }

    return {
      label,
      address:
        sanitizeLocationAddress(
          address,
        ),
    };
  } catch {
    return {
      label:
        CURRENT_LOCATION_LABEL,
    };
  }
}
