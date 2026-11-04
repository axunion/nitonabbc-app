import { For, type JSX } from "solid-js";
import { useLocale } from "@/store/LocaleContext.tsx";
import type { Member, TemplateItem, WorshipItem } from "@/types/bulletin.ts";
import { getTemplateItem } from "@/utils/bulletin.ts";
import styles from "../editorFields.module.css";
import { MemberSelect } from "./MemberSelect.tsx";

interface WorshipInputProps {
  item: WorshipItem;
  index: number;
  template: TemplateItem[] | undefined;
  members: Member[] | undefined;
  onUpdateDetails: (index: number, value: string) => void;
  onUpdateFieldValue: (index: number, key: string, value: string) => void;
}

type PlaceholderKey =
  | "bulletinForm.hymnPlaceholder"
  | "bulletinForm.scripturePlaceholder"
  | "bulletinForm.sermonTitlePlaceholder";

// Placeholder hints for the default template's keys; other keys get none
function placeholderKey(key: string): PlaceholderKey | undefined {
  if (key.startsWith("hymn")) return "bulletinForm.hymnPlaceholder";
  if (key === "reading" || key === "scripture")
    return "bulletinForm.scripturePlaceholder";
  if (key === "title") return "bulletinForm.sermonTitlePlaceholder";
  return undefined;
}

export function WorshipInput(props: WorshipInputProps): JSX.Element {
  const { t } = useLocale();
  const tmpl = () => getTemplateItem(props.template, props.item.type);
  const inputType = () => tmpl()?.inputType ?? "text";
  const hint = (key: string) => {
    const k = placeholderKey(key);
    return k ? t(k) : undefined;
  };

  // Compound fields mode
  if ((tmpl()?.fields?.length ?? 0) > 0) {
    return (
      <div class={styles.compoundFields}>
        <For each={tmpl()?.fields ?? []}>
          {(field) => {
            if (field.inputType === "none") return null;
            const fieldId = `worship-field-${props.index}-${field.key}`;
            if (field.inputType === "member") {
              return (
                <div class={styles.field}>
                  <label for={fieldId} class={styles.fieldCaption}>
                    {field.label}
                  </label>
                  <MemberSelect
                    id={fieldId}
                    value={props.item.fieldValues?.[field.key]}
                    members={props.members}
                    role={field.role}
                    placeholder={t("bulletinForm.selectMember")}
                    onChange={(val) =>
                      props.onUpdateFieldValue(props.index, field.key, val)
                    }
                  />
                </div>
              );
            }
            return (
              <div class={styles.field}>
                <label for={fieldId} class={styles.fieldCaption}>
                  {field.label}
                </label>
                <input
                  id={fieldId}
                  type="text"
                  class={styles.input}
                  placeholder={hint(field.key)}
                  value={props.item.fieldValues?.[field.key] ?? ""}
                  onInput={(e) =>
                    props.onUpdateFieldValue(
                      props.index,
                      field.key,
                      e.currentTarget.value,
                    )
                  }
                />
              </div>
            );
          }}
        </For>
      </div>
    );
  }

  // None type — no input needed
  if (inputType() === "none") {
    return null;
  }

  // Member select
  if (inputType() === "member") {
    return (
      <MemberSelect
        value={props.item.details}
        members={props.members}
        role={tmpl()?.role}
        placeholder={t("bulletinForm.selectMember")}
        onChange={(val) => props.onUpdateDetails(props.index, val)}
      />
    );
  }

  return (
    <input
      type="text"
      class={styles.input}
      placeholder={hint(props.item.type)}
      value={props.item.details ?? ""}
      onInput={(e) => props.onUpdateDetails(props.index, e.currentTarget.value)}
    />
  );
}
