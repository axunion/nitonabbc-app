import { For } from "solid-js";
import { useLocale } from "@/store/LocaleContext.tsx";
import type {
	AttendanceSectionData,
	AttendanceSectionTemplate,
	SectionTemplate,
} from "@/types/bulletin.ts";
import { findSectionTemplate } from "@/utils/bulletin.ts";
import styles from "../BulletinForm.module.css";

type Props = {
	section: AttendanceSectionData;
	template: SectionTemplate[];
	onUpdate: (
		sectionId: string,
		key: string,
		field: "adults" | "children",
		value: string,
	) => void;
};

export function AttendanceEditor(props: Props) {
	const { t } = useLocale();

	const meetings = () => {
		const tmpl = findSectionTemplate(props.template, props.section.id);
		return tmpl?.type === "attendance"
			? (tmpl as AttendanceSectionTemplate).config.meetings
			: [];
	};

	return (
		<For each={meetings()}>
			{(meeting) => (
				<div>
					<p class={styles.sectionLabel}>{meeting.label}</p>
					<div class={styles.pairGrid}>
						<input
							type="text"
							class={styles.input}
							placeholder={t("bulletinForm.attendanceAdultsPlaceholder")}
							aria-label={`${meeting.label} ${t("bulletinForm.attendanceAdultsLabel")}`}
							value={props.section.data[meeting.key]?.adults ?? ""}
							onInput={(e) =>
								props.onUpdate(
									props.section.id,
									meeting.key,
									"adults",
									e.currentTarget.value,
								)
							}
						/>
						<input
							type="text"
							class={styles.input}
							placeholder={t("bulletinForm.attendanceChildrenPlaceholder")}
							aria-label={`${meeting.label} ${t("bulletinForm.attendanceChildrenLabel")}`}
							value={props.section.data[meeting.key]?.children ?? ""}
							onInput={(e) =>
								props.onUpdate(
									props.section.id,
									meeting.key,
									"children",
									e.currentTarget.value,
								)
							}
						/>
					</div>
				</div>
			)}
		</For>
	);
}
