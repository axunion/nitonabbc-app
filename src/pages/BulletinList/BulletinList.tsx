import { useNavigate } from "@solidjs/router";
import { CalendarPlus } from "lucide-solid";
import { createMemo, createResource, createSignal, For, Show } from "solid-js";
import { fetchBulletins } from "@/api/bulletin.ts";
import { Header } from "@/components/Header";
import { useLocale } from "@/store/LocaleContext.tsx";
import type { BulletinSummary } from "@/types/bulletin.ts";
import { formatDate } from "@/utils/date.ts";
import styles from "./BulletinList.module.css";

function getNextSunday(): string {
	const today = new Date();
	const dayOfWeek = today.getUTCDay();
	const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
	const nextSunday = new Date(today);
	nextSunday.setUTCDate(today.getUTCDate() + daysUntilSunday);
	return nextSunday.toISOString().slice(0, 10);
}

export function BulletinList() {
	const [bulletins, { refetch }] = createResource(fetchBulletins);
	const { t, locale } = useLocale();
	const navigate = useNavigate();
	const [generating, setGenerating] = createSignal(false);
	const [genError, setGenError] = createSignal("");

	const nextSunday = getNextSunday();
	const today = new Date().toISOString().slice(0, 10);

	const upcoming = createMemo(() => {
		const items = bulletins();
		if (!items) return [];
		return items.filter((b) => b.serviceDate >= today);
	});

	const archive = createMemo(() => {
		const items = bulletins();
		if (!items) return [];
		return items.filter((b) => b.serviceDate < today);
	});

	const hasNextSunday = () =>
		bulletins()?.some((b) => b.serviceDate === nextSunday) ?? false;

	async function handleGenerate() {
		setGenError("");
		setGenerating(true);
		try {
			const res = await fetch("/api/bulletin/generate", { method: "POST" });
			if (res.status === 409) {
				setGenError(t("bulletin.alreadyExists"));
				return;
			}
			if (!res.ok) {
				setGenError(t("bulletin.generateError"));
				return;
			}
			const data = (await res.json()) as { id: number };
			refetch();
			navigate(`/bulletin/${data.id}/edit`);
		} catch {
			setGenError(t("bulletin.generateError"));
		} finally {
			setGenerating(false);
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
					when={!bulletins.loading}
					fallback={<p class={styles.loading}>{t("common.loading")}</p>}
				>
					{/* Generate next Sunday button */}
					<Show when={!hasNextSunday()}>
						<button
							type="button"
							class={styles.generateButton}
							onClick={handleGenerate}
							disabled={generating()}
						>
							<CalendarPlus size={20} stroke-width={1.5} />
							{generating()
								? t("bulletin.generating")
								: t("bulletin.generateNext")}
						</button>
					</Show>

					<Show when={genError()}>
						<p class={styles.genError}>{genError()}</p>
					</Show>

					{/* Upcoming bulletins */}
					<Show when={upcoming().length > 0}>
						<h2 class={styles.sectionTitle}>{t("bulletin.upcoming")}</h2>
						<ul class={styles.list}>
							<For each={upcoming()}>
								{(b) => (
									<li>
										<button
											type="button"
											class={styles.upcomingCard}
											onClick={() => navigate(`/bulletin/${b.id}`)}
										>
											<span class={styles.date}>
												{formatDate(b.serviceDate, locale())}
											</span>
											<div class={styles.progressRow}>
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
											</div>
										</button>
									</li>
								)}
							</For>
						</ul>
					</Show>

					{/* Archive */}
					<Show
						when={archive().length > 0}
						fallback={
							<Show when={upcoming().length === 0}>
								<p class={styles.empty}>{t("bulletin.empty")}</p>
							</Show>
						}
					>
						<h2 class={styles.sectionTitle}>{t("bulletin.archive")}</h2>
						<ul class={styles.list}>
							<For each={archive()}>
								{(b) => (
									<li>
										<button
											type="button"
											class={styles.card}
											onClick={() => navigate(`/bulletin/${b.id}`)}
										>
											<span class={styles.date}>
												{formatDate(b.serviceDate, locale())}
											</span>
										</button>
									</li>
								)}
							</For>
						</ul>
					</Show>
				</Show>
			</div>
		</>
	);
}
