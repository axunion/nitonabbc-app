import { useParams } from "@solidjs/router";
import { createEffect, createResource, createSignal, on } from "solid-js";
import {
  fetchBulletin,
  fetchMembers,
  fetchTemplate,
  updateBulletin,
} from "@/api/bulletin.ts";
import type {
  AnySection,
  Birthday,
  BulletinDetail,
  MonthlySongSectionData,
  ScriptureQuote,
  SectionData,
  UpcomingEvent,
  WeeklyPrayerSectionData,
} from "@/types/bulletin.ts";

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

export function useBulletinForm() {
  const params = useParams<{ id: string }>();

  const [existing, { refetch: refetchExisting }] = createResource(
    () => params.id,
    (id) => fetchBulletin(id),
  );

  // Reading an errored resource re-throws, so expose it as "no data" instead
  const loaded = () => (existing.error ? undefined : existing());

  const [template] = createResource(fetchTemplate);
  const [members] = createResource(fetchMembers);

  const serviceDate = () => loaded()?.serviceDate ?? "";
  const [sections, setSections] = createSignal<SectionData[]>([]);
  const [submitting, setSubmitting] = createSignal(false);
  const [initialized, setInitialized] = createSignal(false);

  // Reset when navigating between bulletins so the init effect re-runs
  // instead of keeping stale data
  createEffect(
    on(
      () => params.id,
      () => setInitialized(false),
    ),
  );

  function applyExisting(data: BulletinDetail) {
    setSections(normalizeSections(data.sections));
  }

  createEffect(() => {
    const data = loaded();
    if (!initialized() && !existing.loading) {
      if (data) {
        applyExisting(data);
      }
      // Mark initialized even on 404/error to stop the loading spinner
      setInitialized(true);
    }
  });

  /** Re-fetches the bulletin and replaces local state with the server copy. */
  async function reload() {
    const data = await refetchExisting();
    if (data) applyExisting(data);
  }

  function resetToExisting() {
    const data = loaded();
    if (data) applyExisting(data);
  }

  /** True when the sections differ from what was last loaded from the server. Computed on demand by the leave guards. */
  function isDirty() {
    const data = loaded();
    if (!data) return false;
    return (
      JSON.stringify(sections()) !==
      JSON.stringify(normalizeSections(data.sections))
    );
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

  const totalItems = () => loaded()?.totalItems ?? 0;
  const filledItems = () => loaded()?.filledItems ?? 0;

  async function save(): Promise<{ ok: boolean }> {
    setSubmitting(true);
    const result = await updateBulletin(params.id, { sections: sections() });
    setSubmitting(false);
    return { ok: result.ok };
  }

  return {
    template,
    members,
    serviceDate,
    sections,
    submitting,
    initialized,
    isDirty,
    totalItems,
    filledItems,
    reload,
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
