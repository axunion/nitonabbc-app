import type { RouteSectionProps } from "@solidjs/router";
import { Show, Suspense } from "solid-js";
import { logout } from "@/api/auth.ts";
import { Toaster } from "@/components/Toast/index.ts";
import { Login } from "@/pages/Login";
import { AuthProvider } from "@/store/AuthContext.tsx";
import { createAuthStore } from "@/store/auth.ts";
import { LocaleProvider } from "@/store/LocaleContext.tsx";

function App(props: RouteSectionProps) {
  const { user, refetch } = createAuthStore();

  async function handleLogout() {
    await logout();
    await refetch();
  }

  return (
    <LocaleProvider>
      <Suspense>
        <Show when={user()} fallback={<Login />}>
          {(authUser) => (
            <AuthProvider
              user={authUser}
              refetch={refetch}
              logout={handleLogout}
            >
              {props.children}
            </AuthProvider>
          )}
        </Show>
      </Suspense>
      <Toaster />
    </LocaleProvider>
  );
}

export default App;
