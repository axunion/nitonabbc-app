import { useNavigate, useParams } from "@solidjs/router";
import { Minus, Plus } from "lucide-solid";
import { createResource, createSignal, For, onMount, Show } from "solid-js";
import type {
	Announcement,
	BulletinDetail,
	WorshipItem,
} from "@/types/bulletin.ts";
import styles from "./BulletinForm.module.css";

const DEFAULT_WORSHIP: WorshipItem[] = [
	{ type: "prelude", label: "前奏" },
	{ type: "hymn", label: "賛美歌" },
	{ type: "prayer", label: "祈り" },
	{ type: "reading", label: "聖書朗読" },
	{ type: "sermon", label: "説教" },
	{ type: "offering", label: "献金" },
	{ type: "hymn2", label: "賛美歌" },
	{ type: "doxology", label: "頌栄" },
	{ type: "benediction", label: "祝祷" },
];

async function fetchBulletin(id: string): Promise<BulletinDetail> {
	const res = await fetch(`/api/bulletin/${id}`);
	if (!res.ok) throw new Error("Failed to fetch bulletin");
	return res.json() as Promise<BulletinDetail>;
}

export function BulletinForm() {
	const params = useParams<{ id?: string }>();
	const navigate = useNavigate();
	const isEdit = () => !!params.id;

	const [existing] = createResource(
		() => params.id,
		(id) => fetchBulletin(id),
	);

	const [serviceDate, setServiceDate] = createSignal("");
	const [worship, setWorship] = createSignal<WorshipItem[]>([]);
	const [announcements, setAnnouncements] = createSignal<Announcement[]>([]);
	const [assignments, setAssignments] = createSignal<
		{ role: string; person: string }[]
	>([]);
	const [submitting, setSubmitting] = createSignal(false);
	const [error, setError] = createSignal("");
	const [initialized, setInitialized] = createSignal(false);

	onMount(() => {
		if (!isEdit()) {
			setWorship(DEFAULT_WORSHIP.map((w) => ({ ...w })));
			setAnnouncements([{ content: "" }]);
			setAssignments([{ role: "", person: "" }]);
			setInitialized(true);
		}
	});

	// Populate form when editing
	const populateForm = () => {
		const data = existing();
		if (data && !initialized()) {
			setServiceDate(data.serviceDate);
			setWorship(data.worship.length > 0 ? data.worship : DEFAULT_WORSHIP);
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
		return null;
	};

	function updateWorship(index: number, field: "details", value: string) {
		setWorship((prev) =>
			prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
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

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		setError("");
		setSubmitting(true);

		const worshipData = worship().map((w) =>
			w.details ? w : { type: w.type, label: w.label },
		);
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
			const url = isEdit() ? `/api/bulletin/${params.id}` : "/api/bulletin";
			const method = isEdit() ? "PUT" : "POST";

			const res = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});

			if (!res.ok) {
				const data = (await res.json()) as { error?: string };
				setError(data.error ?? "Failed to save bulletin");
				return;
			}

			const result = (await res.json()) as { id: number };
			navigate(`/bulletin/${result.id}`);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div class={styles.container}>
			<Show when={isEdit()}>{populateForm()}</Show>

			<Show
				when={!isEdit() || initialized()}
				fallback={<p class={styles.loading}>読み込み中...</p>}
			>
				<h1 class={styles.title}>{isEdit() ? "週報を編集" : "新しい週報"}</h1>

				<Show when={error()}>
					<p class={styles.error}>{error()}</p>
				</Show>

				<form onSubmit={handleSubmit} class={styles.form}>
					<div class={styles.formGroup}>
						<label for="service-date" class={styles.label}>
							礼拝日
						</label>
						<input
							id="service-date"
							type="date"
							class={styles.input}
							value={serviceDate()}
							onInput={(e) => setServiceDate(e.currentTarget.value)}
							required
						/>
					</div>

					<fieldset class={styles.fieldset}>
						<legend class={styles.legend}>礼拝プログラム</legend>
						<For each={worship()}>
							{(item, index) => (
								<div class={styles.worshipRow}>
									<span class={styles.worshipLabel}>{item.label}</span>
									<input
										type="text"
										class={styles.input}
										placeholder="詳細（賛美歌番号、聖書箇所など）"
										value={item.details ?? ""}
										onInput={(e) =>
											updateWorship(index(), "details", e.currentTarget.value)
										}
									/>
								</div>
							)}
						</For>
					</fieldset>

					<fieldset class={styles.fieldset}>
						<legend class={styles.legend}>
							お知らせ
							<button
								type="button"
								class={styles.iconButton}
								onClick={addAnnouncement}
							>
								<Plus size={16} stroke-width={1.5} />
							</button>
						</legend>
						<For each={announcements()}>
							{(a, index) => (
								<div class={styles.dynamicRow}>
									<textarea
										class={styles.textarea}
										rows={2}
										value={a.content}
										onInput={(e) =>
											updateAnnouncement(index(), e.currentTarget.value)
										}
										placeholder="お知らせ内容"
									/>
									<Show when={announcements().length > 1}>
										<button
											type="button"
											class={styles.removeButton}
											onClick={() => removeAnnouncement(index())}
										>
											<Minus size={16} stroke-width={1.5} />
										</button>
									</Show>
								</div>
							)}
						</For>
					</fieldset>

					<fieldset class={styles.fieldset}>
						<legend class={styles.legend}>
							奉仕当番
							<button
								type="button"
								class={styles.iconButton}
								onClick={addAssignment}
							>
								<Plus size={16} stroke-width={1.5} />
							</button>
						</legend>
						<For each={assignments()}>
							{(a, index) => (
								<div class={styles.dynamicRow}>
									<input
										type="text"
										class={styles.inputSmall}
										placeholder="役割（受付、音響など）"
										value={a.role}
										onInput={(e) =>
											updateAssignment(index(), "role", e.currentTarget.value)
										}
									/>
									<input
										type="text"
										class={styles.inputSmall}
										placeholder="担当者"
										value={a.person}
										onInput={(e) =>
											updateAssignment(index(), "person", e.currentTarget.value)
										}
									/>
									<Show when={assignments().length > 1}>
										<button
											type="button"
											class={styles.removeButton}
											onClick={() => removeAssignment(index())}
										>
											<Minus size={16} stroke-width={1.5} />
										</button>
									</Show>
								</div>
							)}
						</For>
					</fieldset>

					<div class={styles.actions}>
						<button
							type="button"
							class={styles.cancelButton}
							onClick={() =>
								navigate(isEdit() ? `/bulletin/${params.id}` : "/bulletin")
							}
						>
							キャンセル
						</button>
						<button
							type="submit"
							class={styles.submitButton}
							disabled={submitting() || !serviceDate()}
						>
							{isEdit() ? "更新" : "作成"}
						</button>
					</div>
				</form>
			</Show>
		</div>
	);
}
