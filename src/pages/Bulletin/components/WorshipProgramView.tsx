import { For, Show } from "solid-js";
import { useLocale } from "@/store/LocaleContext.tsx";
import type {
  Member,
  SectionTemplate,
  WorshipProgramSectionData,
} from "@/types/bulletin.ts";
import {
  findSectionTemplate,
  getMemberName,
  getTemplateItem,
} from "@/utils/bulletin.ts";
import styles from "../Bulletin.module.css";

type Props = {
  section: WorshipProgramSectionData;
  template: SectionTemplate[];
  members: Member[] | undefined;
};

export function WorshipProgramView(props: Props) {
  const { t } = useLocale();
  const items = () => {
    const tmpl = findSectionTemplate(props.template, props.section.id);
    return tmpl?.type === "worship-program" ? tmpl.config.items : [];
  };

  return (
    <Show when={props.section.data.length > 0}>
      <section class={styles.section}>
        <h2 class={styles.sectionTitle}>{props.section.label}</h2>
        <div class={styles.sectionBody}>
          <ul class={styles.worshipList}>
            <For each={props.section.data}>
              {(item) => {
                const tmpl = () => getTemplateItem(items(), item.type);
                // Items that take input but have none yet are marked so
                // readers can tell them apart from items like the prelude
                const isUnfilled = () => {
                  const fields = (tmpl()?.fields ?? []).filter(
                    (f) => f.inputType !== "none",
                  );
                  if (fields.length > 0) {
                    return fields.every(
                      (f) => !item.fieldValues?.[f.key]?.trim(),
                    );
                  }
                  return (
                    (tmpl()?.inputType ?? "text") !== "none" &&
                    !item.details?.trim()
                  );
                };

                return (
                  <li class={styles.worshipItem}>
                    <div class={styles.worshipItemHeader}>
                      <span class={styles.worshipLabel}>{item.label}</span>
                      <Show when={isUnfilled()}>
                        <span class={styles.worshipUnfilled}>
                          {t("bulletin.notFilled")}
                        </span>
                      </Show>
                    </div>
                    <Show
                      when={tmpl()?.fields && (tmpl()?.fields?.length ?? 0) > 0}
                    >
                      <div class={styles.compoundDetails}>
                        <For each={tmpl()?.fields ?? []}>
                          {(field) => (
                            <Show
                              when={
                                field.inputType !== "none" &&
                                item.fieldValues?.[field.key]
                              }
                            >
                              <div class={styles.compoundField}>
                                <span class={styles.compoundFieldLabel}>
                                  {field.label}
                                </span>
                                <span class={styles.compoundFieldValue}>
                                  {field.inputType === "member"
                                    ? (getMemberName(
                                        props.members,
                                        Number(item.fieldValues?.[field.key]),
                                      ) ?? item.fieldValues?.[field.key])
                                    : item.fieldValues?.[field.key]}
                                </span>
                              </div>
                            </Show>
                          )}
                        </For>
                      </div>
                    </Show>
                    <Show
                      when={
                        !(
                          tmpl()?.fields && (tmpl()?.fields?.length ?? 0) > 0
                        ) && item.details
                      }
                    >
                      <span class={styles.worshipDetails}>
                        {tmpl()?.inputType === "member"
                          ? (getMemberName(
                              props.members,
                              Number(item.details),
                            ) ?? item.details)
                          : item.details}
                      </span>
                    </Show>
                  </li>
                );
              }}
            </For>
          </ul>
        </div>
      </section>
    </Show>
  );
}
