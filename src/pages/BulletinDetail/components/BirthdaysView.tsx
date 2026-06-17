import { For, Show } from "solid-js";
import type { BirthdaysSectionData } from "@/types/bulletin.ts";
import styles from "../BulletinDetail.module.css";

type Props = {
  section: BirthdaysSectionData;
};

export function BirthdaysView(props: Props) {
  return (
    <Show when={props.section.data.length > 0}>
      <section class={styles.section}>
        <h2 class={styles.sectionTitle}>{props.section.label}</h2>
        <ul class={styles.announcementList}>
          <For each={props.section.data}>
            {(birthday) => (
              <li class={styles.announcementItem}>
                <span class={styles.announcementHeading}>{birthday.day}</span>
                {birthday.name}
              </li>
            )}
          </For>
        </ul>
      </section>
    </Show>
  );
}
