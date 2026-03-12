/* @refresh reload */

import { Route, Router } from "@solidjs/router";
import { lazy } from "solid-js";
import { render } from "solid-js/web";
import "./index.css";
import { Dashboard } from "@/pages/Dashboard";
import App from "./App.tsx";

const Management = lazy(() => import("@/pages/Management"));
const BulletinList = lazy(() => import("@/pages/BulletinList"));
const BulletinDetail = lazy(() => import("@/pages/BulletinDetail"));
const BulletinForm = lazy(() => import("@/pages/BulletinForm"));
const BulletinTemplate = lazy(() => import("@/pages/BulletinTemplate"));
const Settings = lazy(() => import("@/pages/Settings"));

const root = document.getElementById("root");

if (root) {
	render(
		() => (
			<Router root={App}>
				<Route path="/" component={Dashboard} />
				<Route path="/settings" component={Settings} />
				<Route path="/settings/members" component={Management} />
				<Route
					path="/settings/bulletin-template"
					component={BulletinTemplate}
				/>
				<Route path="/bulletin" component={BulletinList} />
				<Route path="/bulletin/new" component={BulletinForm} />
				<Route path="/bulletin/:id" component={BulletinDetail} />
				<Route path="/bulletin/:id/edit" component={BulletinForm} />
			</Router>
		),
		root,
	);
}
