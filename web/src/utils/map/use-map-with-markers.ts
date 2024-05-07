import {
  type RefObject,
  type Dispatch,
  type SetStateAction,
  useEffect,
  useRef,
} from "react";

import { type MapBrowserEvent, Feature } from "ol";
import "ol/ol.css";
import { fromLonLat } from "ol/proj";
import { Point } from "ol/geom";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import Text from "ol/style/Text";
import VectorSource from "ol/source/Vector";
import Fill from "ol/style/Fill";

import Stroke from "ol/style/Stroke";
import { buildMapLayers } from "./build-map-layers";

const TYPE_TO_COLOR = {
  danger: "rgb(255,20,20)",
  warning: "#facc15",
  normal: "#4ade80",
} as const;
const prio = { danger: 2, warning: 1, normal: 0 };

const { map, markersLayer } = buildMapLayers();

export function useMapWithMarkers(
  markers:
    | undefined
    | {
        lat: number;
        long: number;
        name: string;
        id: string;
        type: "danger" | "warning" | "normal";
      }[],
  mapRef: RefObject<HTMLDivElement>,
  selectedMarkerId: string | undefined,
  setSelectedMarkerId: Dispatch<SetStateAction<string | undefined>>,
) {
  const hasRenderedMap = useRef(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onClickCallback = (event: MapBrowserEvent<any>) => {
      map?.forEachFeatureAtPixel(event.pixel, function (feature, _layer) {
        const id = feature.getId();
        if (typeof id === "string") {
          setSelectedMarkerId((prevId) => (prevId === id ? undefined : id));
        }
      });
      event.preventDefault();
    };

    map?.on("click", onClickCallback);

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
  }, [setSelectedMarkerId]);

  useEffect(() => {
    markersLayer?.setSource(
      new VectorSource({
        features:
          markers?.map((p) => {
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

            return feature;
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
