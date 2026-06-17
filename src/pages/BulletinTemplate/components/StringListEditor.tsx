import { Plus, X } from "lucide-solid";
import { For, Show } from "solid-js";
import styles from "../BulletinTemplate.module.css";

type Props = {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  addLabel: string;
  minItems?: number;
};

export function StringListEditor(props: Props) {
  const min = () => props.minItems ?? 0;

  function update(index: number, value: string) {
    props.onChange(props.items.map((item, i) => (i === index ? value : item)));
  }

  function add() {
    props.onChange([...props.items, ""]);
  }

  function remove(index: number) {
    props.onChange(props.items.filter((_, i) => i !== index));
  }

  return (
    <div class={styles.fieldsSection}>
      <For each={props.items}>
        {(item, index) => (
          <div class={styles.fieldRow}>
            <input
              type="text"
              class={styles.input}
              value={item}
              placeholder={props.placeholder}
              onInput={(e) => update(index(), e.currentTarget.value)}
            />
            <Show when={props.items.length > min()}>
              <button
                type="button"
                class={styles.removeButton}
                onClick={() => remove(index())}
              >
                <X size={14} stroke-width={1.5} />
              </button>
            </Show>
          </div>
        )}
      </For>
      <button type="button" class={styles.addFieldButton} onClick={add}>
        <Plus size={14} stroke-width={1.5} />
        {props.addLabel}
      </button>
    </div>
  );
}
