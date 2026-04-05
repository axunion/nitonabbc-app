import { createEffect, createResource, createSignal } from "solid-js";
import { fetchTemplate, saveTemplate } from "@/api/bulletin.ts";
import { useLocale } from "@/store/LocaleContext.tsx";
import type {
	InputType,
	TemplateField,
	TemplateItem,
} from "@/types/bulletin.ts";

export function useTemplateEditor() {
	const { t } = useLocale();
	const [templateData] = createResource(fetchTemplate);
	const [items, setItems] = createSignal<TemplateItem[]>([]);
	const [initialized, setInitialized] = createSignal(false);
	const [saving, setSaving] = createSignal(false);
	const [expandedIndex, setExpandedIndex] = createSignal<number | null>(null);
	const [message, setMessage] = createSignal<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	createEffect(() => {
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
	});

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
					return { ...rest, inputType: "text" as InputType };
				}
				const { inputType: _inputType, ...rest } = item;
				return {
					...rest,
					fields: [
						{
							key: "value",
							label: t("worshipTemplate.defaultFieldLabel"),
							inputType: "text" as InputType,
						},
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
		setExpandedIndex(items().length - 1);
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

	async function handleSave(e: SubmitEvent) {
		e.preventDefault();
		setMessage(null);
		setSaving(true);
		try {
			const result = await saveTemplate(items());
			if (result.error) {
				setMessage({
					type: "error",
					text: result.error ?? t("worshipTemplate.saveError"),
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

	return {
		items,
		initialized,
		saving,
		expandedIndex,
		message,
		isValid,
		toggleExpand,
		updateItem,
		toggleFieldMode,
		addField,
		removeField,
		updateField,
		addItem,
		removeItem,
		moveItem,
		handleSave,
	};
}
