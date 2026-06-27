import { For } from "solid-js";
import { useLocale } from "@/store/LocaleContext.tsx";
import type {
  FinancialSummarySectionData,
  FinancialSummarySectionTemplate,
  SectionTemplate,
} from "@/types/bulletin.ts";
import { findSectionTemplate } from "@/utils/bulletin.ts";
import styles from "../editorFields.module.css";

type Props = {
  section: FinancialSummarySectionData;
  template: SectionTemplate[];
  onUpdate: (
    sectionId: string,
    key: string,
    field: "amount" | "note",
    value: string,
  ) => void;
};

export function FinancialSummaryEditor(props: Props) {
  const { t } = useLocale();

  const items = () => {
    const tmpl = findSectionTemplate(props.template, props.section.id);
    return tmpl?.type === "financial-summary"
      ? (tmpl as FinancialSummarySectionTemplate).config.items
      : [];
  };

  return (
    <For each={items()}>
      {(item) => (
        <div class={styles.field}>
          <span class={styles.fieldLabel}>
            {item.label}
            {item.unit ? `（${item.unit}）` : ""}
          </span>
          <div class={styles.pairGrid}>
            <input
              type="text"
              class={styles.input}
              placeholder={t("bulletinForm.financialAmountPlaceholder")}
              aria-label={item.label}
              value={props.section.data[item.key]?.amount ?? ""}
              onInput={(e) =>
                props.onUpdate(
                  props.section.id,
                  item.key,
                  "amount",
                  e.currentTarget.value,
                )
              }
            />
            <input
              type="text"
              class={styles.input}
              placeholder={t("bulletinForm.financialNotePlaceholder")}
              aria-label={`${item.label} note`}
              value={props.section.data[item.key]?.note ?? ""}
              onInput={(e) =>
                props.onUpdate(
                  props.section.id,
                  item.key,
                  "note",
                  e.currentTarget.value,
                )
              }
            />
          </div>
        </div>
      )}
    </For>
  );
}
