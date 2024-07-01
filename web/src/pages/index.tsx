import Head from "next/head";
import { useRouter } from "next/router";
import { Navbar } from "~/components/navbar";
import { useAuthContext } from "~/contexts/authContext";

export default function Home() {
  const { status } = useAuthContext();
  const router = useRouter();

  if (status === "authorized") void router.replace("/map");

  // console.log("status", status);

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
          <h1 className="mb-10 text-4xl">Grupo LAG</h1>
        </main>
      </div>
    </>
  );
}
