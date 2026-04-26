import type {
	AnnouncementsSectionData,
	AssignmentsSectionData,
	AttendanceSectionData,
	Birthday,
	BirthdaysSectionData,
	FinancialSummarySectionData,
	Member,
	MonthlySongSectionData,
	ScriptureQuote,
	ScriptureQuotesSectionData,
	SectionData,
	SectionTemplate,
	ServiceMetaSectionData,
	TextBlockSectionData,
	UpcomingEvent,
	UpcomingEventsSectionData,
	WeeklyPrayerSectionData,
	WeeklyVerseSectionData,
	WorshipProgramSectionData,
} from "@/types/bulletin.ts";
import { AnnouncementsEditor } from "./AnnouncementsEditor.tsx";
import { AssignmentsEditor } from "./AssignmentsEditor.tsx";
import { AttendanceEditor } from "./AttendanceEditor.tsx";
import { BirthdaysEditor } from "./BirthdaysEditor.tsx";
import { FinancialSummaryEditor } from "./FinancialSummaryEditor.tsx";
import { MonthlySongEditor } from "./MonthlySongEditor.tsx";
import { ScriptureQuotesEditor } from "./ScriptureQuotesEditor.tsx";
import { ServiceMetaEditor } from "./ServiceMetaEditor.tsx";
import { TextBlockEditor } from "./TextBlockEditor.tsx";
import { UpcomingEventsEditor } from "./UpcomingEventsEditor.tsx";
import { WeeklyPrayerEditor } from "./WeeklyPrayerEditor.tsx";
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
	onUpdateWeeklyPrayer: (
		sectionId: string,
		data: Record<string, string>,
	) => void;
	onAddUpcomingEvent: (sectionId: string) => void;
	onRemoveUpcomingEvent: (sectionId: string, index: number) => void;
	onUpdateUpcomingEvent: (
		sectionId: string,
		index: number,
		value: UpcomingEvent,
	) => void;
	onAddBirthday: (sectionId: string) => void;
	onRemoveBirthday: (sectionId: string, index: number) => void;
	onUpdateBirthday: (sectionId: string, index: number, value: Birthday) => void;
	onAddScriptureQuote: (sectionId: string) => void;
	onRemoveScriptureQuote: (sectionId: string, index: number) => void;
	onUpdateScriptureQuote: (
		sectionId: string,
		index: number,
		value: ScriptureQuote,
	) => void;
	onUpdateAttendance: (
		sectionId: string,
		key: string,
		field: "adults" | "children",
		value: string,
	) => void;
	onUpdateServiceMeta: (sectionId: string, key: string, value: string) => void;
	onUpdateFinancialSummary: (
		sectionId: string,
		key: string,
		field: "amount" | "note",
		value: string,
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
	if (props.section.type === "weekly-prayer") {
		return (
			<WeeklyPrayerEditor
				section={props.section as WeeklyPrayerSectionData}
				onUpdate={(data) => props.onUpdateWeeklyPrayer(props.section.id, data)}
			/>
		);
	}
	if (props.section.type === "upcoming-events") {
		return (
			<UpcomingEventsEditor
				section={props.section as UpcomingEventsSectionData}
				onAdd={props.onAddUpcomingEvent}
				onRemove={props.onRemoveUpcomingEvent}
				onUpdate={props.onUpdateUpcomingEvent}
			/>
		);
	}
	if (props.section.type === "birthdays") {
		return (
			<BirthdaysEditor
				section={props.section as BirthdaysSectionData}
				onAdd={props.onAddBirthday}
				onRemove={props.onRemoveBirthday}
				onUpdate={props.onUpdateBirthday}
			/>
		);
	}
	if (props.section.type === "scripture-quotes") {
		return (
			<ScriptureQuotesEditor
				section={props.section as ScriptureQuotesSectionData}
				onAdd={props.onAddScriptureQuote}
				onRemove={props.onRemoveScriptureQuote}
				onUpdate={props.onUpdateScriptureQuote}
			/>
		);
	}
	if (props.section.type === "attendance") {
		return (
			<AttendanceEditor
				section={props.section as AttendanceSectionData}
				template={props.template}
				onUpdate={props.onUpdateAttendance}
			/>
		);
	}
	if (props.section.type === "service-meta") {
		return (
			<ServiceMetaEditor
				section={props.section as ServiceMetaSectionData}
				template={props.template}
				members={props.members}
				onUpdate={props.onUpdateServiceMeta}
			/>
		);
	}
	if (props.section.type === "financial-summary") {
		return (
			<FinancialSummaryEditor
				section={props.section as FinancialSummarySectionData}
				template={props.template}
				onUpdate={props.onUpdateFinancialSummary}
			/>
		);
	}
	// Unknown section type: skip gracefully
	return null;
}
