import { Dialog } from "@kobalte/core/dialog";
import {
  ClipboardCopy,
  Link,
  Link2Off,
  Pencil,
  Plus,
  RefreshCw,
  UserMinus,
} from "lucide-solid";
import { createResource, createSignal, For, Show } from "solid-js";
import {
  type AdminMember,
  createMember,
  deactivateMember,
  fetchAdminMembers,
  reinviteMember,
  updateMember,
} from "@/api/members.ts";
import { ConfirmDialog } from "@/components/ConfirmDialog/index.ts";
import { showToast } from "@/components/Toast/index.ts";
import { useAuth } from "@/store/AuthContext.tsx";
import { useLocale } from "@/store/LocaleContext.tsx";
import { SERVICE_ROLES } from "@/types/bulletin.ts";
import styles from "./Management.module.css";

type PendingAction = {
  title: string;
  description: string;
  confirmLabel: string;
  variant: "default" | "destructive";
  run: () => Promise<void>;
};

export function Management() {
  const { user } = useAuth();
  const { t } = useLocale();

  const [members, { refetch }] = createResource(fetchAdminMembers);

  // Add/edit dialog state
  const [dialogOpen, setDialogOpen] = createSignal(false);
  const [editingMember, setEditingMember] = createSignal<AdminMember | null>(
    null,
  );
  const [formName, setFormName] = createSignal("");
  const [formRole, setFormRole] = createSignal<"admin" | "member">("member");
  const [formServiceRoles, setFormServiceRoles] = createSignal<string[]>([]);
  const [submitting, setSubmitting] = createSignal(false);

  // Confirm dialog state
  const [pending, setPending] = createSignal<PendingAction | null>(null);
  const confirmOpen = () => pending() !== null;

  function openAddDialog() {
    setEditingMember(null);
    setFormName("");
    setFormRole("member");
    setFormServiceRoles([]);
    setDialogOpen(true);
  }

  function openEditDialog(member: AdminMember) {
    setEditingMember(member);
    setFormName(member.name);
    setFormRole(member.role);
    setFormServiceRoles(member.serviceRoles ?? []);
    setDialogOpen(true);
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const editing = editingMember();
      const payload = {
        name: formName(),
        role: formRole(),
        serviceRoles: formServiceRoles(),
      };
      if (editing) {
        await updateMember(editing.id, payload);
      } else {
        await createMember(payload);
      }
      setDialogOpen(false);
      await refetch();
    } finally {
      setSubmitting(false);
    }
  }

  function handleDeactivate(member: AdminMember) {
    setPending({
      title: t("management.deactivate"),
      description: t("management.confirmDeactivate", { name: member.name }),
      confirmLabel: t("management.deactivate"),
      variant: "destructive",
      run: async () => {
        try {
          await deactivateMember(member.id);
          await refetch();
          showToast(
            t("management.deactivated", { name: member.name }),
            "success",
          );
        } catch (err) {
          showToast(t("common.error"), "error");
          throw err;
        }
      },
    });
  }

  function handleReinvite(member: AdminMember) {
    setPending({
      title: t("management.reinvite"),
      description: t("management.confirmReinvite", { name: member.name }),
      confirmLabel: t("management.reinvite"),
      variant: "default",
      run: async () => {
        try {
          await reinviteMember(member.id);
          await refetch();
          showToast(
            t("management.reinvited", { name: member.name }),
            "success",
          );
        } catch (err) {
          showToast(t("common.error"), "error");
          throw err;
        }
      },
    });
  }

  async function copyInviteLink(member: AdminMember) {
    const url = `${window.location.origin}/api/invite/${member.inviteToken}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast(t("management.inviteLinkCopied"), "success");
    } catch (err) {
      console.error("Clipboard write failed:", err);
      showToast(t("management.copyFailed"), "error");
    }
  }

  return (
    <div class={styles.container}>
      <div class={styles.toolbar}>
        <h1 class={styles.pageTitle}>{t("management.title")}</h1>
        <button type="button" class={styles.addButton} onClick={openAddDialog}>
          <Plus size={16} stroke-width={1.5} />
          {t("management.dialogTitleAdd")}
        </button>
      </div>

      <Show
        when={!members.loading}
        fallback={<p class={styles.loading}>{t("common.loading")}</p>}
      >
        <Show when={members()?.length}>
          <div class={styles.tableWrap}>
            <table class={styles.table}>
              <thead>
                <tr>
                  <th class={styles.th}>{t("management.colName")}</th>
                  <th class={styles.th}>{t("management.colRole")}</th>
                  <th class={styles.th}>{t("management.colLineStatus")}</th>
                  <th class={`${styles.th} ${styles.thActions}`}>
                    {t("management.colActions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                <For each={members()}>
                  {(member) => (
                    <tr
                      class={styles.row}
                      classList={{ [styles.rowInactive]: !member.isActive }}
                    >
                      <td class={styles.td}>
                        <div class={styles.nameCell}>
                          <span class={styles.memberName}>{member.name}</span>
                          <Show when={!member.isActive}>
                            <span class={styles.badgeInactive}>
                              {t("management.inactive")}
                            </span>
                          </Show>
                        </div>
                      </td>
                      <td class={styles.td}>
                        <span
                          class={
                            member.role === "admin"
                              ? styles.badgeAdmin
                              : styles.badgeMember
                          }
                        >
                          {member.role === "admin"
                            ? t("common.admin")
                            : t("common.member")}
                        </span>
                      </td>
                      <td class={styles.td}>
                        <Show when={member.isActive}>
                          <span
                            class={
                              member.lineUserId
                                ? styles.badgeLinked
                                : styles.badgeUnlinked
                            }
                          >
                            {member.lineUserId ? (
                              <>
                                <Link size={10} stroke-width={1.5} />
                                {t("management.linked")}
                              </>
                            ) : (
                              <>
                                <Link2Off size={10} stroke-width={1.5} />
                                {t("management.unlinked")}
                              </>
                            )}
                          </span>
                        </Show>
                      </td>
                      <td class={styles.td}>
                        <Show when={member.isActive}>
                          <div class={styles.actionsCell}>
                            <button
                              type="button"
                              class={styles.actionButton}
                              onClick={() => openEditDialog(member)}
                            >
                              <Pencil size={14} stroke-width={1.5} />
                              {t("common.edit")}
                            </button>
                            <Show when={!member.inviteUsed}>
                              <button
                                type="button"
                                class={styles.actionButton}
                                onClick={() => copyInviteLink(member)}
                              >
                                <ClipboardCopy size={14} stroke-width={1.5} />
                                {t("management.inviteLink")}
                              </button>
                            </Show>
                            <Show when={member.lineUserId}>
                              <button
                                type="button"
                                class={styles.actionButton}
                                onClick={() => handleReinvite(member)}
                              >
                                <RefreshCw size={14} stroke-width={1.5} />
                                {t("management.reinvite")}
                              </button>
                            </Show>
                            <Show when={member.id !== user().id}>
                              <button
                                type="button"
                                class={styles.destructiveButton}
                                onClick={() => handleDeactivate(member)}
                              >
                                <UserMinus size={14} stroke-width={1.5} />
                                {t("management.deactivate")}
                              </button>
                            </Show>
                          </div>
                        </Show>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </Show>
      </Show>

      {/* Add / edit member dialog */}
      <Dialog open={dialogOpen()} onOpenChange={setDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay class={styles.overlay} />
          <Dialog.Content class={styles.dialogContent}>
            <Dialog.Title class={styles.dialogTitle}>
              {editingMember()
                ? t("management.dialogTitleEdit")
                : t("management.dialogTitleAdd")}
            </Dialog.Title>
            <form onSubmit={handleSubmit}>
              <div class={styles.formGroup}>
                <label for="member-name" class={styles.label}>
                  {t("management.name")}
                </label>
                <input
                  id="member-name"
                  type="text"
                  class={styles.input}
                  value={formName()}
                  onInput={(e) => setFormName(e.currentTarget.value)}
                  required
                />
              </div>
              <div class={styles.formGroup}>
                <label for="member-role" class={styles.label}>
                  {t("management.role")}
                </label>
                <select
                  id="member-role"
                  class={styles.select}
                  value={formRole()}
                  onChange={(e) =>
                    setFormRole(e.currentTarget.value as "admin" | "member")
                  }
                >
                  <option value="member">{t("common.member")}</option>
                  <option value="admin">{t("common.admin")}</option>
                </select>
              </div>
              <div class={styles.formGroup}>
                <span class={styles.label}>{t("management.serviceRoles")}</span>
                <div class={styles.checkboxGroup}>
                  <For each={SERVICE_ROLES}>
                    {(role) => (
                      <label class={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={formServiceRoles().includes(role)}
                          onChange={(e) =>
                            setFormServiceRoles((prev) =>
                              e.currentTarget.checked
                                ? [...prev, role]
                                : prev.filter((r) => r !== role),
                            )
                          }
                        />
                        {role}
                      </label>
                    )}
                  </For>
                </div>
              </div>
              <div class={styles.dialogActions}>
                <Dialog.CloseButton class={styles.cancelButton}>
                  {t("common.cancel")}
                </Dialog.CloseButton>
                <button
                  type="submit"
                  class={styles.submitButton}
                  disabled={submitting() || formName().trim() === ""}
                >
                  {editingMember() ? t("common.update") : t("common.add")}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>

      {/* Confirm action dialog */}
      <ConfirmDialog
        open={confirmOpen()}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
        title={pending()?.title ?? ""}
        description={pending()?.description ?? ""}
        confirmLabel={pending()?.confirmLabel ?? ""}
        cancelLabel={t("common.cancel")}
        variant={pending()?.variant ?? "default"}
        onConfirm={() => pending()?.run()}
      />
    </div>
  );
}
