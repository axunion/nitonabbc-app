import { useNavigate } from "@solidjs/router";
import { Languages, LogOut, Shield } from "lucide-solid";
import { Show } from "solid-js";
import type { Locale } from "@/locales/index.ts";
import { useAuth } from "@/store/AuthContext.tsx";
import { useLocale } from "@/store/LocaleContext.tsx";
import styles from "./More.module.css";

export function More() {
	const { user, logout } = useAuth();
	const { t, locale, setLocale } = useLocale();
	const navigate = useNavigate();

	return (
		<div class={styles.container}>
			<div class={styles.content}>
				<div class={styles.userSection}>
					<span class={styles.userName}>{user().name}</span>
					<span class={styles.userRole}>
						{user().role === "admin" ? t("common.admin") : t("common.member")}
					</span>
				</div>

				<div class={styles.menuList}>
					<Show when={user().role === "admin"}>
						<button
							type="button"
							class={styles.menuItem}
							onClick={() => navigate("/admin")}
						>
							<Shield size={20} stroke-width={1.5} />
							<span>{t("header.management")}</span>
						</button>
					</Show>

					<label class={styles.menuRow}>
						<Languages size={20} stroke-width={1.5} />
						<span>{t("more.language")}</span>
						<select
							class={styles.localeSelect}
							value={locale()}
							onChange={(e) => setLocale(e.currentTarget.value as Locale)}
						>
							<option value="ja">日本語</option>
							<option value="en">English</option>
						</select>
					</label>

					<button type="button" class={styles.logoutItem} onClick={logout}>
						<LogOut size={20} stroke-width={1.5} />
						<span>{t("more.logout")}</span>
					</button>
				</div>
			</div>
		</div>
	);
}

export default More;
