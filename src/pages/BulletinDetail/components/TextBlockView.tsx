import { Show } from "solid-js";
import type { TextBlockSectionData } from "@/types/bulletin.ts";
import detailStyles from "../BulletinDetail.module.css";
import styles from "./TextBlockView.module.css";

type Props = {
  section: TextBlockSectionData;
};

export function TextBlockView(props: Props) {
  return (
    <Show when={props.section.data.heading || props.section.data.body}>
      <section class={detailStyles.section}>
        <h2 class={detailStyles.sectionTitle}>{props.section.label}</h2>
        <Show when={props.section.data.heading}>
          <p class={styles.heading}>{props.section.data.heading}</p>
        </Show>
        <Show when={props.section.data.body}>
          <p class={styles.body}>{props.section.data.body}</p>
        </Show>
      </section>
    </Show>
  );
}
