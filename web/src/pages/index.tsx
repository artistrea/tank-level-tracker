import Head from "next/head";
import { useRouter } from "next/router";
import { Navbar } from "~/components/navbar";
import { useAuthContext } from "~/contexts/authContext";

export default function Home() {
  const { session } = useAuthContext();
  const router = useRouter();

  if (session) void router.replace("/map");

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
          Faça login
        </main>
      </div>
    </>
  );
}
