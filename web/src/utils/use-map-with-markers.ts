import {
  type RefObject,
  type Dispatch,
  type SetStateAction,
  useEffect,
  useRef,
} from "react";

import { type MapBrowserEvent, Feature, Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import "ol/ol.css";
import { fromLonLat } from "ol/proj";
import { Point } from "ol/geom";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import Text from "ol/style/Text";
import VectorSource from "ol/source/Vector";
import Fill from "ol/style/Fill";

function createStuff() {
  if (typeof window === "undefined")
    return { markersLayer: undefined, map: undefined };

  const osmLayer = new TileLayer({
    preload: Infinity,
    source: new OSM(),
  });
  const markersLayer = new VectorLayer();

  const map = new Map({
    layers: [osmLayer, markersLayer],
    view: new View({
      center: fromLonLat([-47.862, -15.7657]),
      zoom: 14,
      maxZoom: 20,
      minZoom: 12,
      projection: "EPSG:3857",
    }),
  });

  // [TODO]: Use better tyling for local

  // const mapTiler = "sla"
  // map.addLayer(mapTiler);

  return { markersLayer, map };
}

const { map, markersLayer } = createStuff();

export function useMapWithMarkers(
  markers:
    | undefined
    | { lat: number; long: number; name: string; id: string }[],
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
        if (typeof id === "string") setSelectedMarkerId(id);
      });
      console.log("opa");

      event.preventDefault();
    };

    map?.on("click", onClickCallback);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onPointerMoveCallback = (event: MapBrowserEvent<any>) => {
      const hit = map?.forEachFeatureAtPixel(event.pixel, () => true);
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
            const f = new Feature({
              geometry: new Point(fromLonLat([p.lat, p.long])),
            });

            f.setId(p.id);

            f.setStyle(
              new Style({
                image: new Icon({
                  src: "/map-pin.svg",
                  crossOrigin: "anonymous",
                  anchor: [0.5, 1],
                  height: selectedMarkerId === p.id ? 48 : undefined,
                  color: selectedMarkerId === p.id ? "red" : undefined,
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

            f.addEventListener("onclick", () => {
              alert("a");
            });

            return f;
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
