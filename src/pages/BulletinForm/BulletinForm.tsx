import { useNavigate, useParams } from "@solidjs/router";
import { For, Show } from "solid-js";
import { Header } from "@/components/Header";
import { useLocale } from "@/store/LocaleContext.tsx";
import styles from "./BulletinForm.module.css";
import { SectionEditor } from "./components/SectionEditor.tsx";
import { useBulletinForm } from "./hooks/useBulletinForm.ts";

export function BulletinForm() {
	const params = useParams<{ id?: string }>();
	const navigate = useNavigate();
	const { t } = useLocale();
	const isEdit = () => !!params.id;

	const form = useBulletinForm();

	return (
		<>
			<Header
				title={
					isEdit() ? t("bulletinForm.titleEdit") : t("bulletinForm.titleNew")
				}
				backTo={isEdit() ? `/bulletin/${params.id}` : "/bulletin"}
			/>
			<div class={styles.container}>
				<Show
					when={form.initialized()}
					fallback={<p class={styles.loading}>{t("common.loading")}</p>}
				>
					<Show when={form.error()}>
						<p class={styles.error}>{form.error()}</p>
					</Show>

					<form onSubmit={form.handleSubmit} class={styles.form}>
						<div class={styles.formGroup}>
							<label for="service-date" class={styles.label}>
								{t("bulletinForm.serviceDate")}
							</label>
							<input
								id="service-date"
								type="date"
								class={styles.input}
								value={form.serviceDate()}
								onInput={(e) => form.setServiceDate(e.currentTarget.value)}
								required
							/>
						</div>

						<div class={styles.sectionsGrid}>
							<For each={form.sections()}>
								{(section) => (
									<fieldset class={styles.fieldset}>
										<legend class={styles.legend}>{section.label}</legend>
										<SectionEditor
											section={section}
											template={form.template() ?? []}
											members={form.members()}
											onUpdateDetails={form.updateWorshipDetails}
											onUpdateFieldValue={form.updateWorshipFieldValue}
											onUpdateAssignee={form.updateWorshipAssignee}
											onAddAnnouncement={form.addAnnouncement}
											onRemoveAnnouncement={form.removeAnnouncement}
											onUpdateAnnouncement={form.updateAnnouncement}
											onUpdateAssignment={form.updateAssignment}
											onUpdateWeeklyVerse={form.updateWeeklyVerse}
											onUpdateMonthlySong={form.updateMonthlySong}
											onUpdateTextBlock={form.updateTextBlock}
											onUpdateWeeklyPrayer={form.updateWeeklyPrayer}
											onAddUpcomingEvent={form.addUpcomingEvent}
											onRemoveUpcomingEvent={form.removeUpcomingEvent}
											onUpdateUpcomingEvent={form.updateUpcomingEvent}
											onAddBirthday={form.addBirthday}
											onRemoveBirthday={form.removeBirthday}
											onUpdateBirthday={form.updateBirthday}
											onAddScriptureQuote={form.addScriptureQuote}
											onRemoveScriptureQuote={form.removeScriptureQuote}
											onUpdateScriptureQuote={form.updateScriptureQuote}
											onUpdateAttendance={form.updateAttendance}
											onUpdateServiceMeta={form.updateServiceMeta}
											onUpdateFinancialSummary={form.updateFinancialSummary}
										/>
									</fieldset>
								)}
							</For>
						</div>

						<div class={styles.actions}>
							<button
								type="button"
								class={styles.cancelButton}
								onClick={() =>
									navigate(isEdit() ? `/bulletin/${params.id}` : "/bulletin")
								}
							>
								{t("common.cancel")}
							</button>
							<button
								type="submit"
								class={styles.submitButton}
								disabled={
									form.submitting() ||
									!form.serviceDate() ||
									(!isEdit() && !form.hasContent())
								}
							>
								{isEdit() ? t("common.update") : t("common.create")}
							</button>
						</div>
						<Show when={!isEdit() && form.serviceDate() && !form.hasContent()}>
							<p class={styles.validationHint}>
								{t("bulletinForm.fillAtLeastOne")}
							</p>
						</Show>
					</form>
				</Show>
			</div>
		</>
	);
}
