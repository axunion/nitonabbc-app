import { Plus } from "lucide-solid";
import { For } from "solid-js";
import { useLocale } from "@/store/LocaleContext.tsx";
import type {
	TemplateField,
	WorshipProgramSectionTemplate,
} from "@/types/bulletin.ts";
import styles from "../BulletinTemplate.module.css";
import { TemplateItemRow } from "./TemplateItemRow.tsx";

type Props = {
	section: WorshipProgramSectionTemplate;
	onUpdateItem: (
		sectionId: string,
		itemIndex: number,
		field: "type" | "label" | "inputType",
		value: string,
	) => void;
	onToggleFieldMode: (sectionId: string, itemIndex: number) => void;
	onAddField: (sectionId: string, itemIndex: number) => void;
	onRemoveField: (
		sectionId: string,
		itemIndex: number,
		fieldIndex: number,
	) => void;
	onUpdateField: (
		sectionId: string,
		itemIndex: number,
		fieldIndex: number,
		prop: keyof TemplateField,
		value: string,
	) => void;
	onAddItem: (sectionId: string) => void;
	onRemoveItem: (sectionId: string, itemIndex: number) => void;
	onMoveItem: (sectionId: string, itemIndex: number, dir: -1 | 1) => void;
};

export function WorshipProgramConfigEditor(props: Props) {
	const { t } = useLocale();
	const sid = () => props.section.id;

	return (
		<>
			<ul class={styles.programList}>
				<For each={props.section.config.items}>
					{(item, index) => (
						<TemplateItemRow
							item={item}
							index={index()}
							total={props.section.config.items.length}
							onMoveUp={(i) => props.onMoveItem(sid(), i, -1)}
							onMoveDown={(i) => props.onMoveItem(sid(), i, 1)}
							onUpdateItem={(i, field, value) =>
								props.onUpdateItem(sid(), i, field, value)
							}
							onToggleFieldMode={(i) => props.onToggleFieldMode(sid(), i)}
							onAddField={(i) => props.onAddField(sid(), i)}
							onRemoveField={(i, fi) => props.onRemoveField(sid(), i, fi)}
							onUpdateField={(i, fi, prop, value) =>
								props.onUpdateField(sid(), i, fi, prop, value)
							}
							onRemoveItem={(i) => props.onRemoveItem(sid(), i)}
						/>
					)}
				</For>
			</ul>
			<button
				type="button"
				class={styles.addButton}
				onClick={() => props.onAddItem(sid())}
			>
				<Plus size={16} stroke-width={1.5} />
				{t("worshipTemplate.addItem")}
			</button>
		</>
	);
}
