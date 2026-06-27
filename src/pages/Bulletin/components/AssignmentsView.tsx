import { For, Show } from "solid-js";
import type { AssignmentsSectionData, Member } from "@/types/bulletin.ts";
import { getMemberName } from "@/utils/bulletin.ts";
import styles from "../Bulletin.module.css";

type Props = {
  section: AssignmentsSectionData;
  members: Member[] | undefined;
};

export function AssignmentsView(props: Props) {
  const entries = () => Object.entries(props.section.data).filter(([, v]) => v);

  const resolveName = (value: string) =>
    getMemberName(props.members, Number(value)) ?? value;

  return (
    <Show when={entries().length > 0}>
      <section class={styles.section}>
        <h2 class={styles.sectionTitle}>{props.section.label}</h2>
        <div class={styles.sectionBody}>
          <dl class={styles.assignmentList}>
            <For each={entries()}>
              {([role, value]) => (
                <>
                  <dt class={styles.assignmentRole}>{role}</dt>
                  <dd class={styles.assignmentPerson}>{resolveName(value)}</dd>
                </>
              )}
            </For>
          </dl>
        </div>
      </section>
    </Show>
  );
}
