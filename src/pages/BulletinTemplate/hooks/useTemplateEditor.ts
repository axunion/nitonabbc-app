import {
	createEffect,
	createMemo,
	createResource,
	createSignal,
} from "solid-js";
import { fetchTemplate, saveTemplate } from "@/api/bulletin.ts";
import { useLocale } from "@/store/LocaleContext.tsx";
import type {
	InputType,
	SectionTemplate,
	TemplateField,
	TemplateItem,
	WorshipProgramSectionTemplate,
} from "@/types/bulletin.ts";
import type { SectionType } from "@/utils/template.ts";
import { defaultConfigFor } from "@/utils/template.ts";

export function useTemplateEditor() {
	const { t } = useLocale();
	const [templateData] = createResource(fetchTemplate);
	const [sections, setSections] = createSignal<SectionTemplate[]>([]);
	const [initialized, setInitialized] = createSignal(false);
	const [saving, setSaving] = createSignal(false);
	const [expandedSectionId, setExpandedSectionId] = createSignal<string | null>(
		null,
	);
	const [message, setMessage] = createSignal<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	createEffect(() => {
		const data = templateData();
		if (data && !initialized()) {
			setSections(data);
			setInitialized(true);
		}
	});

	function updateSection(
		id: string,
		updater: (s: SectionTemplate) => SectionTemplate,
	) {
		setSections((prev) => prev.map((s) => (s.id === id ? updater(s) : s)));
	}

	function toggleExpand(id: string) {
		setExpandedSectionId((prev) => (prev === id ? null : id));
	}

	function updateLabel(id: string, label: string) {
		updateSection(id, (s) => ({ ...s, label }));
	}

	function toggleVisible(id: string) {
		updateSection(id, (s) => ({ ...s, visible: !(s.visible ?? true) }));
	}

	function addSection(type: SectionType) {
		const id = crypto.randomUUID();
		const label = "";
		const config = defaultConfigFor(type);
		const newSection = {
			id,
			type,
			label,
			visible: true,
			config,
		} as SectionTemplate;
		setSections((prev) => [...prev, newSection]);
		setExpandedSectionId(id);
	}

	function removeSection(id: string) {
		setSections((prev) => prev.filter((s) => s.id !== id));
		if (expandedSectionId() === id) setExpandedSectionId(null);
	}

	function moveSection(id: string, direction: -1 | 1) {
		setSections((prev) => {
			const idx = prev.findIndex((s) => s.id === id);
			if (idx < 0) return prev;
			const target = idx + direction;
			if (target < 0 || target >= prev.length) return prev;
			const next = [...prev];
			[next[idx], next[target]] = [next[target], next[idx]];
			return next;
		});
	}

	function updateSubHeadings(id: string, subHeadings: string[]) {
		updateSection(id, (s) => {
			if (s.type !== "announcements") return s;
			return { ...s, config: { subHeadings } };
		});
	}

	function updateRoles(id: string, roles: string[]) {
		updateSection(id, (s) => {
			if (s.type !== "assignments") return s;
			return { ...s, config: { roles } };
		});
	}

	function updateMeetings(
		id: string,
		meetings: { key: string; label: string }[],
	) {
		updateSection(id, (s) => {
			if (s.type !== "attendance") return s;
			return { ...s, config: { meetings } };
		});
	}

	function updateFieldDefs(
		id: string,
		fieldDefs: import("@/types/bulletin.ts").ServiceMetaFieldDef[],
	) {
		updateSection(id, (s) => {
			if (s.type !== "service-meta") return s;
			return { ...s, config: { fieldDefs } };
		});
	}

	function updateFinancialItems(
		id: string,
		items: import("@/types/bulletin.ts").FinancialSummaryItem[],
	) {
		updateSection(id, (s) => {
			if (s.type !== "financial-summary") return s;
			return { ...s, config: { items } };
		});
	}

	function updateWorshipItem(
		sectionId: string,
		itemIndex: number,
		field: "type" | "label" | "inputType",
		value: string,
	) {
		updateSection(sectionId, (s) => {
			if (s.type !== "worship-program") return s;
			const items = s.config.items.map((item, i) =>
				i === itemIndex ? { ...item, [field]: value } : item,
			);
			return { ...s, config: { items } };
		});
	}

	function toggleWorshipFieldMode(sectionId: string, itemIndex: number) {
		updateSection(sectionId, (s) => {
			if (s.type !== "worship-program") return s;
			const items = s.config.items.map((item, i) => {
				if (i !== itemIndex) return item;
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
			});
			return { ...s, config: { items } };
		});
	}

	function addWorshipField(sectionId: string, itemIndex: number) {
		updateSection(sectionId, (s) => {
			if (s.type !== "worship-program") return s;
			const items = s.config.items.map((item, i) => {
				if (i !== itemIndex || !item.fields) return item;
				return {
					...item,
					fields: [
						...item.fields,
						{ key: "", label: "", inputType: "text" as InputType },
					],
				};
			});
			return { ...s, config: { items } };
		});
	}

	function removeWorshipField(
		sectionId: string,
		itemIndex: number,
		fieldIndex: number,
	) {
		updateSection(sectionId, (s) => {
			if (s.type !== "worship-program") return s;
			const items = s.config.items.map((item, i) => {
				if (i !== itemIndex || !item.fields) return item;
				return {
					...item,
					fields: item.fields.filter((_, fi) => fi !== fieldIndex),
				};
			});
			return { ...s, config: { items } };
		});
	}

	function updateWorshipField(
		sectionId: string,
		itemIndex: number,
		fieldIndex: number,
		prop: keyof TemplateField,
		value: string,
	) {
		updateSection(sectionId, (s) => {
			if (s.type !== "worship-program") return s;
			const items = s.config.items.map((item, i) => {
				if (i !== itemIndex || !item.fields) return item;
				return {
					...item,
					fields: item.fields.map((f, fi) =>
						fi === fieldIndex ? { ...f, [prop]: value } : f,
					),
				};
			});
			return { ...s, config: { items } };
		});
	}

	function addWorshipItem(sectionId: string) {
		updateSection(sectionId, (s) => {
			if (s.type !== "worship-program") return s;
			return {
				...s,
				config: {
					items: [
						...s.config.items,
						{ type: "", label: "", inputType: "text" as InputType },
					],
				},
			};
		});
	}

	function removeWorshipItem(sectionId: string, itemIndex: number) {
		updateSection(sectionId, (s) => {
			if (s.type !== "worship-program") return s;
			return {
				...s,
				config: { items: s.config.items.filter((_, i) => i !== itemIndex) },
			};
		});
	}

	function moveWorshipItem(
		sectionId: string,
		itemIndex: number,
		direction: -1 | 1,
	) {
		updateSection(sectionId, (s) => {
			if (s.type !== "worship-program") return s;
			const items = [...s.config.items];
			const target = itemIndex + direction;
			if (target < 0 || target >= items.length) return s;
			[items[itemIndex], items[target]] = [items[target], items[itemIndex]];
			return { ...s, config: { items } };
		});
	}

	function isWorshipSectionValid(s: WorshipProgramSectionTemplate): boolean {
		return (
			s.config.items.length > 0 &&
			s.config.items.every((i: TemplateItem) => {
				if (i.type.trim() === "" || i.label.trim() === "") return false;
				if (i.fields) {
					return (
						i.fields.length > 0 &&
						i.fields.every(
							(f: TemplateField) =>
								f.key.trim() !== "" && f.label.trim() !== "",
						)
					);
				}
				return true;
			})
		);
	}

	const isValid = createMemo(
		() =>
			sections().length > 0 &&
			sections().every((s) => {
				if (s.label.trim() === "") return false;
				if (s.type === "worship-program") return isWorshipSectionValid(s);
				if (s.type === "assignments") return s.config.roles.length > 0;
				return true;
			}) &&
			new Set(sections().map((s) => s.id)).size === sections().length,
	);

	async function handleSave(e: SubmitEvent) {
		e.preventDefault();
		setMessage(null);
		setSaving(true);
		try {
			const result = await saveTemplate(sections());
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
		sections,
		initialized,
		saving,
		expandedSectionId,
		message,
		isValid,
		toggleExpand,
		updateLabel,
		toggleVisible,
		addSection,
		removeSection,
		moveSection,
		updateSubHeadings,
		updateRoles,
		updateMeetings,
		updateWorshipItem,
		toggleWorshipFieldMode,
		addWorshipField,
		removeWorshipField,
		updateWorshipField,
		addWorshipItem,
		removeWorshipItem,
		moveWorshipItem,
		updateFieldDefs,
		updateFinancialItems,
		handleSave,
	};
}
