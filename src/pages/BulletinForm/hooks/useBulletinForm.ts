import { useNavigate, useParams, useSearchParams } from "@solidjs/router";
import {
	createEffect,
	createMemo,
	createResource,
	createSignal,
} from "solid-js";
import {
	fetchBulletin,
	fetchMembers,
	fetchTemplate,
	saveBulletin,
} from "@/api/bulletin.ts";
import type {
	AnnouncementsSectionData,
	AssignmentsSectionData,
	AttendanceSectionData,
	AttendanceSectionTemplate,
	Birthday,
	BirthdaysSectionData,
	FinancialSummarySectionData,
	FinancialSummarySectionTemplate,
	MonthlySongSectionData,
	ScriptureQuote,
	ScriptureQuotesSectionData,
	SectionData,
	ServiceMetaSectionData,
	ServiceMetaSectionTemplate,
	TextBlockSectionData,
	UpcomingEvent,
	UpcomingEventsSectionData,
	WeeklyPrayerSectionData,
	WeeklyVerseSectionData,
	WorshipProgramSectionData,
} from "@/types/bulletin.ts";

export function useBulletinForm() {
	const params = useParams<{ id?: string }>();
	const [searchParams] = useSearchParams<{ date?: string }>();
	const navigate = useNavigate();
	const isEdit = () => !!params.id;

	const [existing] = createResource(
		() => params.id,
		(id) => fetchBulletin(id),
	);

	const [template] = createResource(fetchTemplate);
	const [members] = createResource(fetchMembers);

	const [serviceDate, setServiceDate] = createSignal("");
	const [sections, setSections] = createSignal<SectionData[]>([]);
	const [submitting, setSubmitting] = createSignal(false);
	const [error, setError] = createSignal("");
	const [initialized, setInitialized] = createSignal(false);

	// Initialize new bulletin from template
	createEffect(() => {
		const tmpl = template();
		if (!isEdit() && tmpl && tmpl.length > 0 && !initialized()) {
			const built: SectionData[] = tmpl
				.filter((s) => s.visible !== false)
				.map((s): SectionData => {
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
							data: { title: "", keywords: [] },
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
						return {
							id: s.id,
							type: "weekly-prayer",
							label: s.label,
							data: {},
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
							data: [],
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
					return { id: s.id, type: "assignments", label: s.label, data: {} };
				});
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
		if (isEdit() && data && !initialized()) {
			setServiceDate(data.serviceDate);
			const validSections = data.sections.filter(
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
			);
			setSections(validSections);
			setInitialized(true);
		}
	});

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
			assigneeId: number | null;
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

	function updateWorshipAssignee(
		sectionId: string,
		index: number,
		value: string,
	) {
		updateWorshipItem(sectionId, index, {
			assigneeId: value ? Number(value) : null,
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
		data: { title: string; keywords: string[] },
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

	function updateWeeklyPrayer(sectionId: string, data: Record<string, string>) {
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
						w.assigneeId != null ||
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
				return ms.data.title.trim() !== "" || ms.data.keywords.length > 0;
			}
			if (s.type === "text-block") {
				const tb = s as TextBlockSectionData;
				return tb.data.heading.trim() !== "" || tb.data.body.trim() !== "";
			}
			if (s.type === "weekly-prayer") {
				const wp = s as WeeklyPrayerSectionData;
				return Object.values(wp.data).some((v) => v.trim() !== "");
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

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		setError("");
		setSubmitting(true);

		try {
			const result = await saveBulletin(params.id, {
				serviceDate: serviceDate(),
				sections: sections(),
			});
			if (!result.ok) {
				setError(result.error ?? "Failed to save bulletin");
				return;
			}
			navigate(`/bulletin/${result.id}`);
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
		initialized,
		hasContent,
		updateWorshipDetails,
		updateWorshipFieldValue,
		updateWorshipAssignee,
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
		handleSubmit,
	};
}
