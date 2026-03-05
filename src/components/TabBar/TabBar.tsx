import { A, useLocation } from "@solidjs/router";
import { Church, CircleUser } from "lucide-solid";
import { useLocale } from "@/store/LocaleContext.tsx";
import styles from "./TabBar.module.css";

const ICON_SIZE = 20;
const ICON_STROKE = 1.5;

export function TabBar() {
	const location = useLocation();
	const { t } = useLocale();

	function isActive(path: string) {
		if (path === "/") {
			return !location.pathname.startsWith("/more");
		}
		return location.pathname.startsWith(path);
	}

	return (
		<nav class={styles.tabBar}>
			<A
				href="/"
				class={styles.tab}
				classList={{ [styles.active]: isActive("/") }}
			>
				<Church size={ICON_SIZE} stroke-width={ICON_STROKE} />
				<span class={styles.label}>{t("tabbar.church")}</span>
			</A>
			<A
				href="/more"
				class={styles.tab}
				classList={{ [styles.active]: isActive("/more") }}
			>
				<CircleUser size={ICON_SIZE} stroke-width={ICON_STROKE} />
				<span class={styles.label}>{t("tabbar.account")}</span>
			</A>
		</nav>
	);
}
