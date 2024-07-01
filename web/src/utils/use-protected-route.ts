import { useRouter } from "next/router";
import { useAuthContext } from "~/contexts/authContext";

export function useProtectedRoute() {
  const { status } = useAuthContext();
  const router = useRouter();

  const isClientSide = typeof window !== "undefined";

  if (isClientSide && status === "unauthorized") void router.replace("/");
}
