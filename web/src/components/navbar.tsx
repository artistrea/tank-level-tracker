import Link from "next/link";
import { useAuthContext } from "~/contexts/authContext";

export function Navbar() {
  const { logout, session } = useAuthContext();

  return (
    <nav className="flex bg-zinc-900/80">
      {session && (
        <ul>
          <li className="h-full p-0">
            <Link
              href={"/map"}
              className="flex h-full items-center px-10 font-semibold transition hover:bg-white/20"
            >
              Ver no mapa
            </Link>
          </li>
        </ul>
      )}

      {session ? (
        <button
          className="ml-auto px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
          onClick={logout}
        >
          Sair
        </button>
      ) : (
        <a
          href="login"
          className="ml-auto px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        >
          Fazer login
        </a>
      )}
    </nav>
  );
}
