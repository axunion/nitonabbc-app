import { Minus, Plus } from "lucide-solid";
import { For } from "solid-js";
import { useLocale } from "@/store/LocaleContext.tsx";
import {
  DEFAULT_WEEKLY_PRAYER_DAYS,
  type SectionTemplate,
  type WeeklyPrayerSectionData,
} from "@/types/bulletin.ts";
import { findSectionTemplate } from "@/utils/bulletin.ts";
import styles from "../BulletinForm.module.css";
import prayerStyles from "./WeeklyPrayerEditor.module.css";

type Props = {
  section: WeeklyPrayerSectionData;
  template: SectionTemplate[];
  onUpdate: (data: Record<string, string[]>) => void;
};

export function WeeklyPrayerEditor(props: Props) {
  const { t } = useLocale();

  const days = () => {
    const tmpl = findSectionTemplate(props.template, props.section.id);
    if (tmpl?.type === "weekly-prayer" && tmpl.config.days.length > 0) {
      return tmpl.config.days;
    }
    return DEFAULT_WEEKLY_PRAYER_DAYS;
  };

  const getItems = (key: string): string[] => props.section.data[key] ?? [];

  const updateItem = (key: string, index: number, value: string) => {
    const items = getItems(key).map((v, i) => (i === index ? value : v));
    props.onUpdate({ ...props.section.data, [key]: items });
  };

  const addItem = (key: string) => {
    props.onUpdate({
      ...props.section.data,
      [key]: [...getItems(key), ""],
    });
  };

  const removeItem = (key: string, index: number) => {
    props.onUpdate({
      ...props.section.data,
      [key]: getItems(key).filter((_, i) => i !== index),
    });
  };

  return (
    <For each={days()}>
      {(day) => (
        <div class={prayerStyles.daySection}>
          <div class={prayerStyles.dayHeader}>
            <span class={styles.fieldLabel}>{day.label}</span>
            <button
              type="button"
              class={prayerStyles.addItemButton}
              onClick={() => addItem(day.key)}
            >
              <Plus size={14} stroke-width={1.5} />
              {t("bulletinForm.addPrayerItem")}
            </button>
          </div>
          <For each={getItems(day.key)}>
            {(item, i) => (
              <div class={prayerStyles.itemRow}>
                <input
                  type="text"
                  class={styles.input}
                  placeholder={t("bulletinForm.prayerPlaceholder")}
                  value={item}
                  onInput={(e) =>
                    updateItem(day.key, i(), e.currentTarget.value)
                  }
                />
                <button
                  type="button"
                  class={prayerStyles.removeItemButton}
                  onClick={() => removeItem(day.key, i())}
                >
                  <Minus size={14} stroke-width={1.5} />
                </button>
              </div>
            )}
          </For>
        </div>
      )}
    </For>
  );
}
