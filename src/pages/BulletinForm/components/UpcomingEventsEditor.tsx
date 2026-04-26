import { Minus, Plus } from "lucide-solid";
import { For } from "solid-js";
import { useLocale } from "@/store/LocaleContext.tsx";
import type {
	UpcomingEvent,
	UpcomingEventsSectionData,
} from "@/types/bulletin.ts";
import styles from "../BulletinForm.module.css";

type Props = {
	section: UpcomingEventsSectionData;
	onAdd: (sectionId: string) => void;
	onRemove: (sectionId: string, index: number) => void;
	onUpdate: (sectionId: string, index: number, value: UpcomingEvent) => void;
};

export function UpcomingEventsEditor(props: Props) {
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
					{t("bulletinForm.addUpcomingEvent")}
				</button>
			</div>
			<For each={props.section.data}>
				{(event, index) => (
					<div class={styles.dynamicRow}>
						<div class={styles.compoundFields}>
							<input
								type="text"
								class={styles.inputSmall}
								placeholder={t("bulletinForm.upcomingDatePlaceholder")}
								value={event.date}
								onInput={(e) =>
									props.onUpdate(props.section.id, index(), {
										...event,
										date: e.currentTarget.value,
									})
								}
							/>
							<input
								type="text"
								class={styles.inputSmall}
								placeholder={t("bulletinForm.upcomingDescriptionPlaceholder")}
								value={event.description}
								onInput={(e) =>
									props.onUpdate(props.section.id, index(), {
										...event,
										description: e.currentTarget.value,
									})
								}
							/>
						</div>
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
