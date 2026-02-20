import { Show, Suspense } from "solid-js";
import { Header } from "@/components/Header";
import { Dashboard } from "@/pages/Dashboard";
import { Login } from "@/pages/Login";
import { createAuthStore } from "@/store/auth.ts";
import styles from "./App.module.css";

function App() {
	const { user, refetch } = createAuthStore();

	async function handleLogout() {
		await fetch("/api/auth/logout", { method: "POST" });
		await refetch();
	}

	return (
		<Suspense>
			<Show when={user()} fallback={<Login />}>
				{(authUser) => (
					<div class={styles.layout}>
						<Header user={authUser()} onLogout={handleLogout} />
						<main class={styles.main}>
							<Dashboard />
						</main>
					</div>
				)}
			</Show>
		</Suspense>
	);
}

export default App;
