import { isAxiosError } from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import { type FormEventHandler, useState } from "react";
import { useAuthContext } from "~/contexts/authContext";

export default function Home() {
  const { session, login } = useAuthContext();
  const router = useRouter();
  const [hidePwd, setHidePwd] = useState(true);
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const [isPending, setIsPending] = useState(false);

  const onSubmit: FormEventHandler = (e) => {
    setIsPending(true);
    void login(credentials)
      // .then(() => {})
      .catch((err) => {
        if (isAxiosError(err) && err.response?.statusText)
          alert(err.response?.statusText);
        else {
          alert("Ocorreu um erro inesperado");
          console.log(err);
        }
      })
      .finally(() => {
        setIsPending(false);
      });

    e.preventDefault();
  };

  if (session) void router.replace("/map");

  return (
    <>
      <Head>
        <title>Login | UnB - Trabalho de TR2</title>
        <meta name="description" content="Página de login Trabalho de TR2" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen flex-col">
        <main className="flex flex-1 flex-col items-center justify-center bg-zinc-800">
          <form onSubmit={onSubmit}>
            <fieldset
              className="flex flex-col gap-4  disabled:opacity-70"
              disabled={isPending}
            >
              <div className="flex flex-col gap-2">
                <label htmlFor="email">Email:</label>
                <input
                  onChange={(e) =>
                    setCredentials((c) => ({ ...c, email: e.target.value }))
                  }
                  id="email"
                  className="rounded-md bg-zinc-700 px-4 py-1 disabled:cursor-progress"
                />
              </div>
              <div className="relative flex flex-col gap-0">
                <label htmlFor="password">Senha:</label>
                <div className="flex">
                  <input
                    type={hidePwd ? "password" : "text"}
                    onChange={(e) =>
                      setCredentials((c) => ({
                        ...c,
                        password: e.target.value,
                      }))
                    }
                    id="password"
                    className="z-50 rounded-l-md bg-zinc-700 px-4 py-1 disabled:cursor-progress"
                  />
                  <button
                    type="button"
                    className="rounded-r-md border-l border-l-zinc-600 bg-zinc-700 px-2"
                    onClick={() => setHidePwd((b) => !b)}
                  >
                    {hidePwd ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              <button className="relative mt-10 w-full rounded-md bg-zinc-100 p-1 text-lg font-semibold text-zinc-800 disabled:cursor-progress">
                {isPending ? "Entrando..." : "Entrar"}
              </button>
            </fieldset>
          </form>
        </main>
      </div>
    </>
  );
}

function Eye() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}
