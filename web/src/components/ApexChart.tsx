"use client";
import dynamic from "next/dynamic";

const ImportedChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export function ApexChart({
  series,
}: {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries | undefined;
}) {
  if (typeof window === "undefined") return;

  return (
    <ImportedChart
      {...{
        options: {
          theme: {
            mode: "dark",
          },
          chart: {
            background: "transparent",
            id: "basic-bar",
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
