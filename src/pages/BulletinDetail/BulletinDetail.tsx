import { useNavigate, useParams } from "@solidjs/router";
import { Pencil } from "lucide-solid";
import { createResource, For, Show } from "solid-js";
import { fetchBulletin, fetchMembers, fetchTemplate } from "@/api/bulletin.ts";
import { Header } from "@/components/Header";
import { ProgressBar } from "@/components/ProgressBar";
import { useAuth } from "@/store/AuthContext.tsx";
import { useLocale } from "@/store/LocaleContext.tsx";
import { hasMyUnfilledWorshipItems } from "@/utils/bulletin.ts";
import { formatDate } from "@/utils/date.ts";
import styles from "./BulletinDetail.module.css";
import { SectionView } from "./components/SectionView.tsx";

export function BulletinDetail() {
	const params = useParams<{ id: string }>();
	const [bulletin] = createResource(() => params.id, fetchBulletin);
	const [members] = createResource(fetchMembers);
	const [template] = createResource(fetchTemplate);
	const { t, locale } = useLocale();
	const navigate = useNavigate();
	const { user } = useAuth();

	function hasUnfilledItems(): boolean {
		const b = bulletin();
		const t = template();
		if (!b || !t) return false;
		return hasMyUnfilledWorshipItems(b.sections, t, user().id);
	}

	return (
		<>
			<Header
				title={t("bulletin.title")}
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
									{formatDate(b().serviceDate, locale())}
								</h1>

								<Show when={b().totalItems > 0}>
									<div class={styles.progressRow}>
										<ProgressBar
											filled={b().filledItems}
											total={b().totalItems}
											label={t("bulletin.progressCount", {
												filled: String(b().filledItems),
												total: String(b().totalItems),
											})}
										/>
									</div>
								</Show>

								<Show when={hasUnfilledItems()}>
									<button
										type="button"
										class={styles.ctaButton}
										onClick={() => navigate(`/bulletin/${b().id}/edit`)}
									>
										{t("bulletin.fillIn")}
									</button>
								</Show>

								<div class={styles.sectionsGrid}>
									<For each={b().sections}>
										{(section) => (
											<SectionView
												section={section}
												template={template() ?? []}
												members={members()}
											/>
										)}
									</For>
								</div>
							</div>
						)}
					</Show>
				</Show>
			</div>
		</>
	);
}
