import { A, useParams } from "@solidjs/router";
import { ArrowLeft, Pencil } from "lucide-solid";
import { createResource, For, Show } from "solid-js";
import type { BulletinDetail as BulletinDetailType } from "@/types/bulletin.ts";
import styles from "./BulletinDetail.module.css";

async function fetchBulletin(id: string): Promise<BulletinDetailType> {
	const res = await fetch(`/api/bulletin/${id}`);
	if (!res.ok) throw new Error("Failed to fetch bulletin");
	return res.json() as Promise<BulletinDetailType>;
}

function formatDate(dateStr: string): string {
	const [y, m, d] = dateStr.split("-");
	return `${y}年${Number(m)}月${Number(d)}日`;
}

export function BulletinDetail() {
	const params = useParams<{ id: string }>();
	const [bulletin] = createResource(() => params.id, fetchBulletin);

	return (
		<div class={styles.container}>
			<div class={styles.header}>
				<A href="/bulletin" class={styles.backLink}>
					<ArrowLeft size={20} stroke-width={1.5} />
				</A>
				<Show when={bulletin()}>
					{(b) => (
						<A href={`/bulletin/${b().id}/edit`} class={styles.editButton}>
							<Pencil size={14} stroke-width={1.5} />
							編集
						</A>
					)}
				</Show>
			</div>

			<Show
				when={!bulletin.loading}
				fallback={<p class={styles.loading}>読み込み中...</p>}
			>
				<Show when={bulletin()}>
					{(b) => (
						<div class={styles.content}>
							<h1 class={styles.title}>{formatDate(b().serviceDate)} 礼拝</h1>

							<Show when={b().worship.length > 0}>
								<section class={styles.section}>
									<h2 class={styles.sectionTitle}>礼拝プログラム</h2>
									<ul class={styles.worshipList}>
										<For each={b().worship}>
											{(item) => (
												<li class={styles.worshipItem}>
													<span class={styles.worshipLabel}>{item.label}</span>
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
									<h2 class={styles.sectionTitle}>お知らせ</h2>
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
									<h2 class={styles.sectionTitle}>奉仕当番</h2>
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
	);
}
