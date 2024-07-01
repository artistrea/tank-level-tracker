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
  status: "loading" | "unauthorized" | "authorized";
};

const SESSION_COOKIE_NAME = "session";

const authContext = createContext<Context>({ session: undefined } as Context);

function defaultAuthHeader(session: Sessions) {
  baseApi.defaults.headers.common.Authorization = `Bearer ${session.id}:${session.user_id}`;
}

export function useAuthContext() {
  const ctx = useContext(authContext);
  // console.log("ctx", ctx);
  if (!ctx)
    throw new Error(
      "You can only call `useAuthContext` inside an `AuthContextProvider`",
    );

  return ctx;
}

export function AuthContextProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Context["session"]>(undefined);
  const [status, setStatus] = useState<Context["status"]>("loading");

  useEffect(() => {
    const sessionStr = Cookies.get(SESSION_COOKIE_NAME);

    if (typeof sessionStr === "string") {
      try {
        const sess = JSON.parse(sessionStr) as Sessions;

        setSession(sess);
      } catch (_) {
        setStatus("unauthorized");
      }
    } else {
      setStatus("unauthorized");
    }
  }, []);

  useEffect(() => {
    if (session) {
      Cookies.set(SESSION_COOKIE_NAME, JSON.stringify(session));
      setStatus("authorized");
      defaultAuthHeader(session);
    } else {
    }
  }, [session]);

  const { mutateAsync: apiLogin } = api.auth.login.useMutation();

  async function login(credentials: { email: string; password: string }) {
    return apiLogin(credentials).then((res) => {
      // console.log("res", res);
      setSession(res);
      setStatus("authorized");

      return res;
    });
  }

  function logout() {
    setSession(undefined);
    setStatus("unauthorized");
    Cookies.remove(SESSION_COOKIE_NAME);
  }

  return (
    <authContext.Provider value={{ status, session, login, logout }}>
      {children}
    </authContext.Provider>
  );
}
