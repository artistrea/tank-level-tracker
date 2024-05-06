// import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  // publicProcedure,
} from "~/server/api/trpc";
// import { posts } from "~/server/db/schema";

export const tankRouter = createTRPCRouter({
  getAllWithLatestSample: protectedProcedure.query(async () => {
    // simulate a slow db call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return [
      {
        id: "id1",
        name: "Tanque 1",
        lat: -47.862,
        long: -15.7657,
        maximumVolume: 15,
        dangerZone: 7,
        alertZone: 11,
        volume: 10,
        referenceDate: "2024-02-25",
      },
      {
        id: "id2",
        name: "Tanque 2",
        lat: -47.868,
        long: -15.7659,
        maximumVolume: 30,
        dangerZone: 15,
        alertZone: 20,
        volume: 15,
        referenceDate: "2024-02-25",
      },
      {
        id: "id3",
        name: "Tanque 3",
        lat: -47.868,
        long: -15.7659,
        maximumVolume: 30,
        dangerZone: 15,
        alertZone: 20,
        volume: 30,
        referenceDate: "2024-02-25",
      },
      {
        id: "id4",
        name: "Tanque 4",
        lat: -47.862,
        long: -15.767,
        maximumVolume: 30,
        dangerZone: 15,
        alertZone: 20,
        volume: 15,
        referenceDate: "2024-02-25",
      },
    ];
  }),
});
