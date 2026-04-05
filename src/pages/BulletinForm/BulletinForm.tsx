import { useNavigate, useParams } from "@solidjs/router";
import { Minus, Plus } from "lucide-solid";
import { For, Show } from "solid-js";
import { Header } from "@/components/Header";
import { useAuth } from "@/store/AuthContext.tsx";
import { useLocale } from "@/store/LocaleContext.tsx";
import styles from "./BulletinForm.module.css";
import { WorshipInput } from "./components/WorshipInput.tsx";
import { useBulletinForm } from "./hooks/useBulletinForm.ts";

export function BulletinForm() {
	const params = useParams<{ id?: string }>();
	const navigate = useNavigate();
	const { t } = useLocale();
	const { user } = useAuth();
	const isEdit = () => !!params.id;
	const isAdmin = () => user().role === "admin";

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

						<fieldset class={styles.fieldset}>
							<legend class={styles.legend}>
								{t("bulletinForm.worshipProgram")}
							</legend>
							<For each={form.worship()}>
								{(item, index) => (
									<div
										class={styles.worshipCard}
										classList={{
											[styles.highlighted]:
												item.assigneeId != null &&
												item.assigneeId === user().id,
										}}
									>
										<div class={styles.worshipHeader}>
											<span class={styles.worshipLabel}>{item.label}</span>
											<Show when={isAdmin()}>
												<select
													class={styles.assigneeSelect}
													value={
														item.assigneeId != null
															? String(item.assigneeId)
															: ""
													}
													onChange={(e) =>
														form.updateWorshipAssignee(
															index(),
															e.currentTarget.value,
														)
													}
													title={t("bulletinForm.assignTo")}
												>
													<option value="">{t("bulletin.unassigned")}</option>
													<For each={form.members() ?? []}>
														{(m) => (
															<option value={String(m.id)}>{m.name}</option>
														)}
													</For>
												</select>
											</Show>
										</div>
										<WorshipInput
											item={item}
											index={index()}
											template={form.template()}
											members={form.members()}
											onUpdateDetails={form.updateWorshipDetails}
											onUpdateFieldValue={form.updateWorshipFieldValue}
										/>
									</div>
								)}
							</For>
						</fieldset>

						<fieldset class={styles.fieldset}>
							<legend class={styles.legend}>
								{t("bulletinForm.announcements")}
								<button
									type="button"
									class={styles.iconButton}
									onClick={form.addAnnouncement}
								>
									<Plus size={16} stroke-width={1.5} />
								</button>
							</legend>
							<For each={form.announcements()}>
								{(a, index) => (
									<div class={styles.dynamicRow}>
										<textarea
											class={styles.textarea}
											rows={2}
											value={a.content}
											onInput={(e) =>
												form.updateAnnouncement(index(), e.currentTarget.value)
											}
											placeholder={t("bulletinForm.announcementPlaceholder")}
										/>
										<Show when={form.announcements().length > 1}>
											<button
												type="button"
												class={styles.removeButton}
												onClick={() => form.removeAnnouncement(index())}
											>
												<Minus size={16} stroke-width={1.5} />
											</button>
										</Show>
									</div>
								)}
							</For>
						</fieldset>

						<fieldset class={styles.fieldset}>
							<legend class={styles.legend}>
								{t("bulletinForm.assignments")}
								<button
									type="button"
									class={styles.iconButton}
									onClick={form.addAssignment}
								>
									<Plus size={16} stroke-width={1.5} />
								</button>
							</legend>
							<For each={form.assignments()}>
								{(a, index) => (
									<div class={styles.dynamicRow}>
										<input
											type="text"
											class={styles.inputSmall}
											placeholder={t("bulletinForm.rolePlaceholder")}
											value={a.role}
											onInput={(e) =>
												form.updateAssignment(
													index(),
													"role",
													e.currentTarget.value,
												)
											}
										/>
										<input
											type="text"
											class={styles.inputSmall}
											placeholder={t("bulletinForm.personPlaceholder")}
											value={a.person}
											onInput={(e) =>
												form.updateAssignment(
													index(),
													"person",
													e.currentTarget.value,
												)
											}
										/>
										<Show when={form.assignments().length > 1}>
											<button
												type="button"
												class={styles.removeButton}
												onClick={() => form.removeAssignment(index())}
											>
												<Minus size={16} stroke-width={1.5} />
											</button>
										</Show>
									</div>
								)}
							</For>
						</fieldset>

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
