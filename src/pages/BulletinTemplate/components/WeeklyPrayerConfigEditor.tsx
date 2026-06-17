import { For } from "solid-js";
import { useLocale } from "@/store/LocaleContext.tsx";
import type {
  WeeklyPrayerDay,
  WeeklyPrayerSectionTemplate,
} from "@/types/bulletin.ts";
import styles from "../BulletinTemplate.module.css";
import { StringListEditor } from "./StringListEditor.tsx";

type Props = {
  section: WeeklyPrayerSectionTemplate;
  onUpdateDays: (sectionId: string, days: WeeklyPrayerDay[]) => void;
};

export function WeeklyPrayerConfigEditor(props: Props) {
  const { t } = useLocale();

  function updateDefaults(dayKey: string, defaults: string[]) {
    const days = props.section.config.days.map((d) =>
      d.key === dayKey ? { ...d, defaults } : d,
    );
    props.onUpdateDays(props.section.id, days);
  }

  return (
    <div class={styles.fieldsSection}>
      <For each={props.section.config.days}>
        {(day) => (
          <div class={styles.dayGroup}>
            <span class={styles.dayGroupLabel}>{day.label}</span>
            <StringListEditor
              items={day.defaults}
              onChange={(items) => updateDefaults(day.key, items)}
              placeholder={t("bulletinTemplate.prayerDefaultPlaceholder")}
              addLabel={t("bulletinTemplate.addPrayerDefault")}
            />
          </div>
        )}
      </For>
    </div>
  );
}
