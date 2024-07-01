import Link from "next/link";
import { useRouter } from "next/router";
import { useAuthContext } from "~/contexts/authContext";

export function Navbar() {
  const { logout, session } = useAuthContext();
  const router = useRouter();

  return (
    <nav className="flex bg-zinc-900/80">
      {session && (
        <ul className="flex">
          <li className="h-full p-0">
            <Link
              href={"/map"}
              className="flex h-full items-center px-10 font-semibold transition hover:bg-white/20"
            >
              Ver no mapa
            </Link>
          </li>
          <li className="h-full p-0">
            <Link
              href={"/tanks/chart"}
              className="flex h-full items-center px-10 font-semibold transition hover:bg-white/20"
            >
              Ver histórico
            </Link>
          </li>
          <li className="h-full p-0">
            <Link
              href={"#"}
              className="flex h-full cursor-not-allowed items-center px-10  font-semibold opacity-50 transition hover:bg-white/20"
            >
              Analisar tanques
            </Link>
          </li>
        </ul>
      )}

      {session ? (
        <button
          className="ml-auto px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
          onClick={() => {
            logout();
            void router.replace("/");
          }}
        >
          Sair
        </button>
      ) : (
        <Link
          href="login"
          className="ml-auto px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        >
          Fazer login
        </Link>
      )}
    </nav>
  );
}
