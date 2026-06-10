import { type RouteSectionProps, useLocation } from "@solidjs/router";
import { Show, Suspense } from "solid-js";
import { logout } from "@/api/auth.ts";
import { AdminLayout } from "@/components/AdminLayout";
import { TabBar } from "@/components/TabBar";
import { Login } from "@/pages/Login";
import { AuthProvider } from "@/store/AuthContext.tsx";
import { createAuthStore } from "@/store/auth.ts";
import { LocaleProvider } from "@/store/LocaleContext.tsx";
import { isAdminPath } from "@/utils/routes.ts";
import styles from "./App.module.css";

function App(props: RouteSectionProps) {
	const { user, refetch } = createAuthStore();
	const location = useLocation();
	const isAdminRoute = () => isAdminPath(location.pathname);

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
							<Show
								when={isAdminRoute()}
								fallback={
									<div class={styles.layout}>
										<main class={styles.main}>{props.children}</main>
										<TabBar />
									</div>
								}
							>
								<AdminLayout>{props.children}</AdminLayout>
							</Show>
						</AuthProvider>
					)}
				</Show>
			</Suspense>
		</LocaleProvider>
	);
}

export default App;
