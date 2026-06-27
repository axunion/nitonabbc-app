import { Show } from "solid-js";
import type { WeeklyVerseSectionData } from "@/types/bulletin.ts";
import sectionStyles from "../Bulletin.module.css";
import styles from "./WeeklyVerseView.module.css";

type Props = {
  section: WeeklyVerseSectionData;
};

export function WeeklyVerseView(props: Props) {
  return (
    <Show when={props.section.data.text || props.section.data.reference}>
      <section class={sectionStyles.section}>
        <h2 class={sectionStyles.sectionTitle}>{props.section.label}</h2>
        <div class={sectionStyles.sectionBody}>
          <Show when={props.section.data.reference}>
            <p class={styles.reference}>{props.section.data.reference}</p>
          </Show>
          <p class={styles.verseText}>{props.section.data.text}</p>
        </div>
      </section>
    </Show>
  );
}
