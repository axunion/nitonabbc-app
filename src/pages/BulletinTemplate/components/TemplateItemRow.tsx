import { ChevronDown, ChevronUp, Plus, X } from "lucide-solid";
import { For, type JSX, Show } from "solid-js";
import { useLocale } from "@/store/LocaleContext.tsx";
import type {
  InputType,
  TemplateField,
  TemplateItem,
} from "@/types/bulletin.ts";
import { INPUT_TYPES } from "@/utils/template.ts";
import styles from "../BulletinTemplate.module.css";

// Sentinel value in the input-type select that switches an item to compound fields
const FIELDS_MODE = "fields";

interface TemplateItemRowProps {
  item: TemplateItem;
  index: number;
  total: number;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onUpdateItem: (
    index: number,
    field: "type" | "label" | "inputType",
    value: string,
  ) => void;
  onToggleFieldMode: (index: number) => void;
  onAddField: (index: number) => void;
  onRemoveField: (index: number, fieldIndex: number) => void;
  onUpdateField: (
    index: number,
    fieldIndex: number,
    prop: keyof TemplateField,
    value: string,
  ) => void;
  onRemoveItem: (index: number) => void;
}

export function TemplateItemRow(props: TemplateItemRowProps): JSX.Element {
  const { t } = useLocale();

  function inputTypeLabel(it: InputType): string {
    if (it === "member") return t("worshipTemplate.inputTypeMember");
    if (it === "none") return t("worshipTemplate.inputTypeNone");
    return t("worshipTemplate.inputTypeText");
  }

  const selectValue = () =>
    props.item.fields ? FIELDS_MODE : (props.item.inputType ?? "text");

  function handleTypeChange(value: string) {
    if (value === FIELDS_MODE) {
      props.onToggleFieldMode(props.index);
      return;
    }
    if (props.item.fields) props.onToggleFieldMode(props.index);
    props.onUpdateItem(props.index, "inputType", value);
  }

  return (
    <li class={styles.programItem}>
      <div class={styles.programRow}>
        <div class={styles.orderButtons}>
          <button
            type="button"
            class={styles.orderButton}
            onClick={() => props.onMoveUp(props.index)}
            disabled={props.index === 0}
            title={t("worshipTemplate.moveUp")}
          >
            <ChevronUp size={14} stroke-width={1.5} />
          </button>
          <button
            type="button"
            class={styles.orderButton}
            onClick={() => props.onMoveDown(props.index)}
            disabled={props.index === props.total - 1}
            title={t("worshipTemplate.moveDown")}
          >
            <ChevronDown size={14} stroke-width={1.5} />
          </button>
        </div>

        <input
          type="text"
          class={styles.input}
          placeholder={t("worshipTemplate.labelPlaceholder")}
          value={props.item.label}
          onInput={(e) =>
            props.onUpdateItem(props.index, "label", e.currentTarget.value)
          }
        />
        <input
          type="text"
          class={styles.input}
          placeholder={t("worshipTemplate.typePlaceholder")}
          value={props.item.type}
          onInput={(e) =>
            props.onUpdateItem(props.index, "type", e.currentTarget.value)
          }
        />
        <select
          class={styles.select}
          value={selectValue()}
          onChange={(e) => handleTypeChange(e.currentTarget.value)}
          aria-label={t("worshipTemplate.inputType")}
        >
          <For each={INPUT_TYPES}>
            {(it) => <option value={it}>{inputTypeLabel(it)}</option>}
          </For>
          <option value={FIELDS_MODE}>{t("worshipTemplate.useFields")}</option>
        </select>
        <button
          type="button"
          class={styles.removeButton}
          onClick={() => props.onRemoveItem(props.index)}
          title={t("worshipTemplate.deleteItem")}
        >
          <X size={14} stroke-width={1.5} />
        </button>
      </div>

      <Show when={props.item.fields}>
        <div class={styles.programFields}>
          <For each={props.item.fields}>
            {(field, fi) => (
              <div class={styles.fieldRow}>
                <input
                  type="text"
                  class={styles.input}
                  placeholder={t("worshipTemplate.fieldLabelPlaceholder")}
                  value={field.label}
                  onInput={(e) =>
                    props.onUpdateField(
                      props.index,
                      fi(),
                      "label",
                      e.currentTarget.value,
                    )
                  }
                />
                <input
                  type="text"
                  class={styles.input}
                  placeholder={t("worshipTemplate.fieldKeyPlaceholder")}
                  value={field.key}
                  onInput={(e) =>
                    props.onUpdateField(
                      props.index,
                      fi(),
                      "key",
                      e.currentTarget.value,
                    )
                  }
                />
                <select
                  class={styles.select}
                  value={field.inputType}
                  onChange={(e) =>
                    props.onUpdateField(
                      props.index,
                      fi(),
                      "inputType",
                      e.currentTarget.value,
                    )
                  }
                  aria-label={t("worshipTemplate.inputType")}
                >
                  <For each={INPUT_TYPES}>
                    {(it) => <option value={it}>{inputTypeLabel(it)}</option>}
                  </For>
                </select>
                <Show when={(props.item.fields?.length ?? 0) > 1}>
                  <button
                    type="button"
                    class={styles.removeButton}
                    onClick={() => props.onRemoveField(props.index, fi())}
                    title={t("worshipTemplate.deleteItem")}
                  >
                    <X size={14} stroke-width={1.5} />
                  </button>
                </Show>
              </div>
            )}
          </For>
          <button
            type="button"
            class={styles.addFieldButton}
            onClick={() => props.onAddField(props.index)}
          >
            <Plus size={14} stroke-width={1.5} />
            {t("worshipTemplate.addField")}
          </button>
        </div>
      </Show>
    </li>
  );
}
