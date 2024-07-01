import type { TanksWithLatestSample } from "./api";

export function getVolume(
  t: Pick<
    TanksWithLatestSample,
    | "latest_sample_top_to_liquid_distance_in_cm"
    | "maximum_volume"
    | "tank_base_area"
  >,
) {
  const maxHeight = (t.maximum_volume / t.tank_base_area) * 100;

  const liquidHeight = maxHeight - t.latest_sample_top_to_liquid_distance_in_cm;

  return (liquidHeight / 100) * t.tank_base_area;
}
