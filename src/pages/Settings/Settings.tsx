import { useNavigate } from "@solidjs/router";
import { ChevronRight, FileText, Languages, Users } from "lucide-solid";
import { Show } from "solid-js";
import { Header } from "@/components/Header";
import type { Locale } from "@/locales/index.ts";
import { useAuth } from "@/store/AuthContext.tsx";
import { useLocale } from "@/store/LocaleContext.tsx";
import styles from "./Settings.module.css";

export function Settings() {
	const { user } = useAuth();
	const { t, locale, setLocale } = useLocale();
	const navigate = useNavigate();

	return (
		<>
			<Header title={t("settings.title")} />
			<div class={styles.container}>
				<div class={styles.content}>
					<div class={styles.userSection}>
						<span class={styles.userName}>{user().name}</span>
						<span class={styles.userRole}>
							{user().role === "admin" ? t("common.admin") : t("common.member")}
						</span>
					</div>

					<Show when={user().role === "admin"}>
						<div class={styles.menuList}>
							<button
								type="button"
								class={styles.menuItem}
								onClick={() => navigate("/settings/members")}
							>
								<Users size={20} stroke-width={1.5} />
								<span>{t("settings.memberManagement")}</span>
								<ChevronRight size={16} class={styles.chevron} />
							</button>
							<button
								type="button"
								class={styles.menuItem}
								onClick={() => navigate("/settings/bulletin-template")}
							>
								<FileText size={20} stroke-width={1.5} />
								<span>{t("settings.worshipTemplate")}</span>
								<ChevronRight size={16} class={styles.chevron} />
							</button>
						</div>
					</Show>

					<div class={styles.menuList}>
						<label class={styles.menuRow}>
							<Languages size={20} stroke-width={1.5} />
							<span>{t("settings.language")}</span>
							<select
								class={styles.localeSelect}
								value={locale()}
								onChange={(e) => setLocale(e.currentTarget.value as Locale)}
							>
								<option value="ja">日本語</option>
								<option value="en">English</option>
							</select>
						</label>
					</div>
				</div>
			</div>
		</>
	);
}

export default Settings;
