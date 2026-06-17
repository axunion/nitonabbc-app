import { For, Show } from "solid-js";
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
import styles from "../BulletinDetail.module.css";

type Props = {
  section: WorshipProgramSectionData;
  template: SectionTemplate[];
  members: Member[] | undefined;
};

export function WorshipProgramView(props: Props) {
  const items = () => {
    const tmpl = findSectionTemplate(props.template, props.section.id);
    return tmpl?.type === "worship-program" ? tmpl.config.items : [];
  };

  return (
    <Show when={props.section.data.length > 0}>
      <section class={styles.section}>
        <h2 class={styles.sectionTitle}>{props.section.label}</h2>
        <ul class={styles.worshipList}>
          <For each={props.section.data}>
            {(item) => {
              const tmpl = () => getTemplateItem(items(), item.type);

              return (
                <li class={styles.worshipItem}>
                  <div class={styles.worshipItemHeader}>
                    <span class={styles.worshipLabel}>{item.label}</span>
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
                      !(tmpl()?.fields && (tmpl()?.fields?.length ?? 0) > 0) &&
                      item.details
                    }
                  >
                    <span class={styles.worshipDetails}>
                      {tmpl()?.inputType === "member"
                        ? (getMemberName(props.members, Number(item.details)) ??
                          item.details)
                        : item.details}
                    </span>
                  </Show>
                </li>
              );
            }}
          </For>
        </ul>
      </section>
    </Show>
  );
}
