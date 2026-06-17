import { Plus, X } from "lucide-solid";
import { For } from "solid-js";
import { useLocale } from "@/store/LocaleContext.tsx";
import type {
  ServiceMetaFieldDef,
  ServiceMetaSectionTemplate,
} from "@/types/bulletin.ts";
import styles from "../BulletinTemplate.module.css";

type Props = {
  section: ServiceMetaSectionTemplate;
  onUpdateFieldDefs: (
    sectionId: string,
    fieldDefs: ServiceMetaFieldDef[],
  ) => void;
};

export function ServiceMetaConfigEditor(props: Props) {
  const { t } = useLocale();

  const fieldDefs = () => props.section.config.fieldDefs;

  function update(
    index: number,
    field: keyof ServiceMetaFieldDef,
    value: string,
  ) {
    const next = fieldDefs().map((def, i) =>
      i === index ? { ...def, [field]: value } : def,
    );
    props.onUpdateFieldDefs(props.section.id, next);
  }

  function add() {
    props.onUpdateFieldDefs(props.section.id, [
      ...fieldDefs(),
      { key: "", label: "", inputType: "text" as const },
    ]);
  }

  function remove(index: number) {
    props.onUpdateFieldDefs(
      props.section.id,
      fieldDefs().filter((_, i) => i !== index),
    );
  }

  return (
    <div class={styles.fieldsSection}>
      <For each={fieldDefs()}>
        {(def, index) => (
          <div class={styles.fieldRow}>
            <input
              type="text"
              class={styles.input}
              placeholder={t("bulletinTemplate.serviceMetaLabelPlaceholder")}
              value={def.label}
              onInput={(e) => update(index(), "label", e.currentTarget.value)}
            />
            <input
              type="text"
              class={styles.input}
              placeholder={t("bulletinTemplate.serviceMetaKeyPlaceholder")}
              value={def.key}
              onInput={(e) => update(index(), "key", e.currentTarget.value)}
            />
            <select
              class={styles.select}
              value={def.inputType}
              onChange={(e) =>
                update(index(), "inputType", e.currentTarget.value)
              }
              aria-label={t("bulletinTemplate.serviceMetaInputType")}
            >
              <option value="text">text</option>
              <option value="member">member</option>
              <option value="time">time</option>
            </select>
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
        {t("bulletinTemplate.addFieldDef")}
      </button>
    </div>
  );
}
