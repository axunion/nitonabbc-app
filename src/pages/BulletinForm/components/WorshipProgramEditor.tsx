import { For, Show } from "solid-js";
import { useAuth } from "@/store/AuthContext.tsx";
import { useLocale } from "@/store/LocaleContext.tsx";
import type {
	Member,
	SectionTemplate,
	WorshipProgramSectionData,
} from "@/types/bulletin.ts";
import { findSectionTemplate } from "@/utils/bulletin.ts";
import styles from "../BulletinForm.module.css";
import { WorshipInput } from "./WorshipInput.tsx";

type Props = {
	section: WorshipProgramSectionData;
	template: SectionTemplate[];
	members: Member[] | undefined;
	onUpdateDetails: (sectionId: string, index: number, value: string) => void;
	onUpdateFieldValue: (
		sectionId: string,
		index: number,
		key: string,
		value: string,
	) => void;
	onUpdateAssignee: (sectionId: string, index: number, value: string) => void;
};

export function WorshipProgramEditor(props: Props) {
	const { t } = useLocale();
	const { user } = useAuth();
	const isAdmin = () => user().role === "admin";

	const templateItems = () => {
		const tmpl = findSectionTemplate(props.template, props.section.id);
		return tmpl?.type === "worship-program" ? tmpl.config.items : [];
	};

	return (
		<For each={props.section.data}>
			{(item, index) => (
				<div
					class={styles.worshipCard}
					classList={{
						[styles.highlighted]:
							item.assigneeId != null && item.assigneeId === user().id,
					}}
				>
					<div class={styles.worshipHeader}>
						<span class={styles.worshipLabel}>{item.label}</span>
						<Show when={isAdmin()}>
							<select
								class={styles.assigneeSelect}
								value={item.assigneeId != null ? String(item.assigneeId) : ""}
								onChange={(e) =>
									props.onUpdateAssignee(
										props.section.id,
										index(),
										e.currentTarget.value,
									)
								}
								title={t("bulletinForm.assignTo")}
							>
								<option value="">{t("bulletin.unassigned")}</option>
								<For each={props.members ?? []}>
									{(m) => <option value={String(m.id)}>{m.name}</option>}
								</For>
							</select>
						</Show>
					</div>
					<WorshipInput
						item={item}
						index={index()}
						template={templateItems()}
						members={props.members}
						onUpdateDetails={(i, v) =>
							props.onUpdateDetails(props.section.id, i, v)
						}
						onUpdateFieldValue={(i, k, v) =>
							props.onUpdateFieldValue(props.section.id, i, k, v)
						}
					/>
				</div>
			)}
		</For>
	);
}
