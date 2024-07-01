import {
  type RefObject,
  type Dispatch,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";

import { type MapBrowserEvent, Feature } from "ol";
import "ol/ol.css";
import { fromLonLat, toLonLat } from "ol/proj";
import { Point } from "ol/geom";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import Text from "ol/style/Text";
import VectorSource from "ol/source/Vector";
import Fill from "ol/style/Fill";

import Stroke from "ol/style/Stroke";
import { buildMapLayers } from "./build-map-layers";
import type { FeatureLike } from "ol/Feature";

const TYPE_TO_COLOR = {
  danger: "rgb(255,20,20)",
  warning: "#facc15",
  normal: "#4ade80",
} as const;
const prio = { danger: 2, warning: 1, normal: 0 };

const { map, markersLayer } = buildMapLayers();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OnClick = (event: MapBrowserEvent<any>) => number;
type onSelect = (intersectsIds: number[]) => void;

export function useMapWithMarkers(
  markers:
    | undefined
    | {
        lat: number;
        long: number;
        name: string;
        id: number;
        type: "danger" | "warning" | "normal";
      }[],
  mapRef: RefObject<HTMLDivElement>,
  selectedMarkerId: number | undefined,
  onSelect: onSelect,
  onClick?: OnClick,
) {
  const hasRenderedMap = useRef(false);

  const [newLocation, setNewLocation] = useState({})


  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onClickCallback = (event: MapBrowserEvent<any>) => {
      const intersects: number[] = [];
      map?.forEachFeatureAtPixel(event.pixel, function (feature, _layer) {
        const id = feature.getId();
        if (typeof id === "number") {
          intersects.push(id);
          // setSelectedMarkerId((prevId) => (prevId === id ? undefined : id));
        }
      });
      if(onClick){
        let tempId = onClick(event);
        setNewLocation({name: "Nova localização", id:tempId, lat:toLonLat(event.coordinate)[0],long:toLonLat(event.coordinate)[1]})
      }else{
        setNewLocation({});
        onSelect(intersects);
      }
      event.preventDefault();
    };
    map?.on("click", onClickCallback);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onDblClickCallback = (event: MapBrowserEvent<any>) => {
      const new_tank_coord = event.coordinate.toString();

      // TODO: CRIAR NOVO TANK
      void navigator.clipboard.writeText(new_tank_coord);
      event.preventDefault();
    };

    map?.on("dblclick", onDblClickCallback);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onPointerMoveCallback = (event: MapBrowserEvent<any>) => {
      const hit = map?.forEachFeatureAtPixel(
        event.pixel,
        (t) => t.get("isMarker") as boolean | undefined,
      );
      if (hit) {
        map && (map.getTargetElement().style.cursor = "pointer");
      } else {
        map && (map.getTargetElement().style.cursor = "");
      }
    };
    map?.on("pointermove", onPointerMoveCallback);

    return () => {
      map?.un("click", onClickCallback);
      map?.un("pointermove", onPointerMoveCallback);
    };
  }, [onClick]);

  useEffect(() => {
    let locations = newLocation ? markers?.concat(newLocation) : markers
    markersLayer?.setSource(
      new VectorSource({
        features:
          locations?.map((p) => {
            const feature = new Feature({
              geometry: new Point(fromLonLat([p.lat, p.long])),
            });

            feature.setId(p.id);

            feature.setStyle(
              new Style({
                zIndex: 99 + prio[p.type],
                image: new Icon({
                  src: "/map-pin.svg",
                  crossOrigin: "anonymous",
                  anchor: [0.5, 1.2],
                  height: selectedMarkerId === p.id ? 48 : undefined,
                  color: TYPE_TO_COLOR[p.type],
                }),
                stroke: new Stroke({
                  color: "#000",
                  width: 4,
                }),
                fill: new Fill({
                  color: "#000",
                }),
                text: new Text({
                  text: p.name,
                  font: "14px 'sans-serif'",
                  backgroundFill: new Fill({
                    color: "rgba(255,255,255,0.7)",
                  }),
                }),
              }),
            );

            feature.set("isMarker", true);

            return feature as FeatureLike;
          }) ?? [],
      }),
    );
  }, [markers, selectedMarkerId]);

  useEffect(() => {
    if (!hasRenderedMap.current && mapRef.current) {
      map?.setTarget(mapRef.current);
      hasRenderedMap.current = true;
    }
  }, [mapRef]);
}
