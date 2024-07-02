import { RefreshCcw } from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { ApexChart } from "~/components/ApexChart";
import { Checkbox } from "~/components/checkbox";
import { Navbar } from "~/components/navbar";
import { api } from "~/utils/api";
import { getVolume } from "~/utils/get-volume";
import { useProtectedRoute } from "~/utils/use-protected-route";

export default function Chart() {
  useProtectedRoute();
  const { data: samples, refetch } = api.sample.getAll.useQuery();
  const { data: tanks } = api.tank.getAllWithLatestSample.useQuery();

  const router = useRouter();

  const include = router.query.includeTankId as string;
  const [filteredTanks, setFilteredTanks] = useState<string[]>(
    include ? [include] : [],
  );

  const chartData = tanks
    ?.filter((t) => filteredTanks.includes(t?.id.toString()))
    .map((tank) => ({
      name: tank.name,
      data: !samples
        ? []
        : samples
            .filter((sample) => sample.tank_id === tank.id)
            .map((sample) => {
              console.log(
                `{
                latest_sample_top_to_liquid_distance_in_cm:
                  sample.top_to_liquid_distance_in_cm,
                maximum_volume: tank.maximum_volume,
                tank_base_area: tank.tank_base_area,
              }`,
                {
                  latest_sample_top_to_liquid_distance_in_cm:
                    sample.top_to_liquid_distance_in_cm,
                  maximum_volume: tank.maximum_volume,
                  tank_base_area: tank.tank_base_area,
                },
              );
              return {
                x: sample.timestamp,
                y: getVolume({
                  latest_sample_top_to_liquid_distance_in_cm:
                    sample.top_to_liquid_distance_in_cm,
                  maximum_volume: tank.maximum_volume,
                  tank_base_area: tank.tank_base_area,
                }),
              };
            }),
    })) satisfies ApexAxisChartSeries | ApexNonAxisChartSeries | undefined;

  return (
    <>
      <Head>
        <title>UnB - Trabalho de TR2</title>
        <meta name="description" content="Trabalho de TR2" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center bg-zinc-800 p-10">
          <div className="w-1/3">
            <button
              onClick={() => {
                void refetch();
              }}
            >
              <RefreshCcw />
            </button>
            <ul>
              {tanks?.map((t) => (
                <li key={t?.id} className="w-full">
                  <label
                    htmlFor={t?.id.toString()}
                    className="block w-full p-2"
                  >
                    <Checkbox
                      checked={filteredTanks.includes(t?.id.toString())}
                      id={t?.id.toString()}
                      onCheckedChange={(isChecked) => {
                        setFilteredTanks((prevFiltered) => {
                          //   console.log("prevFiltered", prevFiltered);
                          if (isChecked) {
                            return [...prevFiltered, t?.id.toString()];
                          }
                          return [
                            ...prevFiltered.filter(
                              (f) => f !== t?.id.toString(),
                            ),
                          ];
                        });
                      }}
                    />{" "}
                    {t?.name}
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-2/3">
            <ApexChart series={chartData} />
          </div>
        </main>
      </div>
    </>
  );
}
