import type {
  AnnouncementsSectionData,
  AnySection,
  AssignmentsSectionData,
  AttendanceSectionData,
  BirthdaysSectionData,
  FinancialSummarySectionData,
  Member,
  MonthlySongSectionData,
  ScriptureQuotesSectionData,
  SectionTemplate,
  ServiceMetaSectionData,
  TextBlockSectionData,
  UpcomingEventsSectionData,
  WeeklyPrayerSectionData,
  WeeklyVerseSectionData,
  WorshipProgramSectionData,
} from "@/types/bulletin.ts";
import { AnnouncementsView } from "./AnnouncementsView.tsx";
import { AssignmentsView } from "./AssignmentsView.tsx";
import { AttendanceView } from "./AttendanceView.tsx";
import { BirthdaysView } from "./BirthdaysView.tsx";
import { FinancialSummaryView } from "./FinancialSummaryView.tsx";
import { MonthlySongView } from "./MonthlySongView.tsx";
import { ScriptureQuotesView } from "./ScriptureQuotesView.tsx";
import { ServiceMetaView } from "./ServiceMetaView.tsx";
import { TextBlockView } from "./TextBlockView.tsx";
import { UpcomingEventsView } from "./UpcomingEventsView.tsx";
import { WeeklyPrayerView } from "./WeeklyPrayerView.tsx";
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
      <AssignmentsView
        section={props.section as AssignmentsSectionData}
        members={props.members}
      />
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
  if (props.section.type === "weekly-prayer") {
    const section = props.section as WeeklyPrayerSectionData;
    const tmpl = props.template.find(
      (t) => t.id === section.id && t.type === "weekly-prayer",
    );
    const templateDays =
      tmpl?.type === "weekly-prayer" && tmpl.config.days.length > 0
        ? tmpl.config.days
        : undefined;
    return <WeeklyPrayerView section={section} templateDays={templateDays} />;
  }
  if (props.section.type === "upcoming-events") {
    return (
      <UpcomingEventsView
        section={props.section as UpcomingEventsSectionData}
      />
    );
  }
  if (props.section.type === "birthdays") {
    return <BirthdaysView section={props.section as BirthdaysSectionData} />;
  }
  if (props.section.type === "scripture-quotes") {
    return (
      <ScriptureQuotesView
        section={props.section as ScriptureQuotesSectionData}
      />
    );
  }
  if (props.section.type === "attendance") {
    return (
      <AttendanceView
        section={props.section as AttendanceSectionData}
        template={props.template}
      />
    );
  }
  if (props.section.type === "service-meta") {
    return (
      <ServiceMetaView
        section={props.section as ServiceMetaSectionData}
        template={props.template}
      />
    );
  }
  if (props.section.type === "financial-summary") {
    return (
      <FinancialSummaryView
        section={props.section as FinancialSummarySectionData}
        template={props.template}
      />
    );
  }
  // Unknown section type: skip gracefully
  return null;
}
