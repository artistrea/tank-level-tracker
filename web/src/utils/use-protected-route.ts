import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export function useProtectedRoute() {
  const { data: sessionData } = useSession();
  const router = useRouter();

  const isClientSide = typeof window !== "undefined";
  const isLoggedIn = !!sessionData;

  if (isClientSide && !isLoggedIn) void router.replace("/");
}
