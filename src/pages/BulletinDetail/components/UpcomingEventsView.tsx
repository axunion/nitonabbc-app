import { For, Show } from "solid-js";
import type { UpcomingEventsSectionData } from "@/types/bulletin.ts";
import styles from "../BulletinDetail.module.css";

type Props = {
  section: UpcomingEventsSectionData;
};

export function UpcomingEventsView(props: Props) {
  return (
    <Show when={props.section.data.length > 0}>
      <section class={styles.section}>
        <h2 class={styles.sectionTitle}>{props.section.label}</h2>
        <ul class={styles.announcementList}>
          <For each={props.section.data}>
            {(event) => (
              <li class={styles.announcementItem}>
                <span class={styles.announcementHeading}>{event.date}</span>
                {event.description}
              </li>
            )}
          </For>
        </ul>
      </section>
    </Show>
  );
}
