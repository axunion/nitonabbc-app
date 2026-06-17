import { useLocale } from "@/store/LocaleContext.tsx";
import type { WeeklyVerseSectionData } from "@/types/bulletin.ts";
import styles from "../BulletinForm.module.css";

type Props = {
  section: WeeklyVerseSectionData;
  onUpdate: (data: { reference: string; text: string }) => void;
};

export function WeeklyVerseEditor(props: Props) {
  const { t } = useLocale();

  return (
    <>
      <div class={styles.formGroup}>
        <input
          type="text"
          class={styles.input}
          value={props.section.data.reference}
          onInput={(e) =>
            props.onUpdate({
              reference: e.currentTarget.value,
              text: props.section.data.text,
            })
          }
          placeholder={t("bulletinForm.verseReferencePlaceholder")}
        />
      </div>
      <textarea
        class={styles.textarea}
        rows={4}
        value={props.section.data.text}
        onInput={(e) =>
          props.onUpdate({
            reference: props.section.data.reference,
            text: e.currentTarget.value,
          })
        }
        placeholder={t("bulletinForm.verseTextPlaceholder")}
      />
    </>
  );
}
