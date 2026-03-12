import { useNavigate } from "@solidjs/router";
import { ChevronDown, ChevronUp, Minus, Plus, Settings } from "lucide-solid";
import { createResource, createSignal, For, Show } from "solid-js";
import { fetchTemplate } from "@/api/bulletin.ts";
import { Header } from "@/components/Header";
import { useAuth } from "@/store/AuthContext.tsx";
import { useLocale } from "@/store/LocaleContext.tsx";
import type {
	InputType,
	TemplateField,
	TemplateItem,
} from "@/types/bulletin.ts";
import styles from "./BulletinTemplate.module.css";

const INPUT_TYPES: InputType[] = [
	"text",
	"number",
	"member",
	"scripture",
	"none",
];

export function BulletinTemplate() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { t } = useLocale();

	if (user()?.role !== "admin") {
		navigate("/", { replace: true });
	}

	const [templateData] = createResource(fetchTemplate);
	const [items, setItems] = createSignal<TemplateItem[]>([]);
	const [initialized, setInitialized] = createSignal(false);
	const [saving, setSaving] = createSignal(false);
	const [expandedIndex, setExpandedIndex] = createSignal<number | null>(null);
	const [message, setMessage] = createSignal<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	const initItems = () => {
		const data = templateData();
		if (data && !initialized()) {
			setItems(
				data.map((i) => {
					const item: TemplateItem = { type: i.type, label: i.label };
					if (i.fields && i.fields.length > 0) {
						item.fields = i.fields.map((f) => ({
							key: f.key,
							label: f.label,
							inputType: f.inputType,
						}));
					} else {
						item.inputType = i.inputType ?? "text";
					}
					return item;
				}),
			);
			setInitialized(true);
		}
		return null;
	};

	function toggleExpand(index: number) {
		setExpandedIndex((prev) => (prev === index ? null : index));
	}

	function updateItem(
		index: number,
		field: "type" | "label" | "inputType",
		value: string,
	) {
		setItems((prev) =>
			prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
		);
	}

	function toggleFieldMode(index: number) {
		setItems((prev) =>
			prev.map((item, i) => {
				if (i !== index) return item;
				if (item.fields) {
					const { fields: _fields, ...rest } = item;
					return { ...rest, inputType: "text" };
				}
				const { inputType: _inputType, ...rest } = item;
				return {
					...rest,
					fields: [
						{ key: "value", label: "値", inputType: "text" as InputType },
					],
				};
			}),
		);
	}

	function addField(itemIndex: number) {
		setItems((prev) =>
			prev.map((item, i) => {
				if (i !== itemIndex || !item.fields) return item;
				return {
					...item,
					fields: [
						...item.fields,
						{ key: "", label: "", inputType: "text" as InputType },
					],
				};
			}),
		);
	}

	function removeField(itemIndex: number, fieldIndex: number) {
		setItems((prev) =>
			prev.map((item, i) => {
				if (i !== itemIndex || !item.fields) return item;
				return {
					...item,
					fields: item.fields.filter((_, fi) => fi !== fieldIndex),
				};
			}),
		);
	}

	function updateField(
		itemIndex: number,
		fieldIndex: number,
		prop: keyof TemplateField,
		value: string,
	) {
		setItems((prev) =>
			prev.map((item, i) => {
				if (i !== itemIndex || !item.fields) return item;
				return {
					...item,
					fields: item.fields.map((f, fi) =>
						fi === fieldIndex ? { ...f, [prop]: value } : f,
					),
				};
			}),
		);
	}

	function addItem() {
		setItems((prev) => [...prev, { type: "", label: "", inputType: "text" }]);
		setExpandedIndex(items().length);
	}

	function removeItem(index: number) {
		setItems((prev) => prev.filter((_, i) => i !== index));
		if (expandedIndex() === index) setExpandedIndex(null);
	}

	function moveItem(index: number, direction: -1 | 1) {
		setItems((prev) => {
			const next = [...prev];
			const target = index + direction;
			if (target < 0 || target >= next.length) return prev;
			[next[index], next[target]] = [next[target], next[index]];
			return next;
		});
		setExpandedIndex((prev) => {
			if (prev === index) return index + direction;
			if (prev === index + direction) return index;
			return prev;
		});
	}

	function inputTypeLabel(it: InputType): string {
		const labels: Record<InputType, string> = {
			text: t("worshipTemplate.inputTypeText"),
			number: t("worshipTemplate.inputTypeNumber"),
			member: t("worshipTemplate.inputTypeMember"),
			scripture: t("worshipTemplate.inputTypeScripture"),
			none: t("worshipTemplate.inputTypeNone"),
		};
		return labels[it];
	}

	function itemSummary(item: TemplateItem): string {
		if (item.fields && item.fields.length > 0) {
			return item.fields.map((f) => f.label || f.key).join(" / ");
		}
		return inputTypeLabel((item.inputType ?? "text") as InputType);
	}

	async function handleSave(e: SubmitEvent) {
		e.preventDefault();
		setMessage(null);
		setSaving(true);
		try {
			const res = await fetch("/api/bulletin-template", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(items()),
			});
			if (!res.ok) {
				const data = (await res.json()) as { error?: string };
				setMessage({
					type: "error",
					text: data.error ?? t("worshipTemplate.saveError"),
				});
				return;
			}
			setMessage({ type: "success", text: t("worshipTemplate.saved") });
		} catch {
			setMessage({ type: "error", text: t("worshipTemplate.saveError") });
		} finally {
			setSaving(false);
		}
	}

	const isValid = () =>
		items().length > 0 &&
		items().every((i) => {
			if (i.type.trim() === "" || i.label.trim() === "") return false;
			if (i.fields) {
				return (
					i.fields.length > 0 &&
					i.fields.every((f) => f.key.trim() !== "" && f.label.trim() !== "")
				);
			}
			return true;
		});

	return (
		<>
			<Header title={t("worshipTemplate.title")} backTo="/settings/admin" />
			<div class={styles.container}>
				{initItems()}

				<Show
					when={initialized()}
					fallback={<p class={styles.loading}>{t("common.loading")}</p>}
				>
					<p class={styles.description}>{t("worshipTemplate.description")}</p>

					<Show when={message()}>
						{(msg) => (
							<p
								class={msg().type === "success" ? styles.success : styles.error}
							>
								{msg().text}
							</p>
						)}
					</Show>

					<form onSubmit={handleSave} class={styles.form}>
						<ul class={styles.itemList}>
							<For each={items()}>
								{(item, index) => {
									const isExpanded = () => expandedIndex() === index();
									return (
										<li class={styles.item}>
											{/* Collapsed row */}
											<div class={styles.itemHeader}>
												<div class={styles.orderButtons}>
													<button
														type="button"
														class={styles.orderButton}
														onClick={() => moveItem(index(), -1)}
														disabled={index() === 0}
														title={t("worshipTemplate.moveUp")}
													>
														<ChevronUp size={14} stroke-width={1.5} />
													</button>
													<button
														type="button"
														class={styles.orderButton}
														onClick={() => moveItem(index(), 1)}
														disabled={index() === items().length - 1}
														title={t("worshipTemplate.moveDown")}
													>
														<ChevronDown size={14} stroke-width={1.5} />
													</button>
												</div>

												<button
													type="button"
													class={styles.itemSummary}
													onClick={() => toggleExpand(index())}
												>
													<span class={styles.itemLabel}>
														{item.label || item.type || "..."}
													</span>
													<span class={styles.itemMeta}>
														{itemSummary(item)}
													</span>
												</button>

												<button
													type="button"
													class={styles.expandButton}
													onClick={() => toggleExpand(index())}
													title={t("worshipTemplate.templateSettings")}
												>
													<Settings size={16} stroke-width={1.5} />
												</button>
											</div>

											{/* Expanded detail */}
											<Show when={isExpanded()}>
												<div class={styles.itemDetail}>
													<div class={styles.detailRow}>
														<input
															type="text"
															class={styles.input}
															placeholder={t(
																"worshipTemplate.labelPlaceholder",
															)}
															value={item.label}
															onInput={(e) =>
																updateItem(
																	index(),
																	"label",
																	e.currentTarget.value,
																)
															}
														/>
														<input
															type="text"
															class={styles.inputSmall}
															placeholder={t("worshipTemplate.typePlaceholder")}
															value={item.type}
															onInput={(e) =>
																updateItem(
																	index(),
																	"type",
																	e.currentTarget.value,
																)
															}
														/>
													</div>

													{/* Input type selector */}
													<Show when={!item.fields}>
														<div class={styles.chipRow}>
															<For each={INPUT_TYPES}>
																{(it) => (
																	<button
																		type="button"
																		class={styles.chip}
																		classList={{
																			[styles.chipActive]:
																				(item.inputType ?? "text") === it,
																		}}
																		onClick={() =>
																			updateItem(index(), "inputType", it)
																		}
																	>
																		{inputTypeLabel(it)}
																	</button>
																)}
															</For>
														</div>
													</Show>

													{/* Compound fields toggle */}
													<button
														type="button"
														class={styles.modeToggle}
														onClick={() => toggleFieldMode(index())}
													>
														{item.fields
															? t("worshipTemplate.inputType")
															: t("worshipTemplate.useFields")}
													</button>

													{/* Sub-fields */}
													<Show when={item.fields}>
														<div class={styles.fieldsSection}>
															<For each={item.fields}>
																{(field, fi) => (
																	<div class={styles.fieldRow}>
																		<input
																			type="text"
																			class={styles.fieldInput}
																			placeholder={t(
																				"worshipTemplate.fieldKeyPlaceholder",
																			)}
																			value={field.key}
																			onInput={(e) =>
																				updateField(
																					index(),
																					fi(),
																					"key",
																					e.currentTarget.value,
																				)
																			}
																		/>
																		<input
																			type="text"
																			class={styles.fieldInput}
																			placeholder={t(
																				"worshipTemplate.fieldLabelPlaceholder",
																			)}
																			value={field.label}
																			onInput={(e) =>
																				updateField(
																					index(),
																					fi(),
																					"label",
																					e.currentTarget.value,
																				)
																			}
																		/>
																		<select
																			class={styles.fieldSelect}
																			value={field.inputType}
																			onChange={(e) =>
																				updateField(
																					index(),
																					fi(),
																					"inputType",
																					e.currentTarget.value,
																				)
																			}
																		>
																			<For each={INPUT_TYPES}>
																				{(it) => (
																					<option value={it}>
																						{inputTypeLabel(it)}
																					</option>
																				)}
																			</For>
																		</select>
																		<Show when={(item.fields?.length ?? 0) > 1}>
																			<button
																				type="button"
																				class={styles.fieldRemoveButton}
																				onClick={() =>
																					removeField(index(), fi())
																				}
																			>
																				<Minus size={14} stroke-width={1.5} />
																			</button>
																		</Show>
																	</div>
																)}
															</For>
															<button
																type="button"
																class={styles.addFieldButton}
																onClick={() => addField(index())}
															>
																<Plus size={14} stroke-width={1.5} />
																{t("worshipTemplate.addField")}
															</button>
														</div>
													</Show>

													<button
														type="button"
														class={styles.deleteButton}
														onClick={() => removeItem(index())}
													>
														<Minus size={14} stroke-width={1.5} />
														{t("worshipTemplate.deleteItem")}
													</button>
												</div>
											</Show>
										</li>
									);
								}}
							</For>
						</ul>

						<button type="button" class={styles.addButton} onClick={addItem}>
							<Plus size={16} stroke-width={1.5} />
							{t("worshipTemplate.addItem")}
						</button>

						<div class={styles.actions}>
							<button
								type="button"
								class={styles.cancelButton}
								onClick={() => navigate("/settings/admin")}
							>
								{t("common.cancel")}
							</button>
							<button
								type="submit"
								class={styles.saveButton}
								disabled={saving() || !isValid()}
							>
								{t("worshipTemplate.save")}
							</button>
						</div>
					</form>
				</Show>
			</div>
		</>
	);
}
