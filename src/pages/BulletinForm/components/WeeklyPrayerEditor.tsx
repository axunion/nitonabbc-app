import { For } from "solid-js";
import { useLocale } from "@/store/LocaleContext.tsx";
import type { WeeklyPrayerSectionData } from "@/types/bulletin.ts";
import styles from "../BulletinForm.module.css";

const DAYS_OF_WEEK = ["日", "月", "火", "水", "木", "金", "土"];

type Props = {
	section: WeeklyPrayerSectionData;
	onUpdate: (data: Record<string, string>) => void;
};

export function WeeklyPrayerEditor(props: Props) {
	const { t } = useLocale();

	return (
		<For each={DAYS_OF_WEEK}>
			{(day) => (
				<div class={styles.dynamicRow}>
					<span class={styles.assignmentRoleLabel}>{day}</span>
					<input
						type="text"
						class={styles.inputSmall}
						placeholder={t("bulletinForm.prayerPlaceholder")}
						value={props.section.data[day] ?? ""}
						onInput={(e) =>
							props.onUpdate({
								...props.section.data,
								[day]: e.currentTarget.value,
							})
						}
					/>
				</div>
			)}
		</For>
	);
}
