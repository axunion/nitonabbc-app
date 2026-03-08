import type { RouteSectionProps } from "@solidjs/router";
import { Show, Suspense } from "solid-js";
import { TabBar } from "@/components/TabBar";
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
						<AuthProvider
							user={authUser}
							refetch={refetch}
							logout={handleLogout}
						>
							<div class={styles.layout}>
								<main class={styles.main}>{props.children}</main>
								<TabBar />
							</div>
						</AuthProvider>
					)}
				</Show>
			</Suspense>
		</LocaleProvider>
	);
}

export default App;
