import { useLocale } from "@/store/LocaleContext.tsx";
import type { AnnouncementsSectionTemplate } from "@/types/bulletin.ts";
import { StringListEditor } from "./StringListEditor.tsx";

type Props = {
	section: AnnouncementsSectionTemplate;
	onUpdateSubHeadings: (sectionId: string, subHeadings: string[]) => void;
};

export function AnnouncementsConfigEditor(props: Props) {
	const { t } = useLocale();
	return (
		<StringListEditor
			items={props.section.config.subHeadings ?? []}
			onChange={(items) => props.onUpdateSubHeadings(props.section.id, items)}
			placeholder={t("bulletinTemplate.subHeadingPlaceholder")}
			addLabel={t("bulletinTemplate.addSubHeading")}
		/>
	);
}
