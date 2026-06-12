import { Switch } from "@kobalte/core/switch";
import { Show } from "solid-js";
import { useLocale } from "@/store/LocaleContext.tsx";
import type {
	AnnouncementsSectionTemplate,
	AssignmentsSectionTemplate,
	AttendanceSectionTemplate,
	FinancialSummarySectionTemplate,
	SectionTemplate,
	ServiceMetaSectionTemplate,
	WorshipProgramSectionTemplate,
} from "@/types/bulletin.ts";
import styles from "../BulletinTemplate.module.css";
import type { TemplateEditor } from "../hooks/useTemplateEditor.ts";
import { AnnouncementsConfigEditor } from "./AnnouncementsConfigEditor.tsx";
import { AssignmentsConfigEditor } from "./AssignmentsConfigEditor.tsx";
import { AttendanceConfigEditor } from "./AttendanceConfigEditor.tsx";
import { FinancialSummaryConfigEditor } from "./FinancialSummaryConfigEditor.tsx";
import { ServiceMetaConfigEditor } from "./ServiceMetaConfigEditor.tsx";
import { WorshipProgramConfigEditor } from "./WorshipProgramConfigEditor.tsx";

export function sectionAnchorId(sectionId: string): string {
	return `template-section-${sectionId}`;
}

type Props = {
	section: SectionTemplate;
	editor: TemplateEditor;
};

export function SectionCard(props: Props) {
	const { t } = useLocale();
	const visible = () => props.section.visible !== false;
	const hasConfig = () =>
		props.section.type === "worship-program" ||
		props.section.type === "announcements" ||
		props.section.type === "assignments" ||
		props.section.type === "attendance" ||
		props.section.type === "service-meta" ||
		props.section.type === "financial-summary";

	return (
		<section
			id={sectionAnchorId(props.section.id)}
			class={styles.sectionCard}
			classList={{ [styles.cardHidden]: !visible() }}
		>
			<div class={styles.cardHeader}>
				<input
					type="text"
					class={styles.input}
					placeholder={t("bulletinTemplate.sectionLabelPlaceholder")}
					value={props.section.label}
					onInput={(e) =>
						props.editor.updateLabel(props.section.id, e.currentTarget.value)
					}
				/>
				<Switch
					class={styles.switchRoot}
					checked={visible()}
					onChange={() => props.editor.toggleVisible(props.section.id)}
				>
					<Switch.Label class={styles.switchLabel}>
						{t("bulletinTemplate.visible")}
					</Switch.Label>
					<Switch.Input class={styles.switchInput} />
					<Switch.Control class={styles.switchControl}>
						<Switch.Thumb class={styles.switchThumb} />
					</Switch.Control>
				</Switch>
			</div>

			<Show when={hasConfig()}>
				<div class={styles.configBlock}>
					<Show when={props.section.type === "worship-program"}>
						<p class={styles.configCaption}>
							{t("bulletinTemplate.worshipItemsCaption")}
						</p>
						<WorshipProgramConfigEditor
							section={props.section as WorshipProgramSectionTemplate}
							onUpdateItem={props.editor.updateWorshipItem}
							onToggleFieldMode={props.editor.toggleWorshipFieldMode}
							onAddField={props.editor.addWorshipField}
							onRemoveField={props.editor.removeWorshipField}
							onUpdateField={props.editor.updateWorshipField}
							onAddItem={props.editor.addWorshipItem}
							onRemoveItem={props.editor.removeWorshipItem}
							onMoveItem={props.editor.moveWorshipItem}
						/>
					</Show>

					<Show when={props.section.type === "announcements"}>
						<p class={styles.configCaption}>
							{t("bulletinTemplate.subHeadingsCaption")}
						</p>
						<AnnouncementsConfigEditor
							section={props.section as AnnouncementsSectionTemplate}
							onUpdateSubHeadings={props.editor.updateSubHeadings}
						/>
					</Show>

					<Show when={props.section.type === "assignments"}>
						<p class={styles.configCaption}>
							{t("bulletinTemplate.rolesCaption")}
						</p>
						<AssignmentsConfigEditor
							section={props.section as AssignmentsSectionTemplate}
							onUpdateRoles={props.editor.updateRoles}
						/>
					</Show>

					<Show when={props.section.type === "attendance"}>
						<p class={styles.configCaption}>
							{t("bulletinTemplate.meetingsCaption")}
						</p>
						<AttendanceConfigEditor
							section={props.section as AttendanceSectionTemplate}
							onUpdateMeetings={props.editor.updateMeetings}
						/>
					</Show>

					<Show when={props.section.type === "service-meta"}>
						<p class={styles.configCaption}>
							{t("bulletinTemplate.fieldDefsCaption")}
						</p>
						<ServiceMetaConfigEditor
							section={props.section as ServiceMetaSectionTemplate}
							onUpdateFieldDefs={props.editor.updateFieldDefs}
						/>
					</Show>

					<Show when={props.section.type === "financial-summary"}>
						<p class={styles.configCaption}>
							{t("bulletinTemplate.financialItemsCaption")}
						</p>
						<FinancialSummaryConfigEditor
							section={props.section as FinancialSummarySectionTemplate}
							onUpdateFinancialItems={props.editor.updateFinancialItems}
						/>
					</Show>
				</div>
			</Show>
		</section>
	);
}
