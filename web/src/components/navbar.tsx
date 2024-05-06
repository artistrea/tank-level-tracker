import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export function Navbar() {
  const { data: sessionData } = useSession();

  return (
    <nav className="flex bg-zinc-900/80">
      {sessionData && (
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

      <button
        className="ml-auto px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sair" : "Fazer login"}
      </button>
    </nav>
  );
}
