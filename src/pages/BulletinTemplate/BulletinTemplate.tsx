import { useBeforeLeave } from "@solidjs/router";
import { For, Show } from "solid-js";
import { useLocale } from "@/store/LocaleContext.tsx";
import styles from "./BulletinTemplate.module.css";
import { AddSectionMenu } from "./components/AddSectionMenu.tsx";
import { SectionRow } from "./components/SectionRow.tsx";
import { useTemplateEditor } from "./hooks/useTemplateEditor.ts";

export function BulletinTemplate() {
	const { t } = useLocale();

	const editor = useTemplateEditor();

	useBeforeLeave((e) => {
		if (
			editor.isDirty() &&
			!e.defaultPrevented &&
			!confirm(t("bulletinTemplate.confirmDiscard"))
		) {
			e.preventDefault();
		}
	});

	return (
		<div class={styles.container}>
			<h1 class={styles.pageTitle}>{t("bulletinTemplate.title")}</h1>
			<Show
				when={editor.initialized()}
				fallback={<p class={styles.loading}>{t("common.loading")}</p>}
			>
				<Show when={editor.message()}>
					{(msg) => (
						<p class={msg().type === "success" ? styles.success : styles.error}>
							{msg().text}
						</p>
					)}
				</Show>

				<form onSubmit={editor.handleSave} class={styles.form}>
					<ul class={styles.itemList}>
						<For each={editor.sections()}>
							{(section, index) => (
								<SectionRow
									section={section}
									index={index()}
									total={editor.sections().length}
									isExpanded={editor.expandedSectionId() === section.id}
									onToggle={editor.toggleExpand}
									onMove={editor.moveSection}
									onRemove={editor.removeSection}
									onUpdateLabel={editor.updateLabel}
									onToggleVisible={editor.toggleVisible}
									onUpdateWorshipItem={editor.updateWorshipItem}
									onToggleWorshipFieldMode={editor.toggleWorshipFieldMode}
									onAddWorshipField={editor.addWorshipField}
									onRemoveWorshipField={editor.removeWorshipField}
									onUpdateWorshipField={editor.updateWorshipField}
									onAddWorshipItem={editor.addWorshipItem}
									onRemoveWorshipItem={editor.removeWorshipItem}
									onMoveWorshipItem={editor.moveWorshipItem}
									onUpdateSubHeadings={editor.updateSubHeadings}
									onUpdateRoles={editor.updateRoles}
									onUpdateMeetings={editor.updateMeetings}
									onUpdateFieldDefs={editor.updateFieldDefs}
									onUpdateFinancialItems={editor.updateFinancialItems}
								/>
							)}
						</For>
					</ul>

					<AddSectionMenu onAdd={editor.addSection} />

					<div class={styles.actions}>
						<button
							type="submit"
							class={styles.saveButton}
							disabled={editor.saving() || !editor.isValid()}
						>
							{t("worshipTemplate.save")}
						</button>
					</div>
				</form>
			</Show>
		</div>
	);
}
