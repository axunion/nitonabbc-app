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
	MonthlySongSectionData,
	SectionData,
	TextBlockSectionData,
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
					s.type === "text-block",
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
		handleSubmit,
	};
}
