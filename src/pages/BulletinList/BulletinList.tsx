import { A } from "@solidjs/router";
import { Plus } from "lucide-solid";
import { createResource, For, Show } from "solid-js";
import type { BulletinSummary } from "@/types/bulletin.ts";
import styles from "./BulletinList.module.css";

async function fetchBulletins(): Promise<BulletinSummary[]> {
	const res = await fetch("/api/bulletin");
	if (!res.ok) throw new Error("Failed to fetch bulletins");
	return res.json() as Promise<BulletinSummary[]>;
}

function formatDate(dateStr: string): string {
	const [y, m, d] = dateStr.split("-");
	return `${y}年${Number(m)}月${Number(d)}日`;
}

export function BulletinList() {
	const [bulletins] = createResource(fetchBulletins);

	return (
		<div class={styles.container}>
			<div class={styles.header}>
				<h1 class={styles.title}>週報</h1>
				<A href="/bulletin/new" class={styles.addButton}>
					<Plus size={16} stroke-width={1.5} />
					新規作成
				</A>
			</div>

			<Show
				when={!bulletins.loading}
				fallback={<p class={styles.loading}>読み込み中...</p>}
			>
				<Show
					when={bulletins()?.length}
					fallback={<p class={styles.empty}>週報がまだありません</p>}
				>
					<ul class={styles.list}>
						<For each={bulletins()}>
							{(b) => (
								<li>
									<A href={`/bulletin/${b.id}`} class={styles.card}>
										<span class={styles.date}>{formatDate(b.serviceDate)}</span>
									</A>
								</li>
							)}
						</For>
					</ul>
				</Show>
			</Show>
		</div>
	);
}
