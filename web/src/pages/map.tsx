import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { Navbar } from "~/components/navbar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/accordion";

import { api, baseApi, type TanksWithLatestSample } from "~/utils/api";
import { useMapWithMarkers } from "~/utils/map/use-map-with-markers";
import { useProtectedRoute } from "~/utils/use-protected-route";
import Link from "next/link";
import { Skeleton } from "~/components/skeleton";
import { toLonLat } from "ol/proj";
import { MapBrowserEvent } from "ol";
import { tree } from "next/dist/build/templates/app-page";

function getVolume(t: TanksWithLatestSample) {
  const maxHeight = (t.maximum_volume / t.tank_base_area) * 100;

  const liquidHeight = maxHeight - t.latest_sample_top_to_liquid_distance_in_cm;

  return (liquidHeight / 100) * t.tank_base_area;
}

function pointsToClassifiedPointsMapper(
  points: undefined | TanksWithLatestSample[],
) {
  const prio = { danger: 2, warning: 1, normal: 0 };

  return points
    ?.map((p) => ({
      ...p,
      current_volume: getVolume(p),
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

  const { data: points, isLoading, refetch } =
    api.tank.getAllWithLatestSample.useQuery();
  const mappedPoints = pointsToClassifiedPointsMapper(points);

  
  const [selectedId, setSelectedId] = useState(points?.[0]?.id);

  const [editEnable, setEditEnable] = useState(false)

  const tempId:number = -1
  const [name, setTankName] = useState("");
  const [lat, setTankLat] = useState(0);
  const [long, setTankLong] = useState(0);
  const [maximumVolume, setTankMaximumVolume] = useState(0);
  const [dangerZone, setTankDangerZone] = useState(0);
  const [alertZone, setTankAlertZone] = useState(0);
  const [tankBaseArea, setTankBaseArea] = useState(0);

  const handleCreate = (e:any) => {
    if(!name &&
      !maximumVolume &&
      !dangerZone &&
      !alertZone &&
      !tankBaseArea
      ){
      alert("Preencha todos os campos")
    }else if(
      !lat &&
      !long
      ){
      alert("Selecione uma localização no mapa")  
    }else{
      baseApi.post("/tanks", {
        name: name,
        description: name,
        maximum_volume: maximumVolume,
        volume_danger_zone: dangerZone,
        volume_alert_zone: alertZone,
        tank_base_area: tankBaseArea, //TODO: como criar isso e se volume atual faz sentido perguntar
        latitude: long, //TODO: long e lat foram invertidos, no codigo todo, inclusive funcoes to/fromLongLat 
        longitude: lat
      })
      .then((res)=> {
        baseApi.post("/samples", {
          tank_id: res.data.id,
          top_to_liquid_distance_in_cm: 0 //OBS: o tanque adicionado deve estar cheio
        })
        console.log(res)
        location.reload()
        //refetch
      }
      )
      .catch((e)=>console.log(e))
    }
    e.preventDefault()
  }


  useMapWithMarkers(mappedPoints, mapRef, selectedId, (ints:number[]) => {
      setSelectedId(ints[0])
    }, editEnable ? 
      (e:MapBrowserEvent<any>) => {
        let [newLong, newLat]:number[] = toLonLat(e.coordinate)
        setTankLat(newLat as number);
        setTankLong(newLong as number);
        setSelectedId(tempId) // deixar o marcador temporário em destaque
        e.preventDefault()
        return tempId
  }   : undefined);


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
              value={selectedId?.toString()}
              onValueChange={(v) => {
                setSelectedId(Number(v));
                setEditEnable(v===tempId.toString());
              }}
            >
              {!isLoading &&
                mappedPoints?.map((p) => (
                  <AccordionItem
                    data-type={p.type}
                    className="rounded border-l-2 border-l-green-600 p-2 data-[type=danger]:border-l-red-600 data-[type=warning]:border-l-yellow-600"
                    key={p.id}
                    value={p.id.toString()}
                  >
                    <AccordionTrigger>{p.name}</AccordionTrigger>
                    <AccordionContent className="flex flex-col">
                      {p.current_volume}/{p.maximum_volume} litros
                      <Link href="/map" className="w-max place-self-end px-2">
                        Ver Histórico
                      </Link>
                    </AccordionContent>
                  </AccordionItem>
                ))}
                <AccordionItem
                    className="rounded border-l-2 border-l-white-600 p-2"
                    key={tempId}
                    value={tempId.toString()}
                  >
                    <AccordionTrigger>{"+ Novo tanque"}</AccordionTrigger>
                    <AccordionContent className="flex flex-col">
                    <form onSubmit={handleCreate}>
                        <div className="m-1">
                            <label className="m-1">
                                Nome:
                                <input
                                    className="bg-zinc-800 border-b m-1"
                                    type="text"
                                    name="nome"
                                    value={name}
                                    onChange={(e)=>setTankName(e.target.value)}
                                />
                            </label>
                        </div>
                        <div className="m-1">
                            <label className="m-1">
                                Volume Máximo(litros):
                                <input
                                    className="bg-zinc-800 border-b m-1"
                                    type="number"
                                    min="0"
                                    name="volumeMaximo"
                                    defaultValue={maximumVolume}
                                    onChange={(e)=>setTankMaximumVolume(parseInt(e.target.value))}
                                />
                            </label>
                        </div>
                        <div className="m-1">
                            <label className="m-1">
                                Zona de alerta(litros):
                                <input
                                    className="bg-zinc-800 border-b m-1"
                                    type="number"
                                    min="0"
                                    max={maximumVolume}
                                    name="zonaAlerta"
                                    value={alertZone}
                                    onChange={(e)=>setTankAlertZone(parseInt(e.target.value))}
                                />
                            </label>
                        </div>
                        <div className="m-1">
                            <label className="m-1">
                                Zona de Perigo(litros):
                                <input
                                    className="bg-zinc-800 border-b m-1"
                                    type="number"
                                    min="0"
                                    max={alertZone}
                                    name="zonaPerigo"
                                    value={dangerZone}
                                    onChange={(e)=>setTankDangerZone(parseInt(e.target.value))}
                                />
                            </label>
                        </div>
                        <div className="m-1">
                            <label className="m-1">
                                Área da Base do tanque(m²):
                                <input
                                    className="bg-zinc-800 border-b m-1"
                                    type="number"
                                    min="0"
                                    name="tank_base_area"
                                    value={tankBaseArea}
                                    onChange={(e)=>setTankBaseArea(parseInt(e.target.value))}
                                />
                            </label>
                        </div>
                        <div className="m-1">
                            <label className="m-1">
                                Localização:
                                <input
                                    className="bg-zinc-800 m-1"
                                    disabled={true}
                                    type="text"
                                    name="localização"
                                    value={"Selecione no mapa"}
                                />
                            </label>
                        </div>
                        <button className="p-1 mt-3 bg-zinc-700"
                          type="submit">
                            Criar
                          </button>
                    </form>
                    </AccordionContent>
                  </AccordionItem>
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
