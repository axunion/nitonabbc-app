/* @refresh reload */

import { Route, Router } from "@solidjs/router";
import { lazy } from "solid-js";
import { render } from "solid-js/web";
import "./index.css";
import { Dashboard } from "@/pages/Dashboard";
import App from "./App.tsx";

const Management = lazy(() => import("@/pages/Management"));

const root = document.getElementById("root");

if (root) {
	render(
		() => (
			<Router root={App}>
				<Route path="/" component={Dashboard} />
				<Route path="/admin" component={Management} />
			</Router>
		),
		root,
	);
}
