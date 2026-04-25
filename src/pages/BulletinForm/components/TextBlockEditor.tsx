import { useLocale } from "@/store/LocaleContext.tsx";
import type { TextBlockSectionData } from "@/types/bulletin.ts";
import styles from "../BulletinForm.module.css";

type Props = {
	section: TextBlockSectionData;
	onUpdate: (data: { heading: string; body: string }) => void;
};

export function TextBlockEditor(props: Props) {
	const { t } = useLocale();

	return (
		<>
			<input
				type="text"
				class={styles.input}
				value={props.section.data.heading}
				onInput={(e) =>
					props.onUpdate({
						heading: e.currentTarget.value,
						body: props.section.data.body,
					})
				}
				placeholder={t("bulletinForm.textBlockHeadingPlaceholder")}
			/>
			<textarea
				class={styles.textarea}
				rows={4}
				value={props.section.data.body}
				onInput={(e) =>
					props.onUpdate({
						heading: props.section.data.heading,
						body: e.currentTarget.value,
					})
				}
				placeholder={t("bulletinForm.textBlockBodyPlaceholder")}
			/>
		</>
	);
}
