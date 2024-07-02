import type { TanksWithLatestSample } from "./api";

const METERS_TO_CENTIMETERS = 1 * 100;
const LITERS_TO_CUBIC_METERS = 1 / 1000;

export function getVolume(
  t: Pick<
    TanksWithLatestSample,
    | "latest_sample_top_to_liquid_distance_in_cm"
    | "maximum_volume"
    | "tank_base_area"
  >,
) {
  const volumeInCubicMeters = t.maximum_volume * LITERS_TO_CUBIC_METERS;

  const maxHeightInCentimeters =
    (METERS_TO_CENTIMETERS * volumeInCubicMeters) / t.tank_base_area;

  const liquidHeight =
    maxHeightInCentimeters - t.latest_sample_top_to_liquid_distance_in_cm;

  return (
    ((liquidHeight / METERS_TO_CENTIMETERS) * t.tank_base_area) /
    LITERS_TO_CUBIC_METERS
  );
}
