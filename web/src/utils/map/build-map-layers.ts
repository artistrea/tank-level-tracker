import { Map, View } from "ol";
import VectorLayer from "ol/layer/Vector";
import "ol/ol.css";
import { fromLonLat } from "ol/proj";
import Style from "ol/style/Style";
import Circle from "ol/style/Circle";
import Fill from "ol/style/Fill";

import MVT from "ol/format/MVT.js";
import VectorTileLayer from "ol/layer/VectorTile.js";
import VectorTileSource from "ol/source/VectorTile.js";
import { TileGrid } from "ol/tilegrid";
import Stroke from "ol/style/Stroke";
import { type FeatureLike } from "ol/Feature";

const usedLayers = [
  {
    layerId: "water",
    colors: {
      circle: "rgba(29, 78, 216, 0.4)",
      line: "rgba(37, 99, 235, 0.4)",
      polygonOutline: "rgba(37, 99, 235, 0.4)",
      polygon: "rgba(96, 165, 250, 0.4)",
    },
  },
  {
    layerId: "landuse",
    colors: {
      circle: "rgba(180, 83, 9, 0.4)",
      line: "rgba(245, 159, 10, 0.4)",
      polygonOutline: "rgba(245, 159, 10, 0.4)",
      polygon: "rgba(252, 211, 77, 0.4)",
    },
  },
  {
    layerId: "landcover",
    colors: {
      circle: "rgba(21, 128, 61, 0.4)",
      line: "rgba(34, 197, 94, 0.4)",
      polygonOutline: "rgba(34, 197, 94, 0.4)",
      polygon: "rgba(134, 239, 172, 0.4)",
    },
  },
  {
    layerId: "transportation",
    colors: {
      circle: "#ca8a04",
      line: "#ca8a04",
      polygonOutline: "#ca8a04",
      polygon: "#ca8a04",
    },
  },
  {
    layerId: "building",
    colors: {
      circle: "rgba(68, 64, 60, 0.4)",
      line: "#1c1917",
      polygonOutline: "rgba(120, 113, 108, 0.8)",
      polygon: "rgba(120, 113, 108, 0.3)",
    },
  },
  // "",
  // "",
  // "",
  // "mountain_peak",
  // "park",
  // "boundary",
  // "aeroway",
  // "",
  // "",
  // "water_name",
  // "transportation_name",
  // "place",
  // "housenumber",
  // "poi",
  // "aerodrome_label",
];

export function buildMapLayers() {
  if (typeof window === "undefined")
    return { markersLayer: undefined, map: undefined };

  const markersLayer = new VectorLayer();

  const map = new Map({
    view: new View({
      center: fromLonLat([-47.864, -15.7657]),
      zoom: 15,
      rotation: -1.2,
    }),
  });

  const layerStyles = usedLayers.reduce(
    (pr, { colors, layerId }, i) => {
      const style: Record<string, Style> = {
        Polygon: new Style({
          zIndex: i,
          fill: new Fill({ color: colors.polygon }),
          stroke: new Stroke({ color: colors.polygonOutline }),
        }),
        LineString: new Style({
          zIndex: i,
          stroke: new Stroke({ color: colors.line }),
        }),
        Point: new Style({
          zIndex: i,
          image: new Circle({
            fill: new Fill({ color: colors.circle }),
            radius: 2,
          }),
        }),
      };
      style.MultiPolygon = style.Polygon!;
      style.MultiLineString = style.LineString!;
      style.MultiPoint = style.Point!;

      return { ...pr, [layerId]: style };
    },
    {} as Record<string, Record<string, Style>>,
  );

  const tilegrid = new TileGrid({
    // altamente "inspirado" no código fonte do tilermap
    extent: [
      -20037508.342789244, -20037508.342789244, 20037508.342789244,
      20037508.342789244,
    ],
    minZoom: 0,
    sizes: [
      [1, 1],
      [2, 2],
      [4, 4],
      [8, 8],
      [16, 16],
      [32, 32],
      [64, 64],
      [128, 128],
      [256, 256],
      [512, 512],
      [1024, 1024],
      [2048, 2048],
      [4096, 4096],
      [8192, 8192],
      [16384, 16384],
    ],
    resolutions: [
      78271.51696402048, 39135.75848201024, 19567.87924100512, 9783.93962050256,
      4891.96981025128, 2445.98490512564, 1222.99245256282, 611.49622628141,
      305.748113140705, 152.8740565703525, 76.43702828517625, 38.21851414258813,
      19.109257071294063, 9.554628535647032, 4.777314267823516,
    ],
    tileSize: [512, 512],
  });

  const mapTiler = new VectorTileLayer({
    preload: Infinity,
    source: new VectorTileSource({
      attributions:
        '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
      format: new MVT(),
      tileGrid: tilegrid,

      url: "https://api.maptiler.com/tiles/b7c3dcdd-c2a7-42c4-a6ee-3f026f85650f/{z}/{x}/{y}.pbf?key=QwFANBsAASc9OO1EFNBp",
      extent: [
        -48.501000000000005, -16.317000000000018, -47.378, -15.360000000000001,
      ],
    }),
    style: (feature: FeatureLike, _resolution: number): void | [] | [Style] => {
      const layerId = feature.get("layer") as string;
      if (!layerStyles[layerId]) return;
      const style =
        layerStyles[layerId]?.[
          "getType" in feature ? (feature.getType() as string) : ""
        ];

      return style ? [style] : [];
    },
  });

  // const mapTiler = "sla"

  //   const osmLayer = new TileLayer({
  //     preload: Infinity,
  //     source: new OSM({ interpolate: true }),
  //     className: "opacity-70",
  //   });
  // map.addLayer(osmLayer);
  map.addLayer(mapTiler);
  map.addLayer(markersLayer);

  return { markersLayer, map };
}
