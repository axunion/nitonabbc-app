import { DropdownMenu } from "@kobalte/core/dropdown-menu";
import { useNavigate } from "@solidjs/router";
import { CircleUser, Languages, Settings } from "lucide-solid";
import { Show } from "solid-js";
import type { AuthUser } from "@/store/auth";
import { useLocale } from "@/store/LocaleContext.tsx";
import styles from "./Header.module.css";

type HeaderProps = {
	user: AuthUser;
	onLogout: () => Promise<void>;
};

export function Header(props: HeaderProps) {
	const navigate = useNavigate();
	const { t, locale, setLocale } = useLocale();

	function toggleLocale() {
		setLocale(locale() === "ja" ? "en" : "ja");
	}

	return (
		<header class={styles.header}>
			<span class={styles.spacer} />
			<span class={styles.title}>{t("common.churchName")}</span>
			<div class={styles.actions}>
				<DropdownMenu>
					<DropdownMenu.Trigger class={styles.trigger}>
						<CircleUser size={28} stroke-width={1.5} />
					</DropdownMenu.Trigger>
					<DropdownMenu.Portal>
						<DropdownMenu.Content class={styles.content}>
							<div class={styles.userInfo}>
								<span class={styles.userName}>{props.user.name}</span>
							</div>
							<Show when={props.user.role === "admin"}>
								<DropdownMenu.Item
									class={styles.menuItem}
									onSelect={() => navigate("/admin")}
								>
									<Settings size={16} stroke-width={1.5} />
									{t("header.management")}
								</DropdownMenu.Item>
							</Show>
							<DropdownMenu.Item
								class={styles.menuItem}
								onSelect={toggleLocale}
							>
								<Languages size={16} stroke-width={1.5} />
								{t("header.language")}
							</DropdownMenu.Item>
							<DropdownMenu.Item
								class={styles.logoutItem}
								onSelect={props.onLogout}
							>
								{t("header.logout")}
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Portal>
				</DropdownMenu>
			</div>
		</header>
	);
}
