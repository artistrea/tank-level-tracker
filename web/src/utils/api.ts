import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { env } from "~/env";

export const baseApi = axios.create({
  baseURL: env.NEXT_PUBLIC_API_BASE_URL,
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

export type Sessions = {
  id: string;
  user_id: number;
  expires_at: string;
};

export type Users = {
  id: number;
  email: string;
  name: string;
  // credential_id: number;
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
          async queryFn() {
            return baseApi
              .get<TanksWithLatestSample[]>("/tanks")
              .then((res) => res.data);
          },
        });
      },
    },
  },
  auth: {
    login: {
      useMutation() {
        return useMutation({
          async mutationFn(credentials: { email: string; password: string }) {
            return baseApi
              .post<Sessions>("/auth/login", credentials)
              .then((res) => res.data);
          },
        });
      },
    },
  },
};
