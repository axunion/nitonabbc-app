import { Plus, X } from "lucide-solid";
import { For } from "solid-js";
import { useLocale } from "@/store/LocaleContext.tsx";
import type { AttendanceSectionTemplate } from "@/types/bulletin.ts";
import styles from "../BulletinTemplate.module.css";

type Meeting = { key: string; label: string };

type Props = {
	section: AttendanceSectionTemplate;
	onUpdateMeetings: (sectionId: string, meetings: Meeting[]) => void;
};

export function AttendanceConfigEditor(props: Props) {
	const { t } = useLocale();

	const meetings = () => props.section.config.meetings;

	function update(index: number, field: "key" | "label", value: string) {
		const next = meetings().map((m, i) =>
			i === index ? { ...m, [field]: value } : m,
		);
		props.onUpdateMeetings(props.section.id, next);
	}

	function add() {
		props.onUpdateMeetings(props.section.id, [
			...meetings(),
			{ key: "", label: "" },
		]);
	}

	function remove(index: number) {
		props.onUpdateMeetings(
			props.section.id,
			meetings().filter((_, i) => i !== index),
		);
	}

	return (
		<div class={styles.fieldsSection}>
			<For each={meetings()}>
				{(meeting, index) => (
					<div class={styles.fieldRow}>
						<input
							type="text"
							class={styles.input}
							placeholder={t(
								"bulletinTemplate.attendanceMeetingLabelPlaceholder",
							)}
							value={meeting.label}
							onInput={(e) => update(index(), "label", e.currentTarget.value)}
						/>
						<input
							type="text"
							class={styles.input}
							placeholder={t(
								"bulletinTemplate.attendanceMeetingKeyPlaceholder",
							)}
							value={meeting.key}
							onInput={(e) => update(index(), "key", e.currentTarget.value)}
						/>
						<button
							type="button"
							class={styles.removeButton}
							onClick={() => remove(index())}
						>
							<X size={14} stroke-width={1.5} />
						</button>
					</div>
				)}
			</For>
			<button type="button" class={styles.addFieldButton} onClick={add}>
				<Plus size={14} stroke-width={1.5} />
				{t("bulletinTemplate.addMeeting")}
			</button>
		</div>
	);
}
