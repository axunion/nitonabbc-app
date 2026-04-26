import {
	ChevronDown,
	ChevronUp,
	Eye,
	EyeOff,
	Settings,
	Trash2,
} from "lucide-solid";
import { Show } from "solid-js";
import { useLocale } from "@/store/LocaleContext.tsx";
import type {
	AnnouncementsSectionTemplate,
	AssignmentsSectionTemplate,
	AttendanceSectionTemplate,
	FinancialSummaryItem,
	FinancialSummarySectionTemplate,
	SectionTemplate,
	ServiceMetaFieldDef,
	ServiceMetaSectionTemplate,
	TemplateField,
	WorshipProgramSectionTemplate,
} from "@/types/bulletin.ts";
import styles from "../BulletinTemplate.module.css";
import { AnnouncementsConfigEditor } from "./AnnouncementsConfigEditor.tsx";
import { AssignmentsConfigEditor } from "./AssignmentsConfigEditor.tsx";
import { AttendanceConfigEditor } from "./AttendanceConfigEditor.tsx";
import { FinancialSummaryConfigEditor } from "./FinancialSummaryConfigEditor.tsx";
import { ServiceMetaConfigEditor } from "./ServiceMetaConfigEditor.tsx";
import { WorshipProgramConfigEditor } from "./WorshipProgramConfigEditor.tsx";

type Props = {
	section: SectionTemplate;
	index: number;
	total: number;
	isExpanded: boolean;
	onToggle: (id: string) => void;
	onMove: (id: string, dir: -1 | 1) => void;
	onRemove: (id: string) => void;
	onUpdateLabel: (id: string, label: string) => void;
	onToggleVisible: (id: string) => void;
	// Worship-program callbacks
	onUpdateWorshipItem: (
		sid: string,
		i: number,
		field: "type" | "label" | "inputType",
		v: string,
	) => void;
	onToggleWorshipFieldMode: (sid: string, i: number) => void;
	onAddWorshipField: (sid: string, i: number) => void;
	onRemoveWorshipField: (sid: string, i: number, fi: number) => void;
	onUpdateWorshipField: (
		sid: string,
		i: number,
		fi: number,
		prop: keyof TemplateField,
		v: string,
	) => void;
	onAddWorshipItem: (sid: string) => void;
	onRemoveWorshipItem: (sid: string, i: number) => void;
	onMoveWorshipItem: (sid: string, i: number, dir: -1 | 1) => void;
	// Announcements callbacks
	onUpdateSubHeadings: (sid: string, subHeadings: string[]) => void;
	// Assignments callbacks
	onUpdateRoles: (sid: string, roles: string[]) => void;
	// Attendance callbacks
	onUpdateMeetings: (
		sid: string,
		meetings: { key: string; label: string }[],
	) => void;
	// ServiceMeta callbacks
	onUpdateFieldDefs: (sid: string, fieldDefs: ServiceMetaFieldDef[]) => void;
	// FinancialSummary callbacks
	onUpdateFinancialItems: (sid: string, items: FinancialSummaryItem[]) => void;
};

