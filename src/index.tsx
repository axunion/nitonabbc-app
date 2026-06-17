/* @refresh reload */

import { Navigate, Route, Router } from "@solidjs/router";
import { lazy } from "solid-js";
import { render } from "solid-js/web";
import "./index.css";
import { MemberLayout } from "@/components/MemberLayout";
import { Dashboard } from "@/pages/Dashboard";
import App from "./App.tsx";

const BulletinList = lazy(() => import("@/pages/BulletinList"));
const BulletinDetail = lazy(() => import("@/pages/BulletinDetail"));
const BulletinForm = lazy(() => import("@/pages/BulletinForm"));
const Settings = lazy(() => import("@/pages/Settings"));
const AdminLayout = lazy(() => import("@/components/AdminLayout"));
const Management = lazy(() => import("@/pages/Management"));
const BulletinTemplate = lazy(() => import("@/pages/BulletinTemplate"));

const AdminRedirect = () => <Navigate href="/admin/members" />;

const root = document.getElementById("root");

if (root) {
  render(
    () => (
      <Router root={App}>
        {/* Member section: TabBar layout */}
        <Route path="/" component={MemberLayout}>
          <Route path="/" component={Dashboard} />
          <Route path="/settings" component={Settings} />
          <Route path="/bulletin" component={BulletinList} />
          <Route path="/bulletin/new" component={BulletinForm} />
          <Route path="/bulletin/:id" component={BulletinDetail} />
          <Route path="/bulletin/:id/edit" component={BulletinForm} />
        </Route>
        {/* Admin section: sidebar + pages all lazy-loaded */}
        <Route path="/admin" component={AdminLayout}>
          <Route path="/" component={AdminRedirect} />
          <Route path="/members" component={Management} />
          <Route path="/bulletin-template" component={BulletinTemplate} />
        </Route>
      </Router>
    ),
    root,
  );
}
