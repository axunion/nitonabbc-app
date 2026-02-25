import type { RouteSectionProps } from "@solidjs/router";
import { Show, Suspense } from "solid-js";
import { Header } from "@/components/Header";
import { Login } from "@/pages/Login";
import { AuthProvider } from "@/store/AuthContext.tsx";
import { createAuthStore } from "@/store/auth.ts";
import { LocaleProvider } from "@/store/LocaleContext.tsx";
import styles from "./App.module.css";

function App(props: RouteSectionProps) {
	const { user, refetch } = createAuthStore();

	async function handleLogout() {
		await fetch("/api/auth/logout", { method: "POST" });
		await refetch();
	}

	return (
		<LocaleProvider>
			<Suspense>
				<Show when={user()} fallback={<Login />}>
					{(authUser) => (
						<AuthProvider user={authUser} refetch={refetch}>
							<div class={styles.layout}>
								<Header user={authUser()} onLogout={handleLogout} />
								<main class={styles.main}>{props.children}</main>
							</div>
						</AuthProvider>
					)}
				</Show>
			</Suspense>
		</LocaleProvider>
	);
}

export default App;
