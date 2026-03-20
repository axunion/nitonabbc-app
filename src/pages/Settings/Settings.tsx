import { useNavigate } from "@solidjs/router";
import {
	ChevronRight,
	FileText,
	Languages,
	Smartphone,
	Users,
} from "lucide-solid";
import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { Header } from "@/components/Header";
import type { Locale } from "@/locales/index.ts";
import { useAuth } from "@/store/AuthContext.tsx";
import { useLocale } from "@/store/LocaleContext.tsx";
import styles from "./Settings.module.css";

type BeforeInstallPromptEvent = Event & {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIos() {
	return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone() {
	return window.matchMedia("(display-mode: standalone)").matches;
}

export function Settings() {
	const { user } = useAuth();
	const { t, locale, setLocale } = useLocale();
	const navigate = useNavigate();

	const [installPrompt, setInstallPrompt] =
		createSignal<BeforeInstallPromptEvent | null>(null);
	const [installed, setInstalled] = createSignal(false);

	onMount(() => {
		setInstalled(isStandalone());

		const handler = (e: Event) => {
			e.preventDefault();
			setInstallPrompt(e as BeforeInstallPromptEvent);
		};
		window.addEventListener("beforeinstallprompt", handler);
		onCleanup(() => window.removeEventListener("beforeinstallprompt", handler));
	});

	const handleInstall = async () => {
		const prompt = installPrompt();
		if (!prompt) return;
		await prompt.prompt();
		const { outcome } = await prompt.userChoice;
		if (outcome === "accepted") {
			setInstallPrompt(null);
			setInstalled(true);
		}
	};

	return (
		<>
			<Header title={t("settings.title")} />
			<div class={styles.container}>
				<div class={styles.content}>
					<div class={styles.userSection}>
						<span class={styles.userName}>{user().name}</span>
						<div class={styles.userOrnament} />
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

					<Show when={!installed() && (isIos() || installPrompt() !== null)}>
						<div class={styles.menuList}>
							<div class={styles.installSection}>
								<div class={styles.installHeader}>
									<Smartphone size={20} stroke-width={1.5} />
									<span class={styles.installTitle}>
										{t("settings.installApp")}
									</span>
								</div>
								<p class={styles.installDescription}>
									{t("settings.installDescription")}
								</p>
								<Show
									when={!isIos()}
									fallback={
										<p class={styles.installGuide}>
											{t("settings.installIosGuide")}
										</p>
									}
								>
									<button
										type="button"
										class={styles.installButton}
										onClick={handleInstall}
									>
										{t("settings.installButton")}
									</button>
								</Show>
							</div>
						</div>
					</Show>
				</div>
			</div>
		</>
	);
}

export default Settings;
