import { For, Show } from "solid-js";
import type {
  FinancialSummarySectionData,
  FinancialSummarySectionTemplate,
  SectionTemplate,
} from "@/types/bulletin.ts";
import { findSectionTemplate } from "@/utils/bulletin.ts";
import styles from "../BulletinDetail.module.css";

type Props = {
  section: FinancialSummarySectionData;
  template: SectionTemplate[];
};

export function FinancialSummaryView(props: Props) {
  const items = () => {
    const tmpl = findSectionTemplate(props.template, props.section.id);
    return tmpl?.type === "financial-summary"
      ? (tmpl as FinancialSummarySectionTemplate).config.items
      : [];
  };

  const visibleItems = () =>
    items().filter((item) => {
      const entry = props.section.data[item.key];
      return entry && entry.amount.trim() !== "";
    });

  return (
    <Show when={visibleItems().length > 0}>
      <section class={styles.section}>
        <h2 class={styles.sectionTitle}>{props.section.label}</h2>
        <dl class={styles.assignmentList}>
          <For each={visibleItems()}>
            {(item) => {
              const entry = () => props.section.data[item.key];
              const displayAmount = () =>
                item.unit
                  ? `${entry()?.amount} ${item.unit}`
                  : (entry()?.amount ?? "");
              return (
                <>
                  <dt class={styles.assignmentRole}>{item.label}</dt>
                  <dd class={styles.assignmentPerson}>
                    {displayAmount()}
                    <Show when={entry()?.note}>
                      {" "}
                      <span>({entry()?.note})</span>
                    </Show>
                  </dd>
                </>
              );
            }}
          </For>
        </dl>
      </section>
    </Show>
  );
}
