import * as Button from "@kobalte/core/button";
import type { JSX } from "solid-js";
import styles from "./AppIcon.module.css";

type AppIconProps = {
	label: string;
	icon: JSX.Element;
	onClick: () => void;
	disabled?: boolean;
};

export function AppIcon(props: AppIconProps) {
	return (
		<Button.Root
			class={styles.root}
			onClick={props.onClick}
			disabled={props.disabled}
		>
			<span class={styles.iconWrapper}>{props.icon}</span>
			<span class={styles.label}>{props.label}</span>
		</Button.Root>
	);
}
