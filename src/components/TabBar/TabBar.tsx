import { A, useLocation, useNavigate } from "@solidjs/router";
import { Church, LayoutDashboard, Settings } from "lucide-solid";
import { createEffect, createMemo, createSignal, Show } from "solid-js";
import { useAuth } from "@/store/AuthContext.tsx";
import { useLocale } from "@/store/LocaleContext.tsx";
import styles from "./TabBar.module.css";

const ICON_SIZE = 20;
const ICON_STROKE = 1.5;

type Tab = "church" | "settings";

function getTabForPath(path: string): Tab {
  return path.startsWith("/settings") ? "settings" : "church";
}

// Module-level so tab memory survives TabBar unmounts
const [tabMemory, setTabMemory] = createSignal<Record<Tab, string>>({
  church: "/",
  settings: "/settings",
});

export function TabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLocale();
  const { user } = useAuth();
  const currentTab = createMemo(() => getTabForPath(location.pathname));

  createEffect(() => {
    const path = location.pathname;
    const tab = getTabForPath(path);
    setTabMemory((prev) => ({ ...prev, [tab]: path }));
  });

  function handleTabClick(tab: Tab, rootPath: string) {
    if (currentTab() !== tab) {
      navigate(tabMemory()[tab]);
    } else {
      navigate(rootPath);
    }
  }

  function isActive(tab: Tab) {
    return currentTab() === tab;
  }

  const activeIndex = () => (currentTab() === "settings" ? 1 : 0);

  return (
    <nav
      class={styles.tabBar}
      classList={{
        [styles.hiddenOnMobile]:
          location.pathname !== "/" && location.pathname !== "/settings",
      }}
      aria-label={t("common.churchName")}
    >
      <div class={styles.brand}>
        <span class={styles.brandName}>{t("common.churchName")}</span>
      </div>
      <div
        class={styles.nav}
        style={{ "--active-index": String(activeIndex()) }}
      >
        <div class={styles.indicator} aria-hidden="true" />
        <button
          type="button"
          class={styles.tab}
          classList={{ [styles.active]: isActive("church") }}
          onClick={() => handleTabClick("church", "/")}
        >
          <Church size={ICON_SIZE} stroke-width={ICON_STROKE} />
          <span class={styles.label}>{t("tabbar.church")}</span>
        </button>
        <button
          type="button"
          class={styles.tab}
          classList={{ [styles.active]: isActive("settings") }}
          onClick={() => handleTabClick("settings", "/settings")}
        >
          <Settings size={ICON_SIZE} stroke-width={ICON_STROKE} />
          <span class={styles.label}>{t("tabbar.settings")}</span>
        </button>
      </div>
      <Show when={user().role === "admin"}>
        <div class={styles.sidebarFooter}>
          <A href="/admin" class={styles.footerLink}>
            <LayoutDashboard size={ICON_SIZE} stroke-width={ICON_STROKE} />
            <span class={styles.label}>{t("admin.title")}</span>
          </A>
        </div>
      </Show>
    </nav>
  );
}
