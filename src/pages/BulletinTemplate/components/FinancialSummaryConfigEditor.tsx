import { Plus, X } from "lucide-solid";
import { For } from "solid-js";
import { useLocale } from "@/store/LocaleContext.tsx";
import type {
  FinancialSummaryItem,
  FinancialSummarySectionTemplate,
} from "@/types/bulletin.ts";
import styles from "../BulletinTemplate.module.css";

type Props = {
  section: FinancialSummarySectionTemplate;
  onUpdateFinancialItems: (
    sectionId: string,
    items: FinancialSummaryItem[],
  ) => void;
};

export function FinancialSummaryConfigEditor(props: Props) {
  const { t } = useLocale();

  const items = () => props.section.config.items;

  function update(
    index: number,
    field: keyof FinancialSummaryItem,
    value: string,
  ) {
    const next = items().map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    props.onUpdateFinancialItems(props.section.id, next);
  }

  function add() {
    props.onUpdateFinancialItems(props.section.id, [
      ...items(),
      { key: "", label: "" },
    ]);
  }

  function remove(index: number) {
    props.onUpdateFinancialItems(
      props.section.id,
      items().filter((_, i) => i !== index),
    );
  }

  return (
    <div class={styles.fieldsSection}>
      <For each={items()}>
        {(item, index) => (
          <div class={styles.fieldRow}>
            <input
              type="text"
              class={styles.input}
              placeholder={t("bulletinTemplate.financialItemLabelPlaceholder")}
              value={item.label}
              onInput={(e) => update(index(), "label", e.currentTarget.value)}
            />
            <input
              type="text"
              class={styles.input}
              placeholder={t("bulletinTemplate.financialItemKeyPlaceholder")}
              value={item.key}
              onInput={(e) => update(index(), "key", e.currentTarget.value)}
            />
            <input
              type="text"
              class={styles.input}
              placeholder={t("bulletinTemplate.financialItemUnitPlaceholder")}
              value={item.unit ?? ""}
              onInput={(e) => update(index(), "unit", e.currentTarget.value)}
            />
            <button
              type="button"
              class={styles.removeButton}
              onClick={() => remove(index())}
            >
              <X size={14} stroke-width={1.5} />
            </button>
          </div>
        )}
      </For>
      <button type="button" class={styles.addFieldButton} onClick={add}>
        <Plus size={14} stroke-width={1.5} />
        {t("bulletinTemplate.addFinancialItem")}
      </button>
    </div>
  );
}
