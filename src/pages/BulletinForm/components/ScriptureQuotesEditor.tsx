import { Minus, Plus } from "lucide-solid";
import { For } from "solid-js";
import { useLocale } from "@/store/LocaleContext.tsx";
import type {
	ScriptureQuote,
	ScriptureQuotesSectionData,
} from "@/types/bulletin.ts";
import styles from "../BulletinForm.module.css";

type Props = {
	section: ScriptureQuotesSectionData;
	onAdd: (sectionId: string) => void;
	onRemove: (sectionId: string, index: number) => void;
	onUpdate: (sectionId: string, index: number, value: ScriptureQuote) => void;
};

export function ScriptureQuotesEditor(props: Props) {
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
					{t("bulletinForm.addScriptureQuote")}
				</button>
			</div>
			<For each={props.section.data}>
				{(quote, index) => (
					<div class={styles.dynamicRow}>
						<div class={styles.compoundFields}>
							<input
								type="text"
								class={styles.inputSmall}
								placeholder={t("bulletinForm.verseReferencePlaceholder")}
								value={quote.reference}
								onInput={(e) =>
									props.onUpdate(props.section.id, index(), {
										...quote,
										reference: e.currentTarget.value,
									})
								}
							/>
							<input
								type="text"
								class={styles.inputSmall}
								placeholder={t("bulletinForm.verseTextPlaceholder")}
								value={quote.text}
								onInput={(e) =>
									props.onUpdate(props.section.id, index(), {
										...quote,
										text: e.currentTarget.value,
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
