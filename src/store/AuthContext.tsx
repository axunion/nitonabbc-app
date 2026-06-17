import { type Accessor, createContext, type JSX, useContext } from "solid-js";
import type { AuthUser } from "./auth.ts";

type AuthContextValue = {
  user: Accessor<AuthUser>;
  refetch: () => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>();

type AuthProviderProps = {
  user: Accessor<AuthUser>;
  refetch: () => void;
  logout: () => Promise<void>;
  children: JSX.Element;
};

export function AuthProvider(props: AuthProviderProps) {
  return (
    <AuthContext.Provider
      value={{ user: props.user, refetch: props.refetch, logout: props.logout }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
