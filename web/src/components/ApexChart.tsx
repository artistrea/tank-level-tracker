"use client";
import dynamic from "next/dynamic";

const ImportedChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export function ApexChart({
  series,
}: {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries | undefined;
}) {
  if (typeof window === "undefined") return;

  return (
    <ImportedChart
      chart={{
        background: "transparent",
        id: "basic-bar",
      }}
      {...{
        options: {
          theme: {
            mode: "dark",
          },
          xaxis: {
            type: "datetime",
          },
        },

        series: series,
      }}
    />
  );
}
