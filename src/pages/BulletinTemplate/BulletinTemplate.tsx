import { useBeforeLeave } from "@solidjs/router";
import { For, Show } from "solid-js";
import { useLocale } from "@/store/LocaleContext.tsx";
import styles from "./BulletinTemplate.module.css";
import { SectionCard, sectionAnchorId } from "./components/SectionCard.tsx";
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

	function scrollToSection(sectionId: string) {
		document
			.getElementById(sectionAnchorId(sectionId))
			?.scrollIntoView({ behavior: "smooth", block: "start" });
	}

	function handleResetClick() {
		if (!confirm(t("bulletinTemplate.confirmReset"))) return;
		void editor.handleReset();
	}

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
										onClick={() => scrollToSection(section.id)}
									>
										{section.label || "…"}
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
						<Show when={editor.message()}>
							{(msg) => (
								<p
									class={
										msg().type === "success" ? styles.success : styles.error
									}
								>
									{msg().text}
								</p>
							)}
						</Show>
						<Show when={!editor.message() && editor.isDirty()}>
							<p class={styles.dirtyHint}>
								{t("bulletinTemplate.unsavedChanges")}
							</p>
						</Show>
						<div class={styles.barActions}>
							<button
								type="button"
								class={styles.resetButton}
								disabled={editor.saving()}
								onClick={handleResetClick}
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
		</div>
	);
}
