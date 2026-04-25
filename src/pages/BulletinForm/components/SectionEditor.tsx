import type {
	AnnouncementsSectionData,
	AssignmentsSectionData,
	Member,
	MonthlySongSectionData,
	SectionData,
	SectionTemplate,
	TextBlockSectionData,
	WeeklyVerseSectionData,
	WorshipProgramSectionData,
} from "@/types/bulletin.ts";
import { AnnouncementsEditor } from "./AnnouncementsEditor.tsx";
import { AssignmentsEditor } from "./AssignmentsEditor.tsx";
import { MonthlySongEditor } from "./MonthlySongEditor.tsx";
import { TextBlockEditor } from "./TextBlockEditor.tsx";
import { WeeklyVerseEditor } from "./WeeklyVerseEditor.tsx";
import { WorshipProgramEditor } from "./WorshipProgramEditor.tsx";

type Props = {
	section: SectionData;
	template: SectionTemplate[];
	members: Member[] | undefined;
	onUpdateDetails: (sectionId: string, index: number, value: string) => void;
	onUpdateFieldValue: (
		sectionId: string,
		index: number,
		key: string,
		value: string,
	) => void;
	onUpdateAssignee: (sectionId: string, index: number, value: string) => void;
	onAddAnnouncement: (sectionId: string) => void;
	onRemoveAnnouncement: (sectionId: string, index: number) => void;
	onUpdateAnnouncement: (
		sectionId: string,
		index: number,
		value: string,
	) => void;
	onUpdateAssignment: (sectionId: string, role: string, value: string) => void;
	onUpdateWeeklyVerse: (
		sectionId: string,
		data: { reference: string; text: string },
	) => void;
	onUpdateMonthlySong: (
		sectionId: string,
		data: { title: string; keywords: string[] },
	) => void;
	onUpdateTextBlock: (
		sectionId: string,
		data: { heading: string; body: string },
	) => void;
};

export function SectionEditor(props: Props) {
	if (props.section.type === "worship-program") {
		return (
			<WorshipProgramEditor
				section={props.section as WorshipProgramSectionData}
				template={props.template}
				members={props.members}
				onUpdateDetails={props.onUpdateDetails}
				onUpdateFieldValue={props.onUpdateFieldValue}
				onUpdateAssignee={props.onUpdateAssignee}
			/>
		);
	}
	if (props.section.type === "announcements") {
		return (
			<AnnouncementsEditor
				section={props.section as AnnouncementsSectionData}
				onAdd={props.onAddAnnouncement}
				onRemove={props.onRemoveAnnouncement}
				onUpdate={props.onUpdateAnnouncement}
			/>
		);
	}
	if (props.section.type === "assignments") {
		return (
			<AssignmentsEditor
				section={props.section as AssignmentsSectionData}
				template={props.template}
				onUpdate={props.onUpdateAssignment}
			/>
		);
	}
	if (props.section.type === "weekly-verse") {
		return (
			<WeeklyVerseEditor
				section={props.section as WeeklyVerseSectionData}
				onUpdate={(data) => props.onUpdateWeeklyVerse(props.section.id, data)}
			/>
		);
	}
	if (props.section.type === "monthly-song") {
		return (
			<MonthlySongEditor
				section={props.section as MonthlySongSectionData}
				onUpdate={(data) => props.onUpdateMonthlySong(props.section.id, data)}
			/>
		);
	}
	if (props.section.type === "text-block") {
		return (
			<TextBlockEditor
				section={props.section as TextBlockSectionData}
				onUpdate={(data) => props.onUpdateTextBlock(props.section.id, data)}
			/>
		);
	}
	// Unknown section type: skip gracefully
	return null;
}
