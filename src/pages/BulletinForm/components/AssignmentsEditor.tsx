import { For } from "solid-js";
import { useLocale } from "@/store/LocaleContext.tsx";
import type {
	AssignmentsSectionData,
	Member,
	SectionTemplate,
} from "@/types/bulletin.ts";
import { filterMembersByRole, findSectionTemplate } from "@/utils/bulletin.ts";
import styles from "../BulletinForm.module.css";

type Props = {
	section: AssignmentsSectionData;
	template: SectionTemplate[];
	members: Member[] | undefined;
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
				<div class={styles.field}>
					<span class={styles.fieldLabel}>{role}</span>
					<select
						class={styles.select}
						value={props.section.data[role] ?? ""}
						onChange={(e) =>
							props.onUpdate(props.section.id, role, e.currentTarget.value)
						}
					>
						<option value="">{t("bulletinForm.selectAssignee")}</option>
						<For each={filterMembersByRole(props.members, role)}>
							{(m) => <option value={String(m.id)}>{m.name}</option>}
						</For>
					</select>
				</div>
			)}
		</For>
	);
}
