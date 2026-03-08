import { useNavigate } from "@solidjs/router";
import { Plus } from "lucide-solid";
import { createResource, For, Show } from "solid-js";
import { Header } from "@/components/Header";
import { useLocale } from "@/store/LocaleContext.tsx";
import type { BulletinSummary } from "@/types/bulletin.ts";
import { formatDate } from "@/utils/date.ts";
import styles from "./BulletinList.module.css";

async function fetchBulletins(): Promise<BulletinSummary[]> {
	const res = await fetch("/api/bulletin");
	if (!res.ok) throw new Error("Failed to fetch bulletins");
	return res.json() as Promise<BulletinSummary[]>;
}

export function BulletinList() {
	const [bulletins] = createResource(fetchBulletins);
	const { t, locale } = useLocale();
	const navigate = useNavigate();

	return (
		<>
			<Header
				title={t("bulletin.title")}
				backTo="/"
				rightAction={
					<button
						type="button"
						class={styles.addButton}
						onClick={() => navigate("/bulletin/new")}
					>
						<Plus size={16} stroke-width={1.5} />
						{t("bulletin.newBulletin")}
					</button>
				}
			/>
			<div class={styles.container}>
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
