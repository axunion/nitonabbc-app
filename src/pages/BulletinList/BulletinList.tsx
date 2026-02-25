import { A } from "@solidjs/router";
import { Plus } from "lucide-solid";
import { createResource, For, Show } from "solid-js";
import { useLocale } from "@/store/LocaleContext.tsx";
import type { BulletinSummary } from "@/types/bulletin.ts";
import styles from "./BulletinList.module.css";

async function fetchBulletins(): Promise<BulletinSummary[]> {
	const res = await fetch("/api/bulletin");
	if (!res.ok) throw new Error("Failed to fetch bulletins");
	return res.json() as Promise<BulletinSummary[]>;
}

function formatDate(dateStr: string, locale: string): string {
	const [y, m, d] = dateStr.split("-").map(Number);
	return new Intl.DateTimeFormat(locale, {
		year: "numeric",
		month: "long",
		day: "numeric",
	}).format(new Date(y, m - 1, d));
}

export function BulletinList() {
	const [bulletins] = createResource(fetchBulletins);
	const { t, locale } = useLocale();

	return (
		<div class={styles.container}>
			<div class={styles.header}>
				<h1 class={styles.title}>{t("bulletin.title")}</h1>
				<A href="/bulletin/new" class={styles.addButton}>
					<Plus size={16} stroke-width={1.5} />
					{t("bulletin.newBulletin")}
				</A>
			</div>

			<Show
				when={!bulletins.loading}
				fallback={<p class={styles.loading}>{t("common.loading")}</p>}
			>
				<Show
					when={bulletins()?.length}
					fallback={<p class={styles.empty}>{t("bulletin.empty")}</p>}
				>
					<ul class={styles.list}>
						<For each={bulletins()}>
							{(b) => (
								<li>
									<A href={`/bulletin/${b.id}`} class={styles.card}>
										<span class={styles.date}>
											{formatDate(b.serviceDate, locale())}
										</span>
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
