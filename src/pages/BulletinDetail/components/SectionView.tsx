import type {
	AnnouncementsSectionData,
	AnySection,
	AssignmentsSectionData,
	Member,
	MonthlySongSectionData,
	SectionTemplate,
	TextBlockSectionData,
	WeeklyVerseSectionData,
	WorshipProgramSectionData,
} from "@/types/bulletin.ts";
import { AnnouncementsView } from "./AnnouncementsView.tsx";
import { AssignmentsView } from "./AssignmentsView.tsx";
import { MonthlySongView } from "./MonthlySongView.tsx";
import { TextBlockView } from "./TextBlockView.tsx";
import { WeeklyVerseView } from "./WeeklyVerseView.tsx";
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
	if (props.section.type === "weekly-verse") {
		return (
			<WeeklyVerseView section={props.section as WeeklyVerseSectionData} />
		);
	}
	if (props.section.type === "monthly-song") {
		return (
			<MonthlySongView section={props.section as MonthlySongSectionData} />
		);
	}
	if (props.section.type === "text-block") {
		return <TextBlockView section={props.section as TextBlockSectionData} />;
	}
	// Unknown section type: skip gracefully
	return null;
}
