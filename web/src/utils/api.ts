import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { env } from "~/env";

const slaONomeApi = axios.create({
  baseURL: env.API_BASE_URL,
});

type Tanks = {
  id: number;
  maximum_volume: number;
  name: string;
  description: string;
  volume_danger_zone: number;
  volume_alert_zone: number;
  tank_base_area: number;
  latitude: number;
  longitude: number;
};

type Samples = {
  id: number;
  tank_id: number;
  top_to_liquid_distance_in_cm: number;
  // iso string:
  timestamp: string;
};

export type TanksWithLatestSample = Tanks & {
  latest_sample_top_to_liquid_distance_in_cm: Samples["top_to_liquid_distance_in_cm"];
  latest_sample_timestamp: Samples["timestamp"];
};

export const api = {
  tank: {
    getAllWithLatestSample: {
      useQuery() {
        return useQuery({
          queryKey: ["tanks", "getAllWithLatestSample"],
          queryFn() {
            return slaONomeApi
              .get<TanksWithLatestSample[]>("/tanks")
              .then((res) => res.data);
          },
        });
      },
    },
  },
};
