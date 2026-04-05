import { Show } from "solid-js";
import { progressPercent } from "@/utils/bulletin.ts";
import styles from "./ProgressBar.module.css";

interface ProgressBarProps {
	filled: number;
	total: number;
	label?: string;
}

export function ProgressBar(props: ProgressBarProps) {
	return (
		<div class={styles.row}>
			<div class={styles.bar}>
				<div
					class={styles.fill}
					style={{ width: `${progressPercent(props.filled, props.total)}%` }}
				/>
			</div>
			<Show when={props.label}>
				<span class={styles.text}>{props.label}</span>
			</Show>
		</div>
	);
}
