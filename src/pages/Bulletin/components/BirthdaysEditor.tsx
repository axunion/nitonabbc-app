import { Minus, Plus } from "lucide-solid";
import { For } from "solid-js";
import { useLocale } from "@/store/LocaleContext.tsx";
import type { Birthday, BirthdaysSectionData } from "@/types/bulletin.ts";
import styles from "../editorFields.module.css";

type Props = {
  section: BirthdaysSectionData;
  onAdd: (sectionId: string) => void;
  onRemove: (sectionId: string, index: number) => void;
  onUpdate: (sectionId: string, index: number, value: Birthday) => void;
};

export function BirthdaysEditor(props: Props) {
  const { t } = useLocale();

  return (
    <>
      <For each={props.section.data}>
        {(birthday, index) => (
          <div class={styles.repeatRow}>
            <div class={styles.pairGrid}>
              <input
                type="text"
                class={styles.input}
                placeholder={t("bulletinForm.birthdayDayPlaceholder")}
                value={birthday.day}
                onInput={(e) =>
                  props.onUpdate(props.section.id, index(), {
                    ...birthday,
                    day: e.currentTarget.value,
                  })
                }
              />
              <input
                type="text"
                class={styles.input}
                placeholder={t("bulletinForm.birthdayNamePlaceholder")}
                value={birthday.name}
                onInput={(e) =>
                  props.onUpdate(props.section.id, index(), {
                    ...birthday,
                    name: e.currentTarget.value,
                  })
                }
              />
            </div>
            <div class={styles.repeatItemActions}>
              <button
                type="button"
                class={styles.removeButton}
                onClick={() => props.onRemove(props.section.id, index())}
              >
                <Minus size={14} stroke-width={1.5} />
                {t("common.delete")}
              </button>
            </div>
          </div>
        )}
      </For>
      <button
        type="button"
        class={styles.addButton}
        onClick={() => props.onAdd(props.section.id)}
      >
        <Plus size={16} stroke-width={1.5} />
        {t("bulletinForm.addBirthday")}
      </button>
    </>
  );
}
