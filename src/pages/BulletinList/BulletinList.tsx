import { Dialog } from "@kobalte/core/dialog";
import { useNavigate } from "@solidjs/router";
import { Check } from "lucide-solid";
import { createMemo, createResource, createSignal, For, Show } from "solid-js";
import { fetchBulletins } from "@/api/bulletin.ts";
import { Header } from "@/components/Header";
import { useLocale } from "@/store/LocaleContext.tsx";
import type { BulletinSummary } from "@/types/bulletin.ts";
import { formatDate } from "@/utils/date.ts";
import styles from "./BulletinList.module.css";

const START_YEAR = 2026;

type DayEntry = {
	dateStr: string;
	bulletin: BulletinSummary | null;
	isNextSunday: boolean;
};

export function BulletinList() {
	const [data, { refetch }] = createResource(fetchBulletins);
	const { t, locale } = useLocale();
	const navigate = useNavigate();

	const now = new Date();
	const [selectedYear, setSelectedYear] = createSignal(now.getFullYear());
	const [selectedMonth, setSelectedMonth] = createSignal(now.getMonth() + 1);

	const [dialogDate, setDialogDate] = createSignal<string | null>(null);
	const [creating, setCreating] = createSignal(false);
	const [createError, setCreateError] = createSignal("");

	// Year options: current year down to START_YEAR (constant)
	const years: number[] = [];
	for (let y = now.getFullYear(); y >= START_YEAR; y--) {
		years.push(y);
	}

	const months = Array.from({ length: 12 }, (_, i) => i + 1);

	// Entries for selected year/month: created bulletins + next Sunday if applicable
	const entries = createMemo((): DayEntry[] => {
		const d = data();
		if (!d) return [];
		const y = selectedYear();
		const m = selectedMonth();
		const prefix = `${y}-${String(m).padStart(2, "0")}`;
		const { nextSunday } = d;

		const result: DayEntry[] = [];
		let nextSundayFound = false;

		for (const b of d.bulletins) {
			if (b.serviceDate.startsWith(prefix)) {
				if (b.serviceDate === nextSunday) nextSundayFound = true;
				result.push({
					dateStr: b.serviceDate,
					bulletin: b,
					isNextSunday: b.serviceDate === nextSunday,
				});
			}
		}

		// Add next Sunday if it's in this month and not yet created
		if (!nextSundayFound && nextSunday.startsWith(prefix)) {
			result.push({
				dateStr: nextSunday,
				bulletin: null,
				isNextSunday: true,
			});
		}

		result.sort((a, b) => a.dateStr.localeCompare(b.dateStr));
		return result;
	});

	function handleDayClick(entry: DayEntry) {
		if (entry.bulletin) {
			navigate(`/bulletin/${entry.bulletin.id}`);
		} else {
			setCreateError("");
			setDialogDate(entry.dateStr);
		}
	}

	async function handleCreate() {
		const date = dialogDate();
		if (!date) return;
		setCreating(true);
		setCreateError("");
		try {
			const res = await fetch("/api/bulletin/generate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ serviceDate: date }),
			});
			if (res.status === 409) {
				setCreateError(t("bulletin.alreadyExists"));
				return;
			}
			if (!res.ok) {
				setCreateError(t("bulletin.generateError"));
				return;
			}
			const result = (await res.json()) as { id: number };
			setDialogDate(null);
			refetch();
			navigate(`/bulletin/${result.id}/edit`);
		} catch {
			setCreateError(t("bulletin.generateError"));
		} finally {
			setCreating(false);
		}
	}

	function progressPercent(b: BulletinSummary): number {
		if (b.totalItems === 0) return 100;
		return Math.round((b.filledItems / b.totalItems) * 100);
	}

	return (
		<>
			<Header title={t("bulletin.title")} backTo="/" />
			<div class={styles.container}>
				<Show
					when={!data.loading}
					fallback={<p class={styles.loading}>{t("common.loading")}</p>}
				>
					{/* Year / Month selectors */}
					<div class={styles.selectorRow}>
						<select
							class={styles.selector}
							value={selectedYear()}
							onChange={(e) => setSelectedYear(Number(e.currentTarget.value))}
						>
							<For each={years}>
								{(y) => (
									<option value={y}>
										{y}
										{t("bulletin.year")}
									</option>
								)}
							</For>
						</select>
						<select
							class={styles.selector}
							value={selectedMonth()}
							onChange={(e) => setSelectedMonth(Number(e.currentTarget.value))}
						>
							<For each={months}>
								{(m) => (
									<option value={m}>
										{m}
										{t("bulletin.month")}
									</option>
								)}
							</For>
						</select>
					</div>

					{/* Bulletin entries */}
					<ul class={styles.list}>
						<For each={entries()}>
							{(entry) => (
								<li>
									<button
										type="button"
										class={styles.dayCard}
										classList={{
											[styles.dayCardExists]: !!entry.bulletin,
											[styles.dayCardPending]:
												!entry.bulletin && entry.isNextSunday,
										}}
										onClick={() => handleDayClick(entry)}
									>
										<span class={styles.dayDate}>
											{formatDate(entry.dateStr, locale())}
										</span>
										<Show when={entry.bulletin} keyed>
											{(b) => (
												<div class={styles.dayMeta}>
													<div class={styles.progressBar}>
														<div
															class={styles.progressFill}
															style={{
																width: `${progressPercent(b)}%`,
															}}
														/>
													</div>
													<span class={styles.progressText}>
														{t("bulletin.progressCount")
															.replace("{{filled}}", String(b.filledItems))
															.replace("{{total}}", String(b.totalItems))}
													</span>
													<Check
														size={16}
														stroke-width={2}
														class={styles.checkIcon}
													/>
												</div>
											)}
										</Show>
									</button>
								</li>
							)}
						</For>
					</ul>
				</Show>

				{/* Create confirmation dialog */}
				<Dialog
					open={dialogDate() !== null}
					onOpenChange={(open) => {
						if (!open) setDialogDate(null);
					}}
				>
					<Dialog.Portal>
						<Dialog.Overlay class={styles.overlay} />
						<Dialog.Content class={styles.dialogContent}>
							<Dialog.Title class={styles.dialogTitle}>
								{t("bulletin.createConfirm").replace(
									"{{date}}",
									dialogDate()
										? formatDate(dialogDate() as string, locale())
										: "",
								)}
							</Dialog.Title>
							<Dialog.Description class={styles.dialogDesc}>
								{t("bulletin.createConfirmDesc")}
							</Dialog.Description>
							<Show when={createError()}>
								<p class={styles.dialogError}>{createError()}</p>
							</Show>
							<div class={styles.dialogActions}>
								<Dialog.CloseButton class={styles.cancelButton}>
									{t("common.cancel")}
								</Dialog.CloseButton>
								<button
									type="button"
									class={styles.submitButton}
									onClick={handleCreate}
									disabled={creating()}
								>
									{creating() ? t("bulletin.generating") : t("common.create")}
								</button>
							</div>
						</Dialog.Content>
					</Dialog.Portal>
				</Dialog>
			</div>
		</>
	);
}
