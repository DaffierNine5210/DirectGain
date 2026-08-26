import type {
  VehicleDetails,
} from '../../types/Listing';

export default function getVehicleSummary(
  details: VehicleDetails,
) {
  const items = [
    String(details.year),

    details.kilometres !== undefined
      ? `${details.kilometres.toLocaleString(
          'en-AU',
        )} km`
      : null,

    getShortTransmission(
      details.transmission,
    ),

    details.fuelType,

    details.drivetrain,
  ];

  return items.filter(
    (
      item,
    ): item is string =>
      Boolean(item),
  );
}

function getShortTransmission(
  transmission?: string,
) {
  if (!transmission) {
    return null;
  }

  const lower =
    transmission.toLowerCase();

  if (
    lower.includes(
      'automatic',
    )
  ) {
    return 'Automatic';
  }

  if (
    lower.includes(
      'manual',
    )
  ) {
    return 'Manual';
  }

  return transmission;
}