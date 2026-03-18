import { useNavigate, useParams, useSearchParams } from "@solidjs/router";
import { Minus, Plus } from "lucide-solid";
import { createMemo, createResource, createSignal, For, Show } from "solid-js";
import { fetchBulletin, fetchMembers, fetchTemplate } from "@/api/bulletin.ts";
import { Header } from "@/components/Header";
import { useAuth } from "@/store/AuthContext.tsx";
import { useLocale } from "@/store/LocaleContext.tsx";
import type {
	Announcement,
	TemplateItem,
	WorshipItem,
} from "@/types/bulletin.ts";
import styles from "./BulletinForm.module.css";

export function BulletinForm() {
	const params = useParams<{ id?: string }>();
	const [searchParams] = useSearchParams<{ date?: string }>();
	const navigate = useNavigate();
	const { t } = useLocale();
	const { user } = useAuth();
	const isEdit = () => !!params.id;
	const isAdmin = () => user()?.role === "admin";

	const [existing] = createResource(
		() => params.id,
		(id) => fetchBulletin(id),
	);

	const [template] = createResource(fetchTemplate);
	const [members] = createResource(fetchMembers);

	const [serviceDate, setServiceDate] = createSignal("");
	const [worship, setWorship] = createSignal<WorshipItem[]>([]);
	const [announcements, setAnnouncements] = createSignal<Announcement[]>([]);
	const [assignments, setAssignments] = createSignal<
		{ role: string; person: string }[]
	>([]);
	const [submitting, setSubmitting] = createSignal(false);
	const [error, setError] = createSignal("");
	const [initialized, setInitialized] = createSignal(false);

	// Initialize new bulletin from template
	const initFromTemplate = () => {
		const items = template();
		if (!isEdit() && items && items.length > 0 && !initialized()) {
			setWorship(
				items.map((i) => {
					const item: WorshipItem = { type: i.type, label: i.label };
					if (i.fields && i.fields.length > 0) {
						item.fieldValues = {};
						for (const f of i.fields) {
							item.fieldValues[f.key] = "";
						}
					}
					return item;
				}),
			);
			setAnnouncements([{ content: "" }]);
			setAssignments([{ role: "", person: "" }]);
			if (searchParams.date) {
				setServiceDate(searchParams.date);
			}
			setInitialized(true);
		}
		return null;
	};

	// Populate form when editing
	const populateForm = () => {
		const data = existing();
		if (data && !initialized()) {
			setServiceDate(data.serviceDate);
			setWorship(data.worship.length > 0 ? data.worship : []);
			setAnnouncements(
				data.announcements.length > 0 ? data.announcements : [{ content: "" }],
			);
			const entries = Object.entries(data.assignments);
			setAssignments(
				entries.length > 0
					? entries.map(([role, person]) => ({ role, person }))
					: [{ role: "", person: "" }],
			);
			setInitialized(true);
		}
		return null;
	};

	function getTemplateItem(type: string): TemplateItem | undefined {
		return template()?.find((t) => t.type === type);
	}

	function updateWorshipDetails(index: number, value: string) {
		setWorship((prev) =>
			prev.map((item, i) => (i === index ? { ...item, details: value } : item)),
		);
	}

	function updateWorshipFieldValue(
		index: number,
		fieldKey: string,
		value: string,
	) {
		setWorship((prev) =>
			prev.map((item, i) => {
				if (i !== index) return item;
				return {
					...item,
					fieldValues: { ...(item.fieldValues ?? {}), [fieldKey]: value },
				};
			}),
		);
	}

	function updateWorshipAssignee(index: number, value: string) {
		setWorship((prev) =>
			prev.map((item, i) =>
				i === index
					? {
							...item,
							assigneeId: value ? Number(value) : null,
						}
					: item,
			),
		);
	}

	function addAnnouncement() {
		setAnnouncements((prev) => [...prev, { content: "" }]);
	}

	function removeAnnouncement(index: number) {
		setAnnouncements((prev) => prev.filter((_, i) => i !== index));
	}

	function updateAnnouncement(index: number, value: string) {
		setAnnouncements((prev) =>
			prev.map((a, i) => (i === index ? { content: value } : a)),
		);
	}

	function addAssignment() {
		setAssignments((prev) => [...prev, { role: "", person: "" }]);
	}

	function removeAssignment(index: number) {
		setAssignments((prev) => prev.filter((_, i) => i !== index));
	}

	function updateAssignment(
		index: number,
		field: "role" | "person",
		value: string,
	) {
		setAssignments((prev) =>
			prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)),
		);
	}

	const hasContent = createMemo(
		() =>
			worship().some(
				(w) =>
					w.details?.trim() ||
					w.assigneeId != null ||
					(w.fieldValues && Object.values(w.fieldValues).some((v) => v.trim())),
			) ||
			announcements().some((a) => a.content.trim()) ||
			assignments().some((a) => a.role.trim() || a.person.trim()),
	);

	function getPlaceholder(inputType?: string): string {
		switch (inputType) {
			case "scripture":
				return t("bulletinForm.scripturePlaceholder");
			case "number":
				return t("bulletinForm.numberPlaceholder");
			default:
				return t("bulletinForm.detailsPlaceholder");
		}
	}

	function getInputType(inputType?: string): string {
		return inputType === "number" ? "number" : "text";
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		setError("");
		setSubmitting(true);

		const worshipData = worship();
		const announcementsData = announcements().filter(
			(a) => a.content.trim() !== "",
		);
		const assignmentsData: Record<string, string> = {};
		for (const a of assignments()) {
			if (a.role.trim() && a.person.trim()) {
				assignmentsData[a.role.trim()] = a.person.trim();
			}
		}

		const body = {
			serviceDate: serviceDate(),
			worship: worshipData,
			announcements: announcementsData,
			assignments: assignmentsData,
		};

		try {
			const url = isEdit() ? `/api/bulletin/${params.id}` : "/api/bulletin";
			const method = isEdit() ? "PUT" : "POST";

			const res = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});

			if (!res.ok) {
				const data = (await res.json()) as { error?: string };
				setError(data.error ?? "Failed to save bulletin");
				return;
			}

			const result = (await res.json()) as { id: number };
			navigate(`/bulletin/${result.id}`);
		} finally {
			setSubmitting(false);
		}
	}

	function renderMemberSelect(
		value: string | undefined,
		onChange: (val: string) => void,
	) {
		return (
			<select
				class={styles.select}
				value={value ?? ""}
				onChange={(e) => onChange(e.currentTarget.value)}
			>
				<option value="">{t("bulletinForm.selectMember")}</option>
				<For each={members() ?? []}>
					{(m) => <option value={String(m.id)}>{m.name}</option>}
				</For>
			</select>
		);
	}

	function renderWorshipInput(item: WorshipItem, index: number) {
		const tmpl = getTemplateItem(item.type);
		const inputType = tmpl?.inputType ?? "text";

		// Compound fields mode
		if (tmpl?.fields && tmpl.fields.length > 0) {
			return (
				<div class={styles.compoundFields}>
					<For each={tmpl.fields}>
						{(field) => {
							if (field.inputType === "none") return null;
							if (field.inputType === "member") {
								return (
									<div class={styles.fieldRow}>
										<span class={styles.fieldLabel}>{field.label}</span>
										{renderMemberSelect(item.fieldValues?.[field.key], (val) =>
											updateWorshipFieldValue(index, field.key, val),
										)}
									</div>
								);
							}
							return (
								<div class={styles.fieldRow}>
									<span class={styles.fieldLabel}>{field.label}</span>
									<input
										type={getInputType(field.inputType)}
										class={styles.input}
										placeholder={getPlaceholder(field.inputType)}
										value={item.fieldValues?.[field.key] ?? ""}
										onInput={(e) =>
											updateWorshipFieldValue(
												index,
												field.key,
												e.currentTarget.value,
											)
										}
									/>
								</div>
							);
						}}
					</For>
				</div>
			);
		}

		// None type — no input needed
		if (inputType === "none") {
			return null;
		}

		// Member select
		if (inputType === "member") {
			return renderMemberSelect(item.details, (val) =>
				updateWorshipDetails(index, val),
			);
		}

		// Text/number/scripture
		return (
			<input
				type={getInputType(inputType)}
				class={styles.input}
				placeholder={getPlaceholder(inputType)}
				value={item.details ?? ""}
				onInput={(e) => updateWorshipDetails(index, e.currentTarget.value)}
			/>
		);
	}

	return (
		<>
			<Header
				title={
					isEdit() ? t("bulletinForm.titleEdit") : t("bulletinForm.titleNew")
				}
				backTo={isEdit() ? `/bulletin/${params.id}` : "/bulletin"}
			/>
			<div class={styles.container}>
				<Show when={isEdit()}>{populateForm()}</Show>
				<Show when={!isEdit()}>{initFromTemplate()}</Show>

				<Show
					when={initialized()}
					fallback={<p class={styles.loading}>{t("common.loading")}</p>}
				>
					<Show when={error()}>
						<p class={styles.error}>{error()}</p>
					</Show>

					<form onSubmit={handleSubmit} class={styles.form}>
						<div class={styles.formGroup}>
							<label for="service-date" class={styles.label}>
								{t("bulletinForm.serviceDate")}
							</label>
							<input
								id="service-date"
								type="date"
								class={styles.input}
								value={serviceDate()}
								onInput={(e) => setServiceDate(e.currentTarget.value)}
								required
							/>
						</div>

						<fieldset class={styles.fieldset}>
							<legend class={styles.legend}>
								{t("bulletinForm.worshipProgram")}
							</legend>
							<For each={worship()}>
								{(item, index) => (
									<div
										class={styles.worshipCard}
										classList={{
											[styles.highlighted]:
												item.assigneeId != null &&
												item.assigneeId === user()?.id,
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
														updateWorshipAssignee(
															index(),
															e.currentTarget.value,
														)
													}
													title={t("bulletinForm.assignTo")}
												>
													<option value="">{t("bulletin.unassigned")}</option>
													<For each={members() ?? []}>
														{(m) => (
															<option value={String(m.id)}>{m.name}</option>
														)}
													</For>
												</select>
											</Show>
										</div>
										{renderWorshipInput(item, index())}
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
									onClick={addAnnouncement}
								>
									<Plus size={16} stroke-width={1.5} />
								</button>
							</legend>
							<For each={announcements()}>
								{(a, index) => (
									<div class={styles.dynamicRow}>
										<textarea
											class={styles.textarea}
											rows={2}
											value={a.content}
											onInput={(e) =>
												updateAnnouncement(index(), e.currentTarget.value)
											}
											placeholder={t("bulletinForm.announcementPlaceholder")}
										/>
										<Show when={announcements().length > 1}>
											<button
												type="button"
												class={styles.removeButton}
												onClick={() => removeAnnouncement(index())}
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
									onClick={addAssignment}
								>
									<Plus size={16} stroke-width={1.5} />
								</button>
							</legend>
							<For each={assignments()}>
								{(a, index) => (
									<div class={styles.dynamicRow}>
										<input
											type="text"
											class={styles.inputSmall}
											placeholder={t("bulletinForm.rolePlaceholder")}
											value={a.role}
											onInput={(e) =>
												updateAssignment(index(), "role", e.currentTarget.value)
											}
										/>
										<input
											type="text"
											class={styles.inputSmall}
											placeholder={t("bulletinForm.personPlaceholder")}
											value={a.person}
											onInput={(e) =>
												updateAssignment(
													index(),
													"person",
													e.currentTarget.value,
												)
											}
										/>
										<Show when={assignments().length > 1}>
											<button
												type="button"
												class={styles.removeButton}
												onClick={() => removeAssignment(index())}
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
									submitting() || !serviceDate() || (!isEdit() && !hasContent())
								}
							>
								{isEdit() ? t("common.update") : t("common.create")}
							</button>
						</div>
						<Show when={!isEdit() && serviceDate() && !hasContent()}>
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
