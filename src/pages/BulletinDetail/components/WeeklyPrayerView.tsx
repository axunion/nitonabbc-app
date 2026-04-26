import { For, Show } from "solid-js";
import type { WeeklyPrayerSectionData } from "@/types/bulletin.ts";
import styles from "../BulletinDetail.module.css";
import viewStyles from "./WeeklyPrayerView.module.css";

const DAYS_OF_WEEK = ["日", "月", "火", "水", "木", "金", "土"];

type Props = {
	section: WeeklyPrayerSectionData;
};

export function WeeklyPrayerView(props: Props) {
	const entries = () =>
		DAYS_OF_WEEK.map((day) => ({ day, text: props.section.data[day] ?? "" }));

	const hasAny = () => entries().some((e) => e.text.trim());

	return (
		<Show when={hasAny()}>
			<section class={styles.section}>
				<h2 class={styles.sectionTitle}>{props.section.label}</h2>
				<dl class={viewStyles.prayerList}>
					<For each={entries()}>
						{(entry) => (
							<Show when={entry.text.trim()}>
								<dt class={viewStyles.day}>{entry.day}</dt>
								<dd class={viewStyles.text}>{entry.text}</dd>
							</Show>
						)}
					</For>
				</dl>
			</section>
		</Show>
	);
}
