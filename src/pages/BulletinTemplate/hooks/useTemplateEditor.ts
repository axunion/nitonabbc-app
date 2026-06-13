import {
	createEffect,
	createMemo,
	createResource,
	createSignal,
} from "solid-js";
import { createStore, produce, unwrap } from "solid-js/store";
import { fetchTemplate, resetTemplate, saveTemplate } from "@/api/bulletin.ts";
import { showToast } from "@/components/Toast/index.ts";
import { useLocale } from "@/store/LocaleContext.tsx";
import type {
	FinancialSummaryItem,
	InputType,
	SectionTemplate,
	ServiceMetaFieldDef,
	TemplateField,
	TemplateItem,
	WorshipProgramSectionTemplate,
} from "@/types/bulletin.ts";

export type TemplateEditor = ReturnType<typeof useTemplateEditor>;

export function useTemplateEditor() {
	const { t } = useLocale();
	const [templateData] = createResource(fetchTemplate);
	// Store-based state keeps object identity for untouched sections/items, so
	// <For> rows are patched in place instead of recreated (which would drop
	// focus from the input being typed into).
	const [state, setState] = createStore<{ sections: SectionTemplate[] }>({
		sections: [],
	});
	const [initialized, setInitialized] = createSignal(false);
	const [saving, setSaving] = createSignal(false);
	const [savedSnapshot, setSavedSnapshot] = createSignal("");

	createEffect(() => {
		const data = templateData();
		if (data && !initialized()) {
			setState("sections", data);
			setSavedSnapshot(JSON.stringify(data));
			setInitialized(true);
		}
	});

	const sections = () => state.sections;

	const isDirty = createMemo(
		() =>
			initialized() &&
			JSON.stringify(unwrap(state.sections)) !== savedSnapshot(),
	);

	// All edits funnel through here
	function mutateSections(mutator: (sections: SectionTemplate[]) => void) {
		setState("sections", produce(mutator));
	}

	function findWorship(
		sectionList: SectionTemplate[],
		id: string,
	): WorshipProgramSectionTemplate | undefined {
		const section = sectionList.find((s) => s.id === id);
		return section?.type === "worship-program" ? section : undefined;
	}

	function updateLabel(id: string, label: string) {
		mutateSections((sectionList) => {
			const section = sectionList.find((s) => s.id === id);
			if (section) section.label = label;
		});
	}

	function toggleVisible(id: string) {
		mutateSections((sectionList) => {
			const section = sectionList.find((s) => s.id === id);
			if (section) section.visible = !(section.visible ?? true);
		});
	}

	function updateSubHeadings(id: string, subHeadings: string[]) {
		mutateSections((sectionList) => {
			const section = sectionList.find((s) => s.id === id);
			if (section?.type === "announcements")
				section.config.subHeadings = subHeadings;
		});
	}

	function updateRoles(id: string, roles: string[]) {
		mutateSections((sectionList) => {
			const section = sectionList.find((s) => s.id === id);
			if (section?.type === "assignments") section.config.roles = roles;
		});
	}

	function updateMeetings(
		id: string,
		meetings: { key: string; label: string }[],
	) {
		mutateSections((sectionList) => {
			const section = sectionList.find((s) => s.id === id);
			if (section?.type === "attendance") section.config.meetings = meetings;
		});
	}

	function updateFieldDefs(id: string, fieldDefs: ServiceMetaFieldDef[]) {
		mutateSections((sectionList) => {
			const section = sectionList.find((s) => s.id === id);
			if (section?.type === "service-meta")
				section.config.fieldDefs = fieldDefs;
		});
	}

	function updateFinancialItems(id: string, items: FinancialSummaryItem[]) {
		mutateSections((sectionList) => {
			const section = sectionList.find((s) => s.id === id);
			if (section?.type === "financial-summary") section.config.items = items;
		});
	}

	function updateWorshipItem(
		sectionId: string,
		itemIndex: number,
		field: "type" | "label" | "inputType",
		value: string,
	) {
		mutateSections((sectionList) => {
			const item = findWorship(sectionList, sectionId)?.config.items[itemIndex];
			if (!item) return;
			if (field === "inputType") item.inputType = value as InputType;
			else item[field] = value;
		});
	}

	function toggleWorshipFieldMode(sectionId: string, itemIndex: number) {
		mutateSections((sectionList) => {
			const item = findWorship(sectionList, sectionId)?.config.items[itemIndex];
			if (!item) return;
			if (item.fields) {
				delete item.fields;
				item.inputType = "text";
			} else {
				delete item.inputType;
				item.fields = [
					{
						key: "value",
						label: t("worshipTemplate.defaultFieldLabel"),
						inputType: "text",
					},
				];
			}
		});
	}

	function addWorshipField(sectionId: string, itemIndex: number) {
		mutateSections((sectionList) => {
			const item = findWorship(sectionList, sectionId)?.config.items[itemIndex];
			item?.fields?.push({ key: "", label: "", inputType: "text" });
		});
	}

	function removeWorshipField(
		sectionId: string,
		itemIndex: number,
		fieldIndex: number,
	) {
		mutateSections((sectionList) => {
			const item = findWorship(sectionList, sectionId)?.config.items[itemIndex];
			item?.fields?.splice(fieldIndex, 1);
		});
	}

	function updateWorshipField(
		sectionId: string,
		itemIndex: number,
		fieldIndex: number,
		prop: keyof TemplateField,
		value: string,
	) {
		mutateSections((sectionList) => {
			const field = findWorship(sectionList, sectionId)?.config.items[itemIndex]
				?.fields?.[fieldIndex];
			if (!field) return;
			if (prop === "inputType") field.inputType = value as InputType;
			else field[prop] = value;
		});
	}

	function addWorshipItem(sectionId: string) {
		mutateSections((sectionList) => {
			findWorship(sectionList, sectionId)?.config.items.push({
				type: "",
				label: "",
				inputType: "text",
			});
		});
	}

	function removeWorshipItem(sectionId: string, itemIndex: number) {
		mutateSections((sectionList) => {
			findWorship(sectionList, sectionId)?.config.items.splice(itemIndex, 1);
		});
	}

	function moveWorshipItem(
		sectionId: string,
		itemIndex: number,
		direction: -1 | 1,
	) {
		mutateSections((sectionList) => {
			const items = findWorship(sectionList, sectionId)?.config.items;
			if (!items) return;
			const target = itemIndex + direction;
			if (target < 0 || target >= items.length) return;
			const [moved] = items.splice(itemIndex, 1);
			items.splice(target, 0, moved);
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
		setSaving(true);
		try {
			const toSave = unwrap(state.sections);
			const result = await saveTemplate(toSave);
			if (result.error) {
				showToast(result.error, "error");
				return;
			}
			setSavedSnapshot(JSON.stringify(toSave));
			showToast(t("worshipTemplate.saved"), "success");
		} catch {
			showToast(t("worshipTemplate.saveError"), "error");
		} finally {
			setSaving(false);
		}
	}

	async function handleReset() {
		setSaving(true);
		try {
			const result = await resetTemplate();
			if (!result.template) {
				showToast(result.error ?? t("worshipTemplate.saveError"), "error");
				return;
			}
			setState("sections", result.template);
			setSavedSnapshot(JSON.stringify(result.template));
			showToast(t("bulletinTemplate.resetDone"), "success");
		} catch {
			showToast(t("worshipTemplate.saveError"), "error");
		} finally {
			setSaving(false);
		}
	}

	return {
		sections,
		initialized,
		saving,
		isValid,
		isDirty,
		updateLabel,
		toggleVisible,
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
		handleReset,
	};
}
