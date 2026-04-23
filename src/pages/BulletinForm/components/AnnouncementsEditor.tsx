import { Minus, Plus } from "lucide-solid";
import { For } from "solid-js";
import { useLocale } from "@/store/LocaleContext.tsx";
import type { AnnouncementsSectionData } from "@/types/bulletin.ts";
import styles from "../BulletinForm.module.css";

type Props = {
	section: AnnouncementsSectionData;
	onAdd: (sectionId: string) => void;
	onRemove: (sectionId: string, index: number) => void;
	onUpdate: (sectionId: string, index: number, value: string) => void;
};

export function AnnouncementsEditor(props: Props) {
	const { t } = useLocale();

	return (
		<>
			<div class={styles.sectionAddRow}>
				<button
					type="button"
					class={styles.iconButton}
					onClick={() => props.onAdd(props.section.id)}
				>
					<Plus size={16} stroke-width={1.5} />
				</button>
			</div>
			<For each={props.section.data}>
				{(a, index) => (
					<div class={styles.dynamicRow}>
						<textarea
							class={styles.textarea}
							rows={2}
							value={a.content}
							onInput={(e) =>
								props.onUpdate(props.section.id, index(), e.currentTarget.value)
							}
							placeholder={t("bulletinForm.announcementPlaceholder")}
						/>
						<button
							type="button"
							class={styles.removeButton}
							onClick={() => props.onRemove(props.section.id, index())}
						>
							<Minus size={16} stroke-width={1.5} />
						</button>
					</div>
				)}
			</For>
		</>
	);
}
