import type { JSX } from "solid-js";
import { useLocale } from "@/store/LocaleContext.tsx";
import styles from "./Header.module.css";

type HeaderProps = {
	title?: string;
	rightAction?: JSX.Element;
};

export function Header(props: HeaderProps) {
	const { t } = useLocale();

	return (
		<header class={styles.header}>
			<span class={styles.spacer} />
			<span class={styles.title}>{props.title ?? t("common.churchName")}</span>
			<div class={styles.actions}>{props.rightAction}</div>
		</header>
	);
}
