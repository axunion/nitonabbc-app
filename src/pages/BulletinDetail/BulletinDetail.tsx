import { useNavigate, useParams } from "@solidjs/router";
import { Pencil } from "lucide-solid";
import { createResource, For, Show } from "solid-js";
import { Header } from "@/components/Header";
import { useLocale } from "@/store/LocaleContext.tsx";
import type { BulletinDetail as BulletinDetailType } from "@/types/bulletin.ts";
import { formatDate } from "@/utils/date.ts";
import styles from "./BulletinDetail.module.css";

async function fetchBulletin(id: string): Promise<BulletinDetailType> {
	const res = await fetch(`/api/bulletin/${id}`);
	if (!res.ok) throw new Error("Failed to fetch bulletin");
	return res.json() as Promise<BulletinDetailType>;
}

export function BulletinDetail() {
	const params = useParams<{ id: string }>();
	const [bulletin] = createResource(() => params.id, fetchBulletin);
	const { t, locale } = useLocale();
	const navigate = useNavigate();

	return (
		<>
			<Header
				title={t("bulletin.worship")}
				backTo="/bulletin"
				rightAction={
					<Show when={bulletin()}>
						{(b) => (
							<button
								type="button"
								class={styles.editButton}
								onClick={() => navigate(`/bulletin/${b().id}/edit`)}
							>
								<Pencil size={14} stroke-width={1.5} />
								{t("common.edit")}
							</button>
						)}
					</Show>
				}
			/>
			<div class={styles.container}>
				<Show
					when={!bulletin.loading}
					fallback={<p class={styles.loading}>{t("common.loading")}</p>}
				>
					<Show when={bulletin()}>
						{(b) => (
							<div class={styles.content}>
								<h1 class={styles.title}>
									{formatDate(b().serviceDate, locale())}{" "}
									{t("bulletin.worship")}
								</h1>

								<Show when={b().worship.length > 0}>
									<section class={styles.section}>
										<h2 class={styles.sectionTitle}>
											{t("bulletin.worshipProgram")}
										</h2>
										<ul class={styles.worshipList}>
											<For each={b().worship}>
												{(item) => (
													<li class={styles.worshipItem}>
														<span class={styles.worshipLabel}>
															{item.label}
														</span>
														<Show when={item.details}>
															<span class={styles.worshipDetails}>
																{item.details}
															</span>
														</Show>
													</li>
												)}
											</For>
										</ul>
									</section>
								</Show>

								<Show when={b().announcements.length > 0}>
									<section class={styles.section}>
										<h2 class={styles.sectionTitle}>
											{t("bulletin.announcements")}
										</h2>
										<ul class={styles.announcementList}>
											<For each={b().announcements}>
												{(a) => (
													<li class={styles.announcementItem}>{a.content}</li>
												)}
											</For>
										</ul>
									</section>
								</Show>

								<Show when={Object.keys(b().assignments).length > 0}>
									<section class={styles.section}>
										<h2 class={styles.sectionTitle}>
											{t("bulletin.assignments")}
										</h2>
										<dl class={styles.assignmentList}>
											<For each={Object.entries(b().assignments)}>
												{([role, person]) => (
													<>
														<dt class={styles.assignmentRole}>{role}</dt>
														<dd class={styles.assignmentPerson}>{person}</dd>
													</>
												)}
											</For>
										</dl>
									</section>
								</Show>
							</div>
						)}
					</Show>
				</Show>
			</div>
		</>
	);
}
