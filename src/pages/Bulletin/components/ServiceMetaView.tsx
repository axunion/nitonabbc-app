import { For, Show } from "solid-js";
import type {
  SectionTemplate,
  ServiceMetaSectionData,
  ServiceMetaSectionTemplate,
} from "@/types/bulletin.ts";
import styles from "../Bulletin.module.css";

type Props = {
  section: ServiceMetaSectionData;
  template: SectionTemplate[];
};

export function ServiceMetaView(props: Props) {
  const tmpl = () =>
    props.template.find(
      (t): t is ServiceMetaSectionTemplate =>
        t.id === props.section.id && t.type === "service-meta",
    );

  const hasValues = () => {
    const t = tmpl();
    if (!t) return false;
    return t.config.fieldDefs.some((def) =>
      props.section.data.fieldValues[def.key]?.trim(),
    );
  };

  return (
    <Show when={hasValues()}>
      <section class={styles.section}>
        <h2 class={styles.sectionTitle}>{props.section.label}</h2>
        <div class={styles.sectionBody}>
          <dl class={styles.assignmentList}>
            <For each={tmpl()?.config.fieldDefs ?? []}>
              {(def) => {
                const value = () =>
                  props.section.data.fieldValues[def.key]?.trim() ?? "";
                return (
                  <Show when={value()}>
                    <dt class={styles.assignmentRole}>{def.label}</dt>
                    <dd class={styles.assignmentPerson}>{value()}</dd>
                  </Show>
                );
              }}
            </For>
          </dl>
        </div>
      </section>
    </Show>
  );
}
