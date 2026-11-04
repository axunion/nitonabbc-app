import { createMemo, createSignal, For, type JSX, Show } from "solid-js";
import { useLocale } from "@/store/LocaleContext.tsx";
import type { Member } from "@/types/bulletin.ts";
import { filterMembersByRole } from "@/utils/bulletin.ts";
import styles from "../editorFields.module.css";

const OTHER = "__other__";

// Member fields store a member id; any non-numeric value is a name typed in
// for someone outside the roster (e.g. a guest preacher).
function isFreeText(value: string | undefined): boolean {
  return !!value && !/^\d+$/.test(value);
}

type Props = {
  id?: string;
  value: string | undefined;
  members: Member[] | undefined;
  role?: string;
  placeholder: string;
  onChange: (value: string) => void;
};

export function MemberSelect(props: Props): JSX.Element {
  const { t } = useLocale();
  const candidates = createMemo(() =>
    filterMembersByRole(props.members, props.role),
  );
  const [otherMode, setOtherMode] = createSignal(isFreeText(props.value));
  // A role filter that leaves nobody usually means roles are not set up yet
  const noCandidates = () =>
    (props.members?.length ?? 0) > 0 && candidates().length === 0;

  return (
    <div class={styles.memberSelect}>
      <select
        id={props.id}
        class={styles.select}
        value={otherMode() ? OTHER : (props.value ?? "")}
        onChange={(e) => {
          const v = e.currentTarget.value;
          setOtherMode(v === OTHER);
          props.onChange(v === OTHER ? "" : v);
        }}
      >
        <option value="">{props.placeholder}</option>
        <For each={candidates()}>
          {(m) => <option value={String(m.id)}>{m.name}</option>}
        </For>
        <option value={OTHER}>{t("bulletinForm.otherPerson")}</option>
      </select>
      <Show when={otherMode()}>
        <input
          type="text"
          class={styles.input}
          aria-label={t("bulletinForm.otherPersonName")}
          placeholder={t("bulletinForm.otherPersonName")}
          value={props.value ?? ""}
          onInput={(e) => props.onChange(e.currentTarget.value.trimStart())}
        />
      </Show>
      <Show when={noCandidates() && !otherMode()}>
        <p class={styles.fieldCaption}>
          {t("bulletinForm.noRoleMembers", { role: props.role ?? "" })}
        </p>
      </Show>
    </div>
  );
}
