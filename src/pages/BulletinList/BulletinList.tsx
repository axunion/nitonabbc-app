import { useNavigate } from "@solidjs/router";
import { Check } from "lucide-solid";
import { createMemo, createResource, createSignal, For, Show } from "solid-js";
import { fetchBulletins } from "@/api/bulletin.ts";
import { Header } from "@/components/Header";
import { ProgressBar } from "@/components/ProgressBar";
import { BULLETIN_START_YEAR } from "@/config/app.ts";
import { useLocale } from "@/store/LocaleContext.tsx";
import type { BulletinSummary } from "@/types/bulletin.ts";
import { formatDate } from "@/utils/date.ts";
import styles from "./BulletinList.module.css";

type DayEntry = {
	dateStr: string;
	bulletin: BulletinSummary | null;
	isNextSunday: boolean;
};

export function BulletinList() {
	const [data] = createResource(fetchBulletins);
	const { t, locale } = useLocale();
	const navigate = useNavigate();

	const now = new Date();
	const [selectedYear, setSelectedYear] = createSignal(now.getFullYear());
	const [selectedMonth, setSelectedMonth] = createSignal(now.getMonth() + 1);

	// Year options: current year down to BULLETIN_START_YEAR (constant)
	const years: number[] = [];
	for (let y = now.getFullYear(); y >= BULLETIN_START_YEAR; y--) {
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
			navigate(`/bulletin/new?date=${entry.dateStr}`);
		}
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
										<div class={styles.dayMeta}>
											<Show
												when={entry.bulletin}
												keyed
												fallback={
													<span class={styles.pendingLabel}>
														{t("bulletin.notCreated")}
													</span>
												}
											>
												{(b) => (
													<>
														<ProgressBar
															filled={b.filledItems}
															total={b.totalItems}
															label={t("bulletin.progressCount", {
																filled: String(b.filledItems),
																total: String(b.totalItems),
															})}
														/>
														<Check
															size={16}
															stroke-width={2}
															class={styles.checkIcon}
														/>
													</>
												)}
											</Show>
										</div>
									</button>
								</li>
							)}
						</For>
					</ul>
				</Show>
			</div>
		</>
	);
}
