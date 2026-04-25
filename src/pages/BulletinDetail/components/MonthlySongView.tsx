import { For, Show } from "solid-js";
import type { MonthlySongSectionData } from "@/types/bulletin.ts";
import detailStyles from "../BulletinDetail.module.css";
import styles from "./MonthlySongView.module.css";

type Props = {
	section: MonthlySongSectionData;
};

export function MonthlySongView(props: Props) {
	return (
		<Show when={props.section.data.title}>
			<section class={detailStyles.section}>
				<h2 class={detailStyles.sectionTitle}>{props.section.label}</h2>
				<p class={styles.songTitle}>{props.section.data.title}</p>
				<Show when={props.section.data.keywords.length > 0}>
					<ul class={styles.keywordList}>
						<For each={props.section.data.keywords}>
							{(keyword) => <li class={styles.keyword}>{keyword}</li>}
						</For>
					</ul>
				</Show>
			</section>
		</Show>
	);
}
