import type {
	AnnouncementsSectionData,
	AnySection,
	AssignmentsSectionData,
	Member,
	SectionTemplate,
	WorshipProgramSectionData,
} from "@/types/bulletin.ts";
import { AnnouncementsView } from "./AnnouncementsView.tsx";
import { AssignmentsView } from "./AssignmentsView.tsx";
import { WorshipProgramView } from "./WorshipProgramView.tsx";

type Props = {
	section: AnySection;
	template: SectionTemplate[];
	members: Member[] | undefined;
};

export function SectionView(props: Props) {
	if (props.section.type === "worship-program") {
		return (
			<WorshipProgramView
				section={props.section as WorshipProgramSectionData}
				template={props.template}
				members={props.members}
			/>
		);
	}
	if (props.section.type === "announcements") {
		return (
			<AnnouncementsView section={props.section as AnnouncementsSectionData} />
		);
	}
	if (props.section.type === "assignments") {
		return (
			<AssignmentsView section={props.section as AssignmentsSectionData} />
		);
	}
	// Unknown section type: skip gracefully
	return null;
}
