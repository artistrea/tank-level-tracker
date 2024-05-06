import Head from "next/head";
import { useRef, useState } from "react";
import { Navbar } from "~/components/navbar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/accordion";

import { type RouterOutputs, api } from "~/utils/api";
import { useMapWithMarkers } from "~/utils/use-map-with-markers";
import { useProtectedRoute } from "~/utils/use-protected-route";
import Link from "next/link";

function pointsToClassifiedPointsMapper(
  points: undefined | RouterOutputs["tank"]["getAllWithLatestSample"],
) {
  const prio = { danger: 2, warning: 1, normal: 0 };

  return points
    ?.map((p) => ({
      ...p,
      type:
        p.volume <= p.dangerZone
          ? ("danger" as const)
          : p.volume <= p.alertZone
            ? ("warning" as const)
            : ("normal" as const),
    }))
    .sort((a, b) =>
      prio[a.type] > prio[b.type] ? -1 : prio[a.type] < prio[b.type] ? 1 : 0,
    );
}

export default function MapPage() {
  useProtectedRoute();
  const mapRef = useRef<HTMLDivElement>(null);

  const { data: points } = api.tank.getAllWithLatestSample.useQuery();
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
              className="flex w-[40%] flex-col gap-4"
              onChange={() => alert("")}
              onValueChange={(v) => setSelectedId(v)}
              value={selectedId}
            >
              {mappedPoints?.map((p) => (
                <AccordionItem
                  data-type={
                    p.volume <= p.dangerZone
                      ? "danger"
                      : p.volume <= p.alertZone
                        ? "warning"
                        : ""
                  }
                  className="border-l-2 border-l-green-600 p-2 data-[type=danger]:border-l-red-600 data-[type=warning]:border-l-yellow-600"
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
            </Accordion>

            <div className="h-[40rem] w-[60%]" ref={mapRef}></div>
          </div>
        </main>
      </div>
    </>
  );
}
