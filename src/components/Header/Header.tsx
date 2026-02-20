import { DropdownMenu } from "@kobalte/core/dropdown-menu";
import { CircleUser } from "lucide-solid";
import type { AuthUser } from "@/store/auth";
import styles from "./Header.module.css";

type HeaderProps = {
	user: AuthUser;
	onLogout: () => Promise<void>;
};

export function Header(props: HeaderProps) {
	return (
		<header class={styles.header}>
			<span class={styles.spacer} />
			<span class={styles.title}>仁戸名聖書バプテスト教会</span>
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
							<DropdownMenu.Item
								class={styles.logoutItem}
								onSelect={props.onLogout}
							>
								ログアウト
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Portal>
				</DropdownMenu>
			</div>
		</header>
	);
}
