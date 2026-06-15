import { Show } from "solid-js";
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
				<Show when={props.section.data.lyrics?.trim()}>
					<p class={styles.lyrics}>{props.section.data.lyrics}</p>
				</Show>
			</section>
		</Show>
	);
}
