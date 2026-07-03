import { useParams, useSearchParams } from "@solidjs/router";
import {
  createEffect,
  createMemo,
  createResource,
  createSignal,
  on,
} from "solid-js";
import {
  fetchBulletin,
  fetchBulletins,
  fetchMembers,
  fetchTemplate,
  saveBulletin,
} from "@/api/bulletin.ts";
import {
  type AnnouncementsSectionData,
  type AnySection,
  type AssignmentsSectionData,
  type AttendanceSectionData,
  type AttendanceSectionTemplate,
  type Birthday,
  type BirthdaysSectionData,
  type BulletinDetail,
  DEFAULT_WEEKLY_PRAYER_DAYS,
  type FinancialSummarySectionData,
  type FinancialSummarySectionTemplate,
  type MonthlySongSectionData,
  type ScriptureQuote,
  type ScriptureQuotesSectionData,
  type SectionData,
  type ServiceMetaSectionData,
  type ServiceMetaSectionTemplate,
  type TextBlockSectionData,
  type UpcomingEvent,
  type UpcomingEventsSectionData,
  type WeeklyPrayerSectionData,
  type WeeklyPrayerSectionTemplate,
  type WeeklyVerseSectionData,
  type WorshipProgramSectionData,
} from "@/types/bulletin.ts";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Filters AnySection[] down to known SectionData variants and migrates
// legacy monthly-song/weekly-prayer data shapes to the current format.
function normalizeSections(sections: AnySection[]): SectionData[] {
  return sections
    .filter(
      (s): s is SectionData =>
        s.type === "worship-program" ||
        s.type === "announcements" ||
        s.type === "assignments" ||
        s.type === "weekly-verse" ||
        s.type === "monthly-song" ||
        s.type === "text-block" ||
        s.type === "weekly-prayer" ||
        s.type === "upcoming-events" ||
        s.type === "birthdays" ||
        s.type === "scripture-quotes" ||
        s.type === "attendance" ||
        s.type === "service-meta" ||
        s.type === "financial-summary",
    )
    .map((s): SectionData => {
      // Normalize monthly-song: migrate legacy { keywords } → { lyrics }
      if (s.type === "monthly-song") {
        const ms = s as MonthlySongSectionData;
        const raw = ms.data as { title: string; lyrics?: string };
        return {
          ...ms,
          data: { title: raw.title, lyrics: raw.lyrics ?? "" },
        };
      }
      // Normalize weekly-prayer: migrate legacy string values → string[]
      if (s.type === "weekly-prayer") {
        const wp = s as WeeklyPrayerSectionData;
        const normalized: Record<string, string[]> = {};
        for (const [key, val] of Object.entries(
          wp.data as unknown as Record<string, unknown>,
        )) {
          normalized[key] = Array.isArray(val)
            ? (val as string[])
            : typeof val === "string" && val
              ? [val]
              : [];
        }
        return { ...wp, data: normalized };
      }
      return s;
    });
}

// Returns the previous bulletin's data for a section, if a section with the
// same id and type exists in it (used to carry forward repetitive sections
// like assignments/monthly-song/birthdays/weekly-prayer between weeks).
// Mirrors copyForward() in server/routes/bulletin.ts.
function copyForward<T>(
  previousById: Map<string, SectionData>,
  id: string,
  type: SectionData["type"],
): T | undefined {
  const prev = previousById.get(id);
  return prev?.type === type ? (prev.data as T) : undefined;
}

