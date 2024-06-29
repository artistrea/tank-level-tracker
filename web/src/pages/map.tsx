import Head from "next/head";
import { useRef, useState } from "react";
import { Navbar } from "~/components/navbar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/accordion";

import { api, type TanksWithLatestSample } from "~/utils/api";
import { useMapWithMarkers } from "~/utils/map/use-map-with-markers";
import { useProtectedRoute } from "~/utils/use-protected-route";
import Link from "next/link";
import { Skeleton } from "~/components/skeleton";

function getVolume(t: TanksWithLatestSample) {
  const maxHeight = t.maximum_volume / t.tank_base_area;
  const liquidHeight = maxHeight - t.latest_sample_top_to_liquid_distance_in_cm;
  return liquidHeight * t.tank_base_area;
}

function pointsToClassifiedPointsMapper(
  points: undefined | TanksWithLatestSample[],
) {
  const prio = { danger: 2, warning: 1, normal: 0 };

  return points
    ?.map((p) => ({
      ...p,
      type:
        getVolume(p) <= p.volume_danger_zone
          ? ("danger" as const)
          : getVolume(p) <= p.volume_alert_zone
            ? ("warning" as const)
            : ("normal" as const),
      lat: p.latitude,
      long: p.longitude,
    }))
    .sort((a, b) =>
      prio[a.type] > prio[b.type] ? -1 : prio[a.type] < prio[b.type] ? 1 : 0,
    );
}

export default function MapPage() {
  useProtectedRoute();
  const mapRef = useRef<HTMLDivElement>(null);

  // TODO: create post to create new tank

  const { data: points, isLoading } =
    api.tank.getAllWithLatestSample.useQuery();
  const mappedPoints = pointsToClassifiedPointsMapper(points);

  const [selectedId, setSelectedId] = useState(points?.[0]?.id);
  useMapWithMarkers(mappedPoints, mapRef, selectedId, setSelectedId);

  return (
    <>
      <Head>
        <title>UnB - Trabalho de TR2</title>
        <meta name="description" content="Trabalho de TR2" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 flex-col items-center justify-center bg-zinc-800">
          <div className="flex w-full">
            <Accordion
              type="single"
              collapsible
              className="flex max-h-[40rem] w-[40%] flex-col gap-4 overflow-scroll"
              onValueChange={(v) => setSelectedId(v)}
              value={selectedId}
            >
              {!isLoading &&
                mappedPoints?.map((p) => (
                  <AccordionItem
                    data-type={
                      p.volume <= p.dangerZone
                        ? "danger"
                        : p.volume <= p.alertZone
                          ? "warning"
                          : ""
                    }
                    className="rounded border-l-2 border-l-green-600 p-2 data-[type=danger]:border-l-red-600 data-[type=warning]:border-l-yellow-600"
                    key={p.id}
                    value={p.id}
                  >
                    <AccordionTrigger>{p.name}</AccordionTrigger>
                    <AccordionContent className="flex flex-col">
                      {p.volume}/{p.maximumVolume} litros
                      <Link href="/map" className="w-max place-self-end px-2">
                        Ver Histórico
                      </Link>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              {isLoading &&
                Array.from({ length: 8 })?.map((p, i) => (
                  <AccordionItem
                    disabled
                    className="relative p-2"
                    key={i}
                    value={""}
                  >
                    <AccordionTrigger>
                      <div className="flex">
                        <Skeleton className="absolute bottom-0 left-0 top-0 w-1"></Skeleton>
                        <Skeleton className="h-6 w-16 py-2"></Skeleton>
                      </div>
                    </AccordionTrigger>
                  </AccordionItem>
                ))}
            </Accordion>
            <div
              data-loading={isLoading}
              className="relative h-[40rem] w-[60%] overflow-hidden rounded"
            >
              {isLoading && <Skeleton className="absolute inset-0" />}

              <div
                className="h-full w-full bg-white data-[loading='true']:hidden"
                data-loading={isLoading}
                ref={mapRef}
              ></div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
