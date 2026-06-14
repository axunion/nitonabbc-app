import { A, Navigate, type RouteSectionProps } from "@solidjs/router";
import { ArrowLeft, FileText, LogOut, Users } from "lucide-solid";
import { createSignal, Show, Suspense } from "solid-js";
import { useAuth } from "@/store/AuthContext.tsx";
import { useLocale } from "@/store/LocaleContext.tsx";
import styles from "./AdminLayout.module.css";

const ICON_SIZE = 20;
const ICON_STROKE = 1.5;

export function AdminLayout(props: RouteSectionProps) {
	const { user, logout } = useAuth();
	const { t } = useLocale();
	const [scrolled, setScrolled] = createSignal(false);

	return (
		<Show when={user().role === "admin"} fallback={<Navigate href="/" />}>
			<div class={styles.layout}>
				<aside class={styles.sidebar}>
					<div class={styles.brand}>
						<span class={styles.brandName}>{t("common.churchName")}</span>
						<span class={styles.brandLabel}>{t("admin.title")}</span>
					</div>
					<nav class={styles.nav}>
						<A
							href="/admin/members"
							class={styles.navLink}
							activeClass={styles.navLinkActive}
						>
							<Users size={ICON_SIZE} stroke-width={ICON_STROKE} />
							{t("admin.members")}
						</A>
						<A
							href="/admin/bulletin-template"
							class={styles.navLink}
							activeClass={styles.navLinkActive}
						>
							<FileText size={ICON_SIZE} stroke-width={ICON_STROKE} />
							{t("admin.bulletinTemplate")}
						</A>
					</nav>
					<div class={styles.sidebarFooter}>
						<A href="/" class={styles.footerLink}>
							<ArrowLeft size={ICON_SIZE} stroke-width={ICON_STROKE} />
							{t("admin.backToApp")}
						</A>
						<button type="button" class={styles.logoutButton} onClick={logout}>
							<LogOut size={ICON_SIZE} stroke-width={ICON_STROKE} />
							{t("admin.logout")}
						</button>
					</div>
				</aside>
				<div class={styles.mainArea}>
					<header
						class={styles.header}
						classList={{ [styles.headerScrolled]: scrolled() }}
					>
						<span class={styles.headerTitle}>{t("common.churchName")}</span>
						<span class={styles.userName}>{user().name}</span>
					</header>
					<main
						class={styles.content}
						onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 0)}
					>
						<Suspense>{props.children}</Suspense>
					</main>
				</div>
			</div>
		</Show>
	);
}
