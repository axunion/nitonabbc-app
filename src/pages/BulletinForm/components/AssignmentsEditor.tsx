import { For } from "solid-js";
import { useLocale } from "@/store/LocaleContext.tsx";
import type {
	AssignmentsSectionData,
	SectionTemplate,
} from "@/types/bulletin.ts";
import { findSectionTemplate } from "@/utils/bulletin.ts";
import styles from "../BulletinForm.module.css";

type Props = {
	section: AssignmentsSectionData;
	template: SectionTemplate[];
	onUpdate: (sectionId: string, role: string, value: string) => void;
};

export function AssignmentsEditor(props: Props) {
	const { t } = useLocale();

	const roles = () => {
		const tmpl = findSectionTemplate(props.template, props.section.id);
		return tmpl?.type === "assignments" ? tmpl.config.roles : [];
	};

	return (
		<For each={roles()}>
			{(role) => (
				<div class={styles.dynamicRow}>
					<span class={styles.assignmentRoleLabel}>{role}</span>
					<input
						type="text"
						class={styles.inputSmall}
						placeholder={t("bulletinForm.personPlaceholder")}
						value={props.section.data[role] ?? ""}
						onInput={(e) =>
							props.onUpdate(props.section.id, role, e.currentTarget.value)
						}
					/>
				</div>
			)}
		</For>
	);
}
