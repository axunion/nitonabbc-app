import { For, Show } from "solid-js";
import { useLocale } from "@/store/LocaleContext.tsx";
import type {
	AttendanceSectionData,
	AttendanceSectionTemplate,
	SectionTemplate,
} from "@/types/bulletin.ts";
import { findSectionTemplate } from "@/utils/bulletin.ts";
import styles from "../BulletinDetail.module.css";

type Props = {
	section: AttendanceSectionData;
	template: SectionTemplate[];
};

export function AttendanceView(props: Props) {
	const { t } = useLocale();

	const meetings = () => {
		const tmpl = findSectionTemplate(props.template, props.section.id);
		return tmpl?.type === "attendance"
			? (tmpl as AttendanceSectionTemplate).config.meetings
			: [];
	};

	const visibleMeetings = () =>
		meetings().filter((m) => {
			const entry = props.section.data[m.key];
			return entry && entry.adults.trim() !== "";
		});

	return (
		<Show when={visibleMeetings().length > 0}>
			<section class={styles.section}>
				<h2 class={styles.sectionTitle}>{props.section.label}</h2>
				<dl class={styles.assignmentList}>
					<For each={visibleMeetings()}>
						{(meeting) => {
							const entry = () => props.section.data[meeting.key];
							return (
								<>
									<dt class={styles.assignmentRole}>{meeting.label}</dt>
									<dd class={styles.assignmentPerson}>
										{t("bulletinForm.attendanceAdultsLabel")} {entry()?.adults}
										<Show when={entry()?.children}>
											{"　"}
											{t("bulletinForm.attendanceChildrenLabel")}{" "}
											{entry()?.children}
										</Show>
									</dd>
								</>
							);
						}}
					</For>
				</dl>
			</section>
		</Show>
	);
}
