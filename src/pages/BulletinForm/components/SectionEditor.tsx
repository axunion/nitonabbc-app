import type {
	AnnouncementsSectionData,
	AssignmentsSectionData,
	Member,
	SectionData,
	SectionTemplate,
	WorshipProgramSectionData,
} from "@/types/bulletin.ts";
import { AnnouncementsEditor } from "./AnnouncementsEditor.tsx";
import { AssignmentsEditor } from "./AssignmentsEditor.tsx";
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
	// Unknown section type: skip gracefully
	return null;
}
