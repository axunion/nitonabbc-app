import { For, Show } from "solid-js";
import type { AnnouncementsSectionData } from "@/types/bulletin.ts";
import styles from "../Bulletin.module.css";

type Props = {
  section: AnnouncementsSectionData;
};

export function AnnouncementsView(props: Props) {
  return (
    <Show when={props.section.data.length > 0}>
      <section class={styles.section}>
        <h2 class={styles.sectionTitle}>{props.section.label}</h2>
        <div class={styles.sectionBody}>
          <ul class={styles.announcementList}>
            <For each={props.section.data}>
              {(a) => (
                <li class={styles.announcementItem}>
                  <Show when={a.heading}>
                    <span class={styles.announcementHeading}>{a.heading}</span>
                  </Show>
                  {a.content}
                </li>
              )}
            </For>
          </ul>
        </div>
      </section>
    </Show>
  );
}
