import { For, Show } from "solid-js";
import {
  DEFAULT_WEEKLY_PRAYER_DAYS,
  type WeeklyPrayerDay,
  type WeeklyPrayerSectionData,
} from "@/types/bulletin.ts";
import styles from "../BulletinDetail.module.css";
import viewStyles from "./WeeklyPrayerView.module.css";

type Props = {
  section: WeeklyPrayerSectionData;
  templateDays?: WeeklyPrayerDay[];
};

export function WeeklyPrayerView(props: Props) {
  const days = () => {
    const td = props.templateDays;
    return td && td.length > 0 ? td : DEFAULT_WEEKLY_PRAYER_DAYS;
  };

  const entries = () =>
    days().map((day) => {
      const val = props.section.data[day.key];
      const texts = Array.isArray(val) ? val : val ? [val as string] : [];
      return { label: day.label, key: day.key, texts };
    });

  const hasAny = () => entries().some((e) => e.texts.some((t) => t.trim()));

  return (
    <Show when={hasAny()}>
      <section class={styles.section}>
        <h2 class={styles.sectionTitle}>{props.section.label}</h2>
        <dl class={viewStyles.prayerList}>
          <For each={entries()}>
            {(entry) => (
              <Show when={entry.texts.some((t) => t.trim())}>
                <dt class={viewStyles.day}>{entry.label}</dt>
                <dd class={viewStyles.texts}>
                  <ul class={viewStyles.textList}>
                    <For each={entry.texts.filter((t) => t.trim())}>
                      {(text) => <li class={viewStyles.textItem}>{text}</li>}
                    </For>
                  </ul>
                </dd>
              </Show>
            )}
          </For>
        </dl>
      </section>
    </Show>
  );
}
