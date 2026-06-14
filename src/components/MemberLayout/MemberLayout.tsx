import type { RouteSectionProps } from "@solidjs/router";
import { TabBar } from "@/components/TabBar";
import styles from "./MemberLayout.module.css";

export function MemberLayout(props: RouteSectionProps) {
	return (
		<div class={styles.layout}>
			<main class={styles.main}>{props.children}</main>
			<TabBar />
		</div>
	);
}
