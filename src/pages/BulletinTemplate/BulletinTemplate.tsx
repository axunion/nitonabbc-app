import type { BeforeLeaveEventArgs } from "@solidjs/router";
import { useBeforeLeave } from "@solidjs/router";
import { createSignal, For, Show } from "solid-js";
import { ConfirmDialog } from "@/components/ConfirmDialog/index.ts";
import { useLocale } from "@/store/LocaleContext.tsx";
import { scrollToAnchor } from "@/utils/scroll.ts";
import styles from "./BulletinTemplate.module.css";
import { SectionCard, sectionAnchorId } from "./components/SectionCard.tsx";
import { useTemplateEditor } from "./hooks/useTemplateEditor.ts";

export function BulletinTemplate() {
	const { t } = useLocale();

	const editor = useTemplateEditor();

	const [leaveEvent, setLeaveEvent] = createSignal<BeforeLeaveEventArgs | null>(
		null,
	);
	const discardOpen = () => leaveEvent() !== null;
	const [resetOpen, setResetOpen] = createSignal(false);

	useBeforeLeave((e) => {
		if (editor.isDirty() && !e.defaultPrevented) {
			e.preventDefault();
			setResetOpen(false);
			setLeaveEvent(e);
		}
	});

	return (
		<div class={styles.container}>
			<h1 class={styles.pageTitle}>{t("bulletinTemplate.title")}</h1>
			<p class={styles.description}>{t("bulletinTemplate.description")}</p>
			<Show
				when={editor.initialized()}
				fallback={<p class={styles.loading}>{t("common.loading")}</p>}
			>
				<form onSubmit={editor.handleSave} class={styles.form}>
					<div class={styles.layoutGrid}>
						<nav class={styles.toc} aria-label={t("bulletinTemplate.tocLabel")}>
							<For each={editor.sections()}>
								{(section) => (
									<button
										type="button"
										class={styles.tocLink}
										classList={{
											[styles.tocLinkHidden]: section.visible === false,
										}}
										onClick={() => scrollToAnchor(sectionAnchorId(section.id))}
									>
										{section.label ?? "…"}
									</button>
								)}
							</For>
						</nav>

						<div class={styles.sectionList}>
							<For each={editor.sections()}>
								{(section) => <SectionCard section={section} editor={editor} />}
							</For>
						</div>
					</div>

					<div class={styles.stickyBar}>
						<Show when={editor.isDirty()}>
							<p class={styles.dirtyHint}>
								{t("bulletinTemplate.unsavedChanges")}
							</p>
						</Show>
						<div class={styles.barActions}>
							<button
								type="button"
								class={styles.resetButton}
								disabled={editor.saving()}
								onClick={() => setResetOpen(true)}
							>
								{t("bulletinTemplate.resetToDefault")}
							</button>
							<button
								type="submit"
								class={styles.saveButton}
								disabled={editor.saving() || !editor.isValid()}
							>
								{t("worshipTemplate.save")}
							</button>
						</div>
					</div>
				</form>
			</Show>

			{/* Discard unsaved changes and leave */}
			<ConfirmDialog
				open={discardOpen()}
				onOpenChange={(open) => {
					if (!open) setLeaveEvent(null);
				}}
				title={t("bulletinTemplate.discardTitle")}
				description={t("bulletinTemplate.confirmDiscard")}
				confirmLabel={t("common.discard")}
				cancelLabel={t("common.cancel")}
				variant="destructive"
				onConfirm={() => {
					const ev = leaveEvent();
					if (ev) ev.retry(true);
				}}
			/>

			{/* Reset template to default */}
			<ConfirmDialog
				open={resetOpen()}
				onOpenChange={setResetOpen}
				title={t("bulletinTemplate.resetToDefault")}
				description={t("bulletinTemplate.confirmReset")}
				confirmLabel={t("bulletinTemplate.resetToDefault")}
				cancelLabel={t("common.cancel")}
				variant="destructive"
				onConfirm={() => editor.handleReset()}
			/>
		</div>
	);
}
