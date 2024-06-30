import { useRouter } from "next/router";
import { useAuthContext } from "~/contexts/authContext";

export function useProtectedRoute() {
  const { session } = useAuthContext();
  const router = useRouter();

  const isClientSide = typeof window !== "undefined";

  if (isClientSide && !session) void router.replace("/");
}
