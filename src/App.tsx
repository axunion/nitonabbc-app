import { Show, Suspense } from "solid-js";
import { Login } from "@/pages/Login";
import { createAuthStore } from "@/store/auth.ts";

function App() {
	const { user } = createAuthStore();

	return (
		<Suspense>
			<Show when={user()} fallback={<Login />}>
				{(authUser) => (
					<div>
						<h1>nitonabbc-app</h1>
						<p>ようこそ、{authUser().name} さん</p>
					</div>
				)}
			</Show>
		</Suspense>
	);
}

export default App;
