import { For } from "solid-js";
import { useLocale } from "@/store/LocaleContext.tsx";
import type {
  AssignmentsSectionData,
  Member,
  SectionTemplate,
} from "@/types/bulletin.ts";
import { findSectionTemplate } from "@/utils/bulletin.ts";
import styles from "../editorFields.module.css";
import { MemberSelect } from "./MemberSelect.tsx";

type Props = {
  section: AssignmentsSectionData;
  template: SectionTemplate[];
  members: Member[] | undefined;
  onUpdate: (sectionId: string, role: string, value: string) => void;
};

export function AssignmentsEditor(props: Props) {
  const { t } = useLocale();

  const roles = () => {
    const tmpl = findSectionTemplate(props.template, props.section.id);
    return tmpl?.type === "assignments" ? tmpl.config.roles : [];
  };

  return (
    <For each={roles()}>
      {(role) => (
        <div class={styles.field}>
          <label for={`assign-${role}`} class={styles.fieldLabel}>
            {role}
          </label>
          <MemberSelect
            id={`assign-${role}`}
            value={props.section.data[role]}
            members={props.members}
            role={role}
            placeholder={t("bulletinForm.selectAssignee")}
            onChange={(value) => props.onUpdate(props.section.id, role, value)}
          />
        </div>
      )}
    </For>
  );
}
