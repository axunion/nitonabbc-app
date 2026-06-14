import { useLocation, useNavigate } from "@solidjs/router";
import { Church, Settings } from "lucide-solid";
import { createEffect, createSignal } from "solid-js";
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

	createEffect(() => {
		const path = location.pathname;
		const tab = getTabForPath(path);
		setTabMemory((prev) => ({ ...prev, [tab]: path }));
	});

	function handleTabClick(tab: Tab, rootPath: string) {
		const currentTab = getTabForPath(location.pathname);
		if (currentTab !== tab) {
			navigate(tabMemory()[tab]);
		} else {
			navigate(rootPath);
		}
	}

	function isActive(tab: Tab) {
		return getTabForPath(location.pathname) === tab;
	}

	return (
		<nav class={styles.tabBar}>
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
		</nav>
	);
}
