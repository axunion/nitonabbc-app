import { Minus, Plus } from "lucide-solid";
import { createSignal, For, Show } from "solid-js";
import { useLocale } from "@/store/LocaleContext.tsx";
import type { MonthlySongSectionData } from "@/types/bulletin.ts";
import styles from "../BulletinForm.module.css";
import songStyles from "./MonthlySongEditor.module.css";

type Props = {
	section: MonthlySongSectionData;
	onUpdate: (data: { title: string; keywords: string[] }) => void;
};

export function MonthlySongEditor(props: Props) {
	const { t } = useLocale();
	const [keywordInput, setKeywordInput] = createSignal("");

	function addKeyword() {
		const kw = keywordInput().trim();
		if (!kw) return;
		props.onUpdate({
			title: props.section.data.title,
			keywords: [...props.section.data.keywords, kw],
		});
		setKeywordInput("");
	}

	function removeKeyword(index: number) {
		props.onUpdate({
			title: props.section.data.title,
			keywords: props.section.data.keywords.filter((_, i) => i !== index),
		});
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === "Enter") {
			e.preventDefault();
			addKeyword();
		}
	}

	return (
		<>
			<input
				type="text"
				class={styles.input}
				value={props.section.data.title}
				onInput={(e) =>
					props.onUpdate({
						title: e.currentTarget.value,
						keywords: props.section.data.keywords,
					})
				}
				placeholder={t("bulletinForm.songTitlePlaceholder")}
			/>
			<div class={songStyles.keywordInputRow}>
				<input
					type="text"
					class={styles.inputSmall}
					value={keywordInput()}
					onInput={(e) => setKeywordInput(e.currentTarget.value)}
					onKeyDown={handleKeyDown}
					placeholder={t("bulletinForm.songKeywordPlaceholder")}
				/>
				<button type="button" class={songStyles.addButton} onClick={addKeyword}>
					<Plus size={14} stroke-width={1.5} />
					{t("bulletinForm.addKeyword")}
				</button>
			</div>
			<Show when={props.section.data.keywords.length > 0}>
				<ul class={songStyles.keywordList}>
					<For each={props.section.data.keywords}>
						{(keyword, index) => (
							<li class={songStyles.keywordItem}>
								<span class={songStyles.keywordText}>{keyword}</span>
								<button
									type="button"
									class={songStyles.removeButton}
									onClick={() => removeKeyword(index())}
								>
									<Minus size={12} stroke-width={1.5} />
								</button>
							</li>
						)}
					</For>
				</ul>
			</Show>
		</>
	);
}
