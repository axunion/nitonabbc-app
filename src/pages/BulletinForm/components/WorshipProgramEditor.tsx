import { For } from "solid-js";
import type {
	Member,
	SectionTemplate,
	WorshipProgramSectionData,
} from "@/types/bulletin.ts";
import { findSectionTemplate } from "@/utils/bulletin.ts";
import styles from "../BulletinForm.module.css";
import { WorshipInput } from "./WorshipInput.tsx";

type Props = {
	section: WorshipProgramSectionData;
	template: SectionTemplate[];
	members: Member[] | undefined;
	onUpdateDetails: (sectionId: string, index: number, value: string) => void;
	onUpdateFieldValue: (
		sectionId: string,
		index: number,
		key: string,
		value: string,
	) => void;
};

export function WorshipProgramEditor(props: Props) {
	const templateItems = () => {
		const tmpl = findSectionTemplate(props.template, props.section.id);
		return tmpl?.type === "worship-program" ? tmpl.config.items : [];
	};

	return (
		<For each={props.section.data}>
			{(item, index) => (
				<div class={styles.worshipCard}>
					<span class={styles.worshipLabel}>{item.label}</span>
					<WorshipInput
						item={item}
						index={index()}
						template={templateItems()}
						members={props.members}
						onUpdateDetails={(i, v) =>
							props.onUpdateDetails(props.section.id, i, v)
						}
						onUpdateFieldValue={(i, k, v) =>
							props.onUpdateFieldValue(props.section.id, i, k, v)
						}
					/>
				</div>
			)}
		</For>
	);
}
