import Cookies from "js-cookie";
import {
  type PropsWithChildren,
  createContext,
  useEffect,
  useState,
  useContext,
} from "react";
import { baseApi, api, type Sessions } from "~/utils/api";

type Context = {
  session: undefined | Sessions;
  login: ReturnType<typeof api.auth.login.useMutation>["mutateAsync"];
  logout: () => void;
};

const SESSION_COOKIE_NAME = "session";

const authContext = createContext<Context>({ session: undefined } as Context);

function defaultAuthHeader(session: Sessions) {
  if (session)
    baseApi.defaults.headers.common.Authorization = `Bearer ${session?.id}:${session?.user_id}`;
}

export function useAuthContext() {
  const ctx = useContext(authContext);

  if (!ctx)
    throw new Error(
      "You can only call `useAuthContext` inside an `AuthContextProvider`",
    );

  return ctx;
}

export function AuthContextProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Context["session"]>(undefined);

  useEffect(() => {
    const sessionStr = Cookies.get(SESSION_COOKIE_NAME);

    if (typeof sessionStr === "string") {
      try {
        const sess = JSON.parse(sessionStr) as Sessions;

        defaultAuthHeader(sess);

        setSession(sess);
      } catch (_) {}
    }
  }, []);

  useEffect(() => {
    if (session) {
      Cookies.set(SESSION_COOKIE_NAME, JSON.stringify(session));
    }
  }, [session]);

  const { mutateAsync: apiLogin } = api.auth.login.useMutation();

  async function login(credentials: { email: string; password: string }) {
    return apiLogin(credentials).then((res) => {
      setSession(res);

      return res;
    });
  }

  function logout() {
    Cookies.remove(SESSION_COOKIE_NAME);
  }

  return (
    <authContext.Provider value={{ session, login, logout }}>
      {children}
    </authContext.Provider>
  );
}
