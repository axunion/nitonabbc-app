import { useLocale } from "@/store/LocaleContext.tsx";
import type { AssignmentsSectionTemplate } from "@/types/bulletin.ts";
import { StringListEditor } from "./StringListEditor.tsx";

type Props = {
	section: AssignmentsSectionTemplate;
	onUpdateRoles: (sectionId: string, roles: string[]) => void;
};

export function AssignmentsConfigEditor(props: Props) {
	const { t } = useLocale();
	return (
		<StringListEditor
			items={props.section.config.roles}
			onChange={(items) => props.onUpdateRoles(props.section.id, items)}
			placeholder={t("bulletinTemplate.rolePlaceholder")}
			addLabel={t("bulletinTemplate.addRole")}
			minItems={1}
		/>
	);
}
