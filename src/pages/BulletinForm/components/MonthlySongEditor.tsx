import { useLocale } from "@/store/LocaleContext.tsx";
import type { MonthlySongSectionData } from "@/types/bulletin.ts";
import styles from "../editorFields.module.css";

type Props = {
  section: MonthlySongSectionData;
  onUpdate: (data: { title: string; lyrics: string }) => void;
};

export function MonthlySongEditor(props: Props) {
  const { t } = useLocale();

  return (
    <>
      <input
        type="text"
        class={styles.input}
        value={props.section.data.title}
        onInput={(e) =>
          props.onUpdate({
            title: e.currentTarget.value,
            lyrics: props.section.data.lyrics,
          })
        }
        placeholder={t("bulletinForm.songTitlePlaceholder")}
      />
      <textarea
        class={styles.textarea}
        value={props.section.data.lyrics}
        onInput={(e) =>
          props.onUpdate({
            title: props.section.data.title,
            lyrics: e.currentTarget.value,
          })
        }
        placeholder={t("bulletinForm.songLyricsPlaceholder")}
        rows={6}
      />
    </>
  );
}