export function useBulletinForm() {
  const params = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams<{ date?: string }>();
  const isEdit = () => !!params.id;

  const [existing, { refetch: refetchExisting }] = createResource(
    () => params.id,
    (id) => fetchBulletin(id),
  );

  const [template] = createResource(fetchTemplate);
  const [members] = createResource(fetchMembers);

  // Previous bulletin's sections (for copy-forward), keyed on the target
  // date of the new bulletin. Skipped when editing or when no date is set.
  const [previousSections] = createResource(
    () =>
      !isEdit() && searchParams.date && DATE_RE.test(searchParams.date)
        ? searchParams.date
        : undefined,
    async (date): Promise<SectionData[] | undefined> => {
      const { bulletins: list } = await fetchBulletins();
      const prev = list.find((b) => b.serviceDate < date);
      if (!prev) return undefined;
      const detail = await fetchBulletin(String(prev.id));
      return normalizeSections(detail.sections);
    },
  );

  const [serviceDate, setServiceDate] = createSignal("");
  const [sections, setSections] = createSignal<SectionData[]>([]);
  const [submitting, setSubmitting] = createSignal(false);
  const [error, setError] = createSignal("");
  const [initialized, setInitialized] = createSignal(false);

  // Reset when navigating between different bulletins (or a different target
  // date for a new one) so init effects re-run instead of keeping stale data
  createEffect(
    on(
      () => [params.id, searchParams.date] as const,
      () => setInitialized(false),
    ),
  );

  function applyExisting(data: BulletinDetail) {
    setServiceDate(data.serviceDate);
    setSections(normalizeSections(data.sections));
  }

  // Initialize new bulletin from template
  createEffect(() => {
    const tmpl = template();
    const waitingForPrevious = !!searchParams.date && previousSections.loading;
    if (!isEdit() && tmpl && !initialized() && !waitingForPrevious) {
      // Reading previousSections() while it's in an errored state re-throws
      // the fetch error, so check .error first and degrade to "no previous
      // bulletin found" instead of crashing new-bulletin initialization.
      const previousList = previousSections.error
        ? undefined
        : previousSections();
      const previousById = new Map(previousList?.map((s) => [s.id, s]));
      const built: SectionData[] = tmpl
        .filter((s) => s.visible !== false)
        .map((s): SectionData | null => {
          if (s.type === "worship-program") {
            return {
              id: s.id,
              type: "worship-program",
              label: s.label,
              data: s.config.items.map((i) => {
                const item = { type: i.type, label: i.label };
                if (i.fields && i.fields.length > 0) {
                  return {
                    ...item,
                    fieldValues: Object.fromEntries(
                      i.fields.map((f) => [f.key, ""]),
                    ),
                  };
                }
                return item;
              }),
            };
          }
          if (s.type === "announcements") {
            return {
              id: s.id,
              type: "announcements",
              label: s.label,
              data: [],
            };
          }
          if (s.type === "weekly-verse") {
            return {
              id: s.id,
              type: "weekly-verse",
              label: s.label,
              data: { reference: "", text: "" },
            };
          }
          if (s.type === "monthly-song") {
            return {
              id: s.id,
              type: "monthly-song",
              label: s.label,
              data: copyForward<MonthlySongSectionData["data"]>(
                previousById,
                s.id,
                "monthly-song",
              ) ?? { title: "", lyrics: "" },
            };
          }
          if (s.type === "text-block") {
            return {
              id: s.id,
              type: "text-block",
              label: s.label,
              data: { heading: "", body: "" },
            };
          }
          if (s.type === "weekly-prayer") {
            const days =
              (s as WeeklyPrayerSectionTemplate).config.days.length > 0
                ? (s as WeeklyPrayerSectionTemplate).config.days
                : DEFAULT_WEEKLY_PRAYER_DAYS;
            const defaultData: Record<string, string[]> = {};
            for (const d of days) {
              defaultData[d.key] = [...d.defaults];
            }
            return {
              id: s.id,
              type: "weekly-prayer",
              label: s.label,
              data:
                copyForward<WeeklyPrayerSectionData["data"]>(
                  previousById,
                  s.id,
                  "weekly-prayer",
                ) ?? defaultData,
            };
          }
          if (s.type === "upcoming-events") {
            return {
              id: s.id,
              type: "upcoming-events",
              label: s.label,
              data: [],
            };
          }
          if (s.type === "birthdays") {
            return {
              id: s.id,
              type: "birthdays",
              label: s.label,
              data:
                copyForward<BirthdaysSectionData["data"]>(
                  previousById,
                  s.id,
                  "birthdays",
                ) ?? [],
            };
          }
          if (s.type === "scripture-quotes") {
            return {
              id: s.id,
              type: "scripture-quotes",
              label: s.label,
              data: [],
            };
          }
          if (s.type === "attendance") {
            const data: Record<string, { adults: string }> = {};
            for (const m of (s as AttendanceSectionTemplate).config.meetings) {
              data[m.key] = { adults: "" };
            }
            return {
              id: s.id,
              type: "attendance",
              label: s.label,
              data,
            };
          }
          if (s.type === "service-meta") {
            const fieldValues: Record<string, string> = {};
            for (const def of (s as ServiceMetaSectionTemplate).config
              .fieldDefs) {
              fieldValues[def.key] = "";
            }
            return {
              id: s.id,
              type: "service-meta",
              label: s.label,
              data: { fieldValues },
            };
          }
          if (s.type === "financial-summary") {
            const data: Record<string, { amount: string }> = {};
            for (const item of (s as FinancialSummarySectionTemplate).config
              .items) {
              data[item.key] = { amount: "" };
            }
            return {
              id: s.id,
              type: "financial-summary",
              label: s.label,
              data,
            };
          }
          if (s.type === "assignments") {
            return {
              id: s.id,
              type: "assignments",
              label: s.label,
              data:
                copyForward<AssignmentsSectionData["data"]>(
                  previousById,
                  s.id,
                  "assignments",
                ) ?? {},
            };
          }
          return null;
        })
        .filter((s): s is SectionData => s !== null);
      setSections(built);
      if (searchParams.date) {
        setServiceDate(searchParams.date);
      }
      setInitialized(true);
    }
  });

  // Populate form when editing
  createEffect(() => {
    const data = existing();
    if (isEdit() && !initialized() && !existing.loading) {
      if (data) {
        applyExisting(data);
      }
      // Mark initialized even on 404/error to stop the loading spinner
      setInitialized(true);
    }
  });

  function resetToExisting() {
    const data = existing();
    if (data) applyExisting(data);
  }

  function updateSection(
    sectionId: string,
    updater: (s: SectionData) => SectionData,
  ) {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? updater(s) : s)),
    );
  }

  function updateWorshipItem(
    sectionId: string,
    index: number,
    patch: Partial<{
      details: string;
      fieldValues: Record<string, string>;
    }>,
  ) {
    updateSection(sectionId, (s) => {
      if (s.type !== "worship-program") return s;
      const data = s.data.map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      );
      return { ...s, data };
    });
  }

  function updateWorshipDetails(
    sectionId: string,
    index: number,
    value: string,
  ) {
    updateWorshipItem(sectionId, index, { details: value });
  }

  function updateWorshipFieldValue(
    sectionId: string,
    index: number,
    fieldKey: string,
    value: string,
  ) {
    updateSection(sectionId, (s) => {
      if (s.type !== "worship-program") return s;
      const data = s.data.map((item, i) => {
        if (i !== index) return item;
        return {
          ...item,
          fieldValues: { ...(item.fieldValues ?? {}), [fieldKey]: value },
        };
      });
      return { ...s, data };
    });
  }

  function addAnnouncement(sectionId: string) {
    updateSection(sectionId, (s) => {
      if (s.type !== "announcements") return s;
      return { ...s, data: [...s.data, { content: "" }] };
    });
  }

  function removeAnnouncement(sectionId: string, index: number) {
    updateSection(sectionId, (s) => {
      if (s.type !== "announcements") return s;
      return { ...s, data: s.data.filter((_, i) => i !== index) };
    });
  }

  function updateAnnouncement(sectionId: string, index: number, value: string) {
    updateSection(sectionId, (s) => {
      if (s.type !== "announcements") return s;
      return {
        ...s,
        data: s.data.map((a, i) =>
          i === index ? { ...a, content: value } : a,
        ),
      };
    });
  }

  function updateAssignment(sectionId: string, role: string, value: string) {
    updateSection(sectionId, (s) => {
      if (s.type !== "assignments") return s;
      return { ...s, data: { ...s.data, [role]: value } };
    });
  }

  function updateWeeklyVerse(
    sectionId: string,
    data: { reference: string; text: string },
  ) {
    updateSection(sectionId, (s) => {
      if (s.type !== "weekly-verse") return s;
      return { ...s, data };
    });
  }

  function updateMonthlySong(
    sectionId: string,
    data: { title: string; lyrics: string },
  ) {
    updateSection(sectionId, (s) => {
      if (s.type !== "monthly-song") return s;
      return { ...s, data };
    });
  }

  function updateTextBlock(
    sectionId: string,
    data: { heading: string; body: string },
  ) {
    updateSection(sectionId, (s) => {
      if (s.type !== "text-block") return s;
      return { ...s, data };
    });
  }

  function updateWeeklyPrayer(
    sectionId: string,
    data: Record<string, string[]>,
  ) {
    updateSection(sectionId, (s) => {
      if (s.type !== "weekly-prayer") return s;
      return { ...s, data };
    });
  }

  function addUpcomingEvent(sectionId: string) {
    updateSection(sectionId, (s) => {
      if (s.type !== "upcoming-events") return s;
      return { ...s, data: [...s.data, { date: "", description: "" }] };
    });
  }

  function removeUpcomingEvent(sectionId: string, index: number) {
    updateSection(sectionId, (s) => {
      if (s.type !== "upcoming-events") return s;
      return { ...s, data: s.data.filter((_, i) => i !== index) };
    });
  }

  function updateUpcomingEvent(
    sectionId: string,
    index: number,
    value: UpcomingEvent,
  ) {
    updateSection(sectionId, (s) => {
      if (s.type !== "upcoming-events") return s;
      return {
        ...s,
        data: s.data.map((e, i) => (i === index ? value : e)),
      };
    });
  }

  function addBirthday(sectionId: string) {
    updateSection(sectionId, (s) => {
      if (s.type !== "birthdays") return s;
      return { ...s, data: [...s.data, { day: "", name: "" }] };
    });
  }

  function removeBirthday(sectionId: string, index: number) {
    updateSection(sectionId, (s) => {
      if (s.type !== "birthdays") return s;
      return { ...s, data: s.data.filter((_, i) => i !== index) };
    });
  }

  function updateBirthday(sectionId: string, index: number, value: Birthday) {
    updateSection(sectionId, (s) => {
      if (s.type !== "birthdays") return s;
      return {
        ...s,
        data: s.data.map((b, i) => (i === index ? value : b)),
      };
    });
  }

  function addScriptureQuote(sectionId: string) {
    updateSection(sectionId, (s) => {
      if (s.type !== "scripture-quotes") return s;
      return { ...s, data: [...s.data, { reference: "", text: "" }] };
    });
  }

  function removeScriptureQuote(sectionId: string, index: number) {
    updateSection(sectionId, (s) => {
      if (s.type !== "scripture-quotes") return s;
      return { ...s, data: s.data.filter((_, i) => i !== index) };
    });
  }

  function updateScriptureQuote(
    sectionId: string,
    index: number,
    value: ScriptureQuote,
  ) {
    updateSection(sectionId, (s) => {
      if (s.type !== "scripture-quotes") return s;
      return {
        ...s,
        data: s.data.map((q, i) => (i === index ? value : q)),
      };
    });
  }

  function updateAttendance(
    sectionId: string,
    key: string,
    field: "adults" | "children",
    value: string,
  ) {
    updateSection(sectionId, (s) => {
      if (s.type !== "attendance") return s;
      const prev = s.data[key] ?? { adults: "" };
      return {
        ...s,
        data: { ...s.data, [key]: { ...prev, [field]: value } },
      };
    });
  }

  function updateServiceMeta(sectionId: string, key: string, value: string) {
    updateSection(sectionId, (s) => {
      if (s.type !== "service-meta") return s;
      return {
        ...s,
        data: { fieldValues: { ...s.data.fieldValues, [key]: value } },
      };
    });
  }

  function updateFinancialSummary(
    sectionId: string,
    key: string,
    field: "amount" | "note",
    value: string,
  ) {
    updateSection(sectionId, (s) => {
      if (s.type !== "financial-summary") return s;
      const prev = s.data[key] ?? { amount: "" };
      return {
        ...s,
        data: { ...s.data, [key]: { ...prev, [field]: value } },
      };
    });
  }

  const hasContent = createMemo(() => {
    return sections().some((s) => {
      if (s.type === "worship-program") {
        const ws = s as WorshipProgramSectionData;
        return ws.data.some(
          (w) =>
            w.details?.trim() ||
            (w.fieldValues &&
              Object.values(w.fieldValues).some((v) => v.trim())),
        );
      }
      if (s.type === "announcements") {
        return (s as AnnouncementsSectionData).data.some((a) =>
          a.content.trim(),
        );
      }
      if (s.type === "assignments") {
        return Object.values((s as AssignmentsSectionData).data).some((v) =>
          v.trim(),
        );
      }
      if (s.type === "weekly-verse") {
        const wv = s as WeeklyVerseSectionData;
        return wv.data.reference.trim() !== "" || wv.data.text.trim() !== "";
      }
      if (s.type === "monthly-song") {
        const ms = s as MonthlySongSectionData;
        return ms.data.title.trim() !== "" || ms.data.lyrics.trim() !== "";
      }
      if (s.type === "text-block") {
        const tb = s as TextBlockSectionData;
        return tb.data.heading.trim() !== "" || tb.data.body.trim() !== "";
      }
      if (s.type === "weekly-prayer") {
        const wp = s as WeeklyPrayerSectionData;
        return Object.values(wp.data).some((v) =>
          v.some((t) => t.trim() !== ""),
        );
      }
      if (s.type === "upcoming-events") {
        const ue = s as UpcomingEventsSectionData;
        return ue.data.some(
          (e) => e.date.trim() !== "" || e.description.trim() !== "",
        );
      }
      if (s.type === "birthdays") {
        const bd = s as BirthdaysSectionData;
        return bd.data.some((b) => b.day.trim() !== "" || b.name.trim() !== "");
      }
      if (s.type === "scripture-quotes") {
        const sq = s as ScriptureQuotesSectionData;
        return sq.data.some(
          (q) => q.reference.trim() !== "" || q.text.trim() !== "",
        );
      }
      if (s.type === "attendance") {
        const att = s as AttendanceSectionData;
        return Object.values(att.data).some(
          (e) => e.adults.trim() !== "" || (e.children ?? "").trim() !== "",
        );
      }
      if (s.type === "service-meta") {
        const sm = s as ServiceMetaSectionData;
        return Object.values(sm.data.fieldValues).some((v) => v.trim() !== "");
      }
      if (s.type === "financial-summary") {
        const fs = s as FinancialSummarySectionData;
        return Object.values(fs.data).some((e) => e.amount.trim() !== "");
      }
      return false;
    });
  });

  const totalItems = () => existing()?.totalItems ?? 0;
  const filledItems = () => existing()?.filledItems ?? 0;

  async function save(): Promise<{ ok: boolean; id?: number }> {
    setError("");
    setSubmitting(true);
    try {
      const result = await saveBulletin(params.id, {
        serviceDate: serviceDate(),
        sections: sections(),
      });
      if (!result.ok) {
        setError(result.error ?? "Failed to save bulletin");
        return { ok: false };
      }
      return { ok: true, id: result.id };
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save bulletin");
      return { ok: false };
    } finally {
      setSubmitting(false);
    }
  }

  return {
    template,
    members,
    serviceDate,
    setServiceDate,
    sections,
    submitting,
    error,
    clearError: () => setError(""),
    initialized,
    hasContent,
    totalItems,
    filledItems,
    refetchExisting,
    resetToExisting,
    updateWorshipDetails,
    updateWorshipFieldValue,
    addAnnouncement,
    removeAnnouncement,
    updateAnnouncement,
    updateAssignment,
    updateWeeklyVerse,
    updateMonthlySong,
    updateTextBlock,
    updateWeeklyPrayer,
    addUpcomingEvent,
    removeUpcomingEvent,
    updateUpcomingEvent,
    addBirthday,
    removeBirthday,
    updateBirthday,
    addScriptureQuote,
    removeScriptureQuote,
    updateScriptureQuote,
    updateAttendance,
    updateServiceMeta,
    updateFinancialSummary,
    save,
  };
}
