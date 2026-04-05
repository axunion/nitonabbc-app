import { ChevronDown, ChevronUp, Minus, Plus, Settings } from "lucide-solid";
import { For, type JSX, Show } from "solid-js";
import { useLocale } from "@/store/LocaleContext.tsx";
import type {
	InputType,
	TemplateField,
	TemplateItem,
} from "@/types/bulletin.ts";
import { INPUT_TYPES } from "@/utils/template.ts";
import styles from "../BulletinTemplate.module.css";

interface TemplateItemRowProps {
	item: TemplateItem;
	index: number;
	total: number;
	isExpanded: boolean;
	onToggle: (index: number) => void;
	onMoveUp: (index: number) => void;
	onMoveDown: (index: number) => void;
	onUpdateItem: (
		index: number,
		field: "type" | "label" | "inputType",
		value: string,
	) => void;
	onToggleFieldMode: (index: number) => void;
	onAddField: (index: number) => void;
	onRemoveField: (index: number, fieldIndex: number) => void;
	onUpdateField: (
		index: number,
		fieldIndex: number,
		prop: keyof TemplateField,
		value: string,
	) => void;
	onRemoveItem: (index: number) => void;
}

export function TemplateItemRow(props: TemplateItemRowProps): JSX.Element {
	const { t } = useLocale();

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

	function itemSummary(): string {
		if (props.item.fields && props.item.fields.length > 0) {
			return props.item.fields.map((f) => f.label || f.key).join(" / ");
		}
		return inputTypeLabel((props.item.inputType ?? "text") as InputType);
	}

	return (
		<li class={styles.item}>
			{/* Collapsed row */}
			<div class={styles.itemHeader}>
				<div class={styles.orderButtons}>
					<button
						type="button"
						class={styles.orderButton}
						onClick={() => props.onMoveUp(props.index)}
						disabled={props.index === 0}
						title={t("worshipTemplate.moveUp")}
					>
						<ChevronUp size={14} stroke-width={1.5} />
					</button>
					<button
						type="button"
						class={styles.orderButton}
						onClick={() => props.onMoveDown(props.index)}
						disabled={props.index === props.total - 1}
						title={t("worshipTemplate.moveDown")}
					>
						<ChevronDown size={14} stroke-width={1.5} />
					</button>
				</div>

				<button
					type="button"
					class={styles.itemSummary}
					onClick={() => props.onToggle(props.index)}
				>
					<span class={styles.itemLabel}>
						{props.item.label || props.item.type || "..."}
					</span>
					<span class={styles.itemMeta}>{itemSummary()}</span>
				</button>

				<button
					type="button"
					class={styles.expandButton}
					onClick={() => props.onToggle(props.index)}
					title={t("worshipTemplate.templateSettings")}
				>
					<Settings size={16} stroke-width={1.5} />
				</button>
			</div>

			{/* Expanded detail */}
			<Show when={props.isExpanded}>
				<div class={styles.itemDetail}>
					<div class={styles.detailRow}>
						<input
							type="text"
							class={styles.input}
							placeholder={t("worshipTemplate.labelPlaceholder")}
							value={props.item.label}
							onInput={(e) =>
								props.onUpdateItem(props.index, "label", e.currentTarget.value)
							}
						/>
						<input
							type="text"
							class={styles.inputSmall}
							placeholder={t("worshipTemplate.typePlaceholder")}
							value={props.item.type}
							onInput={(e) =>
								props.onUpdateItem(props.index, "type", e.currentTarget.value)
							}
						/>
					</div>

					{/* Input type selector */}
					<Show when={!props.item.fields}>
						<div class={styles.chipRow}>
							<For each={INPUT_TYPES}>
								{(it) => (
									<button
										type="button"
										class={styles.chip}
										classList={{
											[styles.chipActive]:
												(props.item.inputType ?? "text") === it,
										}}
										onClick={() =>
											props.onUpdateItem(props.index, "inputType", it)
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
						onClick={() => props.onToggleFieldMode(props.index)}
					>
						{props.item.fields
							? t("worshipTemplate.inputType")
							: t("worshipTemplate.useFields")}
					</button>

					{/* Sub-fields */}
					<Show when={props.item.fields}>
						<div class={styles.fieldsSection}>
							<For each={props.item.fields}>
								{(field, fi) => (
									<div class={styles.fieldRow}>
										<input
											type="text"
											class={styles.fieldInput}
											placeholder={t("worshipTemplate.fieldKeyPlaceholder")}
											value={field.key}
											onInput={(e) =>
												props.onUpdateField(
													props.index,
													fi(),
													"key",
													e.currentTarget.value,
												)
											}
										/>
										<input
											type="text"
											class={styles.fieldInput}
											placeholder={t("worshipTemplate.fieldLabelPlaceholder")}
											value={field.label}
											onInput={(e) =>
												props.onUpdateField(
													props.index,
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
												props.onUpdateField(
													props.index,
													fi(),
													"inputType",
													e.currentTarget.value,
												)
											}
										>
											<For each={INPUT_TYPES}>
												{(it) => (
													<option value={it}>{inputTypeLabel(it)}</option>
												)}
											</For>
										</select>
										<Show when={(props.item.fields?.length ?? 0) > 1}>
											<button
												type="button"
												class={styles.fieldRemoveButton}
												onClick={() => props.onRemoveField(props.index, fi())}
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
								onClick={() => props.onAddField(props.index)}
							>
								<Plus size={14} stroke-width={1.5} />
								{t("worshipTemplate.addField")}
							</button>
						</div>
					</Show>

					<button
						type="button"
						class={styles.deleteButton}
						onClick={() => props.onRemoveItem(props.index)}
					>
						<Minus size={14} stroke-width={1.5} />
						{t("worshipTemplate.deleteItem")}
					</button>
				</div>
			</Show>
		</li>
	);
}
