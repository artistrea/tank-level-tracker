import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export function useProtectedRoute() {
  const { status } = useSession();
  const router = useRouter();

  const isClientSide = typeof window !== "undefined";

  if (isClientSide && status === "unauthenticated") void router.replace("/");
}