export function SectionRow(props: Props) {
	const { t } = useLocale();
	const visible = () => props.section.visible !== false;

	const typeLabel = () => {
		if (props.section.type === "worship-program")
			return t("bulletinTemplate.sectionTypeWorship");
		if (props.section.type === "announcements")
			return t("bulletinTemplate.sectionTypeAnnouncements");
		if (props.section.type === "assignments")
			return t("bulletinTemplate.sectionTypeAssignments");
		if (props.section.type === "weekly-verse")
			return t("bulletinTemplate.sectionTypeWeeklyVerse");
		if (props.section.type === "monthly-song")
			return t("bulletinTemplate.sectionTypeMonthlySong");
		if (props.section.type === "text-block")
			return t("bulletinTemplate.sectionTypeTextBlock");
		if (props.section.type === "weekly-prayer")
			return t("bulletinTemplate.sectionTypeWeeklyPrayer");
		if (props.section.type === "upcoming-events")
			return t("bulletinTemplate.sectionTypeUpcomingEvents");
		if (props.section.type === "birthdays")
			return t("bulletinTemplate.sectionTypeBirthdays");
		if (props.section.type === "scripture-quotes")
			return t("bulletinTemplate.sectionTypeScriptureQuotes");
		if (props.section.type === "attendance")
			return t("bulletinTemplate.sectionTypeAttendance");
		if (props.section.type === "service-meta")
			return t("bulletinTemplate.sectionTypeServiceMeta");
		if (props.section.type === "financial-summary")
			return t("bulletinTemplate.sectionTypeFinancialSummary");
		return (props.section as { type: string }).type;
	};

	return (
		<li class={styles.item}>
			<div class={styles.itemHeader}>
				<div class={styles.orderButtons}>
					<button
						type="button"
						class={styles.orderButton}
						onClick={() => props.onMove(props.section.id, -1)}
						disabled={props.index === 0}
						title={t("worshipTemplate.moveUp")}
					>
						<ChevronUp size={14} stroke-width={1.5} />
					</button>
					<button
						type="button"
						class={styles.orderButton}
						onClick={() => props.onMove(props.section.id, 1)}
						disabled={props.index === props.total - 1}
						title={t("worshipTemplate.moveDown")}
					>
						<ChevronDown size={14} stroke-width={1.5} />
					</button>
				</div>

				<button
					type="button"
					class={styles.itemSummary}
					onClick={() => props.onToggle(props.section.id)}
				>
					<span
						class={styles.itemLabel}
						classList={{ [styles.itemHidden]: !visible() }}
					>
						{props.section.label || "..."}
					</span>
					<span class={styles.itemMeta}>{typeLabel()}</span>
				</button>

				<button
					type="button"
					class={styles.orderButton}
					onClick={() => props.onToggleVisible(props.section.id)}
					title={
						visible()
							? t("bulletinTemplate.visible")
							: t("bulletinTemplate.hidden")
					}
				>
					<Show
						when={visible()}
						fallback={<EyeOff size={14} stroke-width={1.5} />}
					>
						<Eye size={14} stroke-width={1.5} />
					</Show>
				</button>

				<button
					type="button"
					class={styles.expandButton}
					onClick={() => props.onToggle(props.section.id)}
					title={t("worshipTemplate.templateSettings")}
				>
					<Settings size={16} stroke-width={1.5} />
				</button>
			</div>

			<Show when={props.isExpanded}>
				<div class={styles.itemDetail}>
					<div class={styles.detailRow}>
						<input
							type="text"
							class={styles.input}
							placeholder={t("bulletinTemplate.sectionLabelPlaceholder")}
							value={props.section.label}
							onInput={(e) =>
								props.onUpdateLabel(props.section.id, e.currentTarget.value)
							}
						/>
					</div>

					<Show when={props.section.type === "worship-program"}>
						<WorshipProgramConfigEditor
							section={props.section as WorshipProgramSectionTemplate}
							onUpdateItem={props.onUpdateWorshipItem}
							onToggleFieldMode={props.onToggleWorshipFieldMode}
							onAddField={props.onAddWorshipField}
							onRemoveField={props.onRemoveWorshipField}
							onUpdateField={props.onUpdateWorshipField}
							onAddItem={props.onAddWorshipItem}
							onRemoveItem={props.onRemoveWorshipItem}
							onMoveItem={props.onMoveWorshipItem}
						/>
					</Show>

					<Show when={props.section.type === "announcements"}>
						<AnnouncementsConfigEditor
							section={props.section as AnnouncementsSectionTemplate}
							onUpdateSubHeadings={props.onUpdateSubHeadings}
						/>
					</Show>

					<Show when={props.section.type === "assignments"}>
						<AssignmentsConfigEditor
							section={props.section as AssignmentsSectionTemplate}
							onUpdateRoles={props.onUpdateRoles}
						/>
					</Show>

					<Show when={props.section.type === "attendance"}>
						<AttendanceConfigEditor
							section={props.section as AttendanceSectionTemplate}
							onUpdateMeetings={props.onUpdateMeetings}
						/>
					</Show>

					<Show when={props.section.type === "service-meta"}>
						<ServiceMetaConfigEditor
							section={props.section as ServiceMetaSectionTemplate}
							onUpdateFieldDefs={props.onUpdateFieldDefs}
						/>
					</Show>

					<Show when={props.section.type === "financial-summary"}>
						<FinancialSummaryConfigEditor
							section={props.section as FinancialSummarySectionTemplate}
							onUpdateFinancialItems={props.onUpdateFinancialItems}
						/>
					</Show>

					<button
						type="button"
						class={styles.deleteButton}
						onClick={() => props.onRemove(props.section.id)}
					>
						<Trash2 size={14} stroke-width={1.5} />
						{t("bulletinTemplate.removeSection")}
					</button>
				</div>
			</Show>
		</li>
	);
}
