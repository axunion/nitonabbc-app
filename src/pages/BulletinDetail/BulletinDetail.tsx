import { useNavigate, useParams } from "@solidjs/router";
import { Pencil } from "lucide-solid";
import { createResource, For, Show } from "solid-js";
import { fetchBulletin, fetchMembers, fetchTemplate } from "@/api/bulletin.ts";
import { Header } from "@/components/Header";
import { ProgressBar } from "@/components/ProgressBar";
import { useAuth } from "@/store/AuthContext.tsx";
import { useLocale } from "@/store/LocaleContext.tsx";
import { getMemberName, getTemplateItem } from "@/utils/bulletin.ts";
import { formatDate } from "@/utils/date.ts";
import styles from "./BulletinDetail.module.css";

export function BulletinDetail() {
	const params = useParams<{ id: string }>();
	const [bulletin] = createResource(() => params.id, fetchBulletin);
	const [members] = createResource(fetchMembers);
	const [template] = createResource(fetchTemplate);
	const { t, locale } = useLocale();
	const navigate = useNavigate();
	const { user } = useAuth();

	function hasMyUnfilledItems(): boolean {
		const b = bulletin();
		const uid = user().id;
		if (!b || uid == null) return false;
		return b.worship.some((item) => {
			if (item.assigneeId !== uid) return false;
			const tmpl = getTemplateItem(template(), item.type);
			if (tmpl?.fields && tmpl.fields.length > 0) {
				return tmpl.fields.some(
					(f) => f.inputType !== "none" && !item.fieldValues?.[f.key]?.trim(),
				);
			}
			const inputType = tmpl?.inputType ?? "text";
			if (inputType === "none") return false;
			return !item.details?.trim();
		});
	}

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

								{/* Progress bar */}
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

								{/* My unfilled items CTA */}
								<Show when={hasMyUnfilledItems()}>
									<button
										type="button"
										class={styles.ctaButton}
										onClick={() => navigate(`/bulletin/${b().id}/edit`)}
									>
										{t("bulletin.fillIn")}
									</button>
								</Show>

								<Show when={b().worship.length > 0}>
									<section class={styles.section}>
										<h2 class={styles.sectionTitle}>
											{t("bulletin.worshipProgram")}
										</h2>
										<ul class={styles.worshipList}>
											<For each={b().worship}>
												{(item) => {
													const tmpl = getTemplateItem(template(), item.type);
													const assigneeName = getMemberName(
														members(),
														item.assigneeId,
													);

													return (
														<li class={styles.worshipItem}>
															<div class={styles.worshipItemHeader}>
																<span class={styles.worshipLabel}>
																	{item.label}
																</span>
																<Show when={assigneeName}>
																	<span class={styles.worshipAssignee}>
																		{assigneeName}
																	</span>
																</Show>
															</div>
															<Show
																when={tmpl?.fields && tmpl.fields.length > 0}
															>
																<div class={styles.compoundDetails}>
																	<For each={tmpl?.fields ?? []}>
																		{(field) => (
																			<Show
																				when={
																					field.inputType !== "none" &&
																					item.fieldValues?.[field.key]
																				}
																			>
																				<div class={styles.compoundField}>
																					<span
																						class={styles.compoundFieldLabel}
																					>
																						{field.label}
																					</span>
																					<span
																						class={styles.compoundFieldValue}
																					>
																						{field.inputType === "member"
																							? (getMemberName(
																									members(),
																									Number(
																										item.fieldValues?.[
																											field.key
																										],
																									),
																								) ??
																								item.fieldValues?.[field.key])
																							: item.fieldValues?.[field.key]}
																					</span>
																				</div>
																			</Show>
																		)}
																	</For>
																</div>
															</Show>
															<Show
																when={
																	!(tmpl?.fields && tmpl.fields.length > 0) &&
																	item.details
																}
															>
																<span class={styles.worshipDetails}>
																	{tmpl?.inputType === "member"
																		? (getMemberName(
																				members(),
																				Number(item.details),
																			) ?? item.details)
																		: item.details}
																</span>
															</Show>
														</li>
													);
												}}
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
