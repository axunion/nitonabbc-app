import { Minus, Plus } from "lucide-solid";
import { For } from "solid-js";
import { useLocale } from "@/store/LocaleContext.tsx";
import type { AnnouncementsSectionData } from "@/types/bulletin.ts";
import styles from "../editorFields.module.css";

type Props = {
  section: AnnouncementsSectionData;
  onAdd: (sectionId: string) => void;
  onRemove: (sectionId: string, index: number) => void;
  onUpdate: (sectionId: string, index: number, value: string) => void;
};

export function AnnouncementsEditor(props: Props) {
  const { t } = useLocale();

  return (
    <>
      <For each={props.section.data}>
        {(a, index) => (
          <div class={styles.repeatRow}>
            <textarea
              class={styles.textarea}
              rows={3}
              value={a.content}
              onInput={(e) =>
                props.onUpdate(props.section.id, index(), e.currentTarget.value)
              }
              placeholder={t("bulletinForm.announcementPlaceholder")}
            />
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
        {t("bulletinForm.addAnnouncement")}
      </button>
    </>
  );
}
