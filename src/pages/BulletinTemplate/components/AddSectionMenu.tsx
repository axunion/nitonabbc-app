import { Plus } from "lucide-solid";
import { For } from "solid-js";
import { useLocale } from "@/store/LocaleContext.tsx";
import type { SectionType } from "@/utils/template.ts";
import { SECTION_TYPES } from "@/utils/template.ts";
import styles from "../BulletinTemplate.module.css";
import sectionStyles from "./AddSectionMenu.module.css";

type Props = {
	onAdd: (type: SectionType) => void;
};

export function AddSectionMenu(props: Props) {
	const { t } = useLocale();

	const typeLabel = (type: SectionType) => {
		if (type === "worship-program")
			return t("bulletinTemplate.sectionTypeWorship");
		if (type === "announcements")
			return t("bulletinTemplate.sectionTypeAnnouncements");
		if (type === "assignments")
			return t("bulletinTemplate.sectionTypeAssignments");
		if (type === "weekly-verse")
			return t("bulletinTemplate.sectionTypeWeeklyVerse");
		if (type === "monthly-song")
			return t("bulletinTemplate.sectionTypeMonthlySong");
		if (type === "text-block")
			return t("bulletinTemplate.sectionTypeTextBlock");
		if (type === "weekly-prayer")
			return t("bulletinTemplate.sectionTypeWeeklyPrayer");
		if (type === "upcoming-events")
			return t("bulletinTemplate.sectionTypeUpcomingEvents");
		return type as string;
	};

	return (
		<div class={sectionStyles.menu}>
			<For each={SECTION_TYPES}>
				{(type) => (
					<button
						type="button"
						class={styles.addButton}
						onClick={() => props.onAdd(type)}
					>
						<Plus size={16} stroke-width={1.5} />
						{typeLabel(type)}
					</button>
				)}
			</For>
		</div>
	);
}
