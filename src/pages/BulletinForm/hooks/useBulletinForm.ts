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
import type { Announcement, WorshipItem } from "@/types/bulletin.ts";

export type Assignment = { role: string; person: string };

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
	const [worship, setWorship] = createSignal<WorshipItem[]>([]);
	const [announcements, setAnnouncements] = createSignal<Announcement[]>([]);
	const [assignments, setAssignments] = createSignal<Assignment[]>([]);
	const [submitting, setSubmitting] = createSignal(false);
	const [error, setError] = createSignal("");
	const [initialized, setInitialized] = createSignal(false);

	// Initialize new bulletin from template
	createEffect(() => {
		const items = template();
		if (!isEdit() && items && items.length > 0 && !initialized()) {
			setWorship(
				items.map((i) => {
					const item: WorshipItem = { type: i.type, label: i.label };
					if (i.fields && i.fields.length > 0) {
						item.fieldValues = {};
						for (const f of i.fields) {
							item.fieldValues[f.key] = "";
						}
					}
					return item;
				}),
			);
			setAnnouncements([{ content: "" }]);
			setAssignments([{ role: "", person: "" }]);
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
			setWorship(data.worship.length > 0 ? data.worship : []);
			setAnnouncements(
				data.announcements.length > 0 ? data.announcements : [{ content: "" }],
			);
			const entries = Object.entries(data.assignments);
			setAssignments(
				entries.length > 0
					? entries.map(([role, person]) => ({ role, person }))
					: [{ role: "", person: "" }],
			);
			setInitialized(true);
		}
	});

	function updateWorshipDetails(index: number, value: string) {
		setWorship((prev) =>
			prev.map((item, i) => (i === index ? { ...item, details: value } : item)),
		);
	}

	function updateWorshipFieldValue(
		index: number,
		fieldKey: string,
		value: string,
	) {
		setWorship((prev) =>
			prev.map((item, i) => {
				if (i !== index) return item;
				return {
					...item,
					fieldValues: { ...(item.fieldValues ?? {}), [fieldKey]: value },
				};
			}),
		);
	}

	function updateWorshipAssignee(index: number, value: string) {
		setWorship((prev) =>
			prev.map((item, i) =>
				i === index
					? { ...item, assigneeId: value ? Number(value) : null }
					: item,
			),
		);
	}

	function addAnnouncement() {
		setAnnouncements((prev) => [...prev, { content: "" }]);
	}

	function removeAnnouncement(index: number) {
		setAnnouncements((prev) => prev.filter((_, i) => i !== index));
	}

	function updateAnnouncement(index: number, value: string) {
		setAnnouncements((prev) =>
			prev.map((a, i) => (i === index ? { content: value } : a)),
		);
	}

	function addAssignment() {
		setAssignments((prev) => [...prev, { role: "", person: "" }]);
	}

	function removeAssignment(index: number) {
		setAssignments((prev) => prev.filter((_, i) => i !== index));
	}

	function updateAssignment(
		index: number,
		field: "role" | "person",
		value: string,
	) {
		setAssignments((prev) =>
			prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)),
		);
	}

	const hasContent = createMemo(
		() =>
			worship().some(
				(w) =>
					w.details?.trim() ||
					w.assigneeId != null ||
					(w.fieldValues && Object.values(w.fieldValues).some((v) => v.trim())),
			) ||
			announcements().some((a) => a.content.trim()) ||
			assignments().some((a) => a.role.trim() || a.person.trim()),
	);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		setError("");
		setSubmitting(true);

		const worshipData = worship();
		const announcementsData = announcements().filter(
			(a) => a.content.trim() !== "",
		);
		const assignmentsData: Record<string, string> = {};
		for (const a of assignments()) {
			if (a.role.trim() && a.person.trim()) {
				assignmentsData[a.role.trim()] = a.person.trim();
			}
		}

		const body = {
			serviceDate: serviceDate(),
			worship: worshipData,
			announcements: announcementsData,
			assignments: assignmentsData,
		};

		try {
			const result = await saveBulletin(params.id, body);
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
		worship,
		announcements,
		assignments,
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
		addAssignment,
		removeAssignment,
		updateAssignment,
		handleSubmit,
	};
}
