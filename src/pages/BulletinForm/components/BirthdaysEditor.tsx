import { Minus, Plus } from "lucide-solid";
import { For } from "solid-js";
import { useLocale } from "@/store/LocaleContext.tsx";
import type { Birthday, BirthdaysSectionData } from "@/types/bulletin.ts";
import styles from "../BulletinForm.module.css";

type Props = {
	section: BirthdaysSectionData;
	onAdd: (sectionId: string) => void;
	onRemove: (sectionId: string, index: number) => void;
	onUpdate: (sectionId: string, index: number, value: Birthday) => void;
};

export function BirthdaysEditor(props: Props) {
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
					{t("bulletinForm.addBirthday")}
				</button>
			</div>
			<For each={props.section.data}>
				{(birthday, index) => (
					<div class={styles.dynamicRow}>
						<div class={styles.compoundFields}>
							<input
								type="text"
								class={styles.inputSmall}
								placeholder={t("bulletinForm.birthdayDayPlaceholder")}
								value={birthday.day}
								onInput={(e) =>
									props.onUpdate(props.section.id, index(), {
										...birthday,
										day: e.currentTarget.value,
									})
								}
							/>
							<input
								type="text"
								class={styles.inputSmall}
								placeholder={t("bulletinForm.birthdayNamePlaceholder")}
								value={birthday.name}
								onInput={(e) =>
									props.onUpdate(props.section.id, index(), {
										...birthday,
										name: e.currentTarget.value,
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
