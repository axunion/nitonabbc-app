import { Dialog } from "@kobalte/core/dialog";
import { useNavigate } from "@solidjs/router";
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
import { useAuth } from "@/store/AuthContext.tsx";
import styles from "./Management.module.css";

type Member = {
	id: number;
	name: string;
	role: "admin" | "member";
	lineUserId: string | null;
	inviteToken: string;
	inviteUsed: boolean;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
};

async function fetchMembers(): Promise<Member[]> {
	const res = await fetch("/api/admin/members");
	if (!res.ok) throw new Error("Failed to fetch members");
	return res.json() as Promise<Member[]>;
}

export function Management() {
	const { user } = useAuth();
	const navigate = useNavigate();

	if (user().role !== "admin") {
		navigate("/", { replace: true });
	}

	const [members, { refetch }] = createResource(fetchMembers);

	// Dialog state
	const [dialogOpen, setDialogOpen] = createSignal(false);
	const [editingMember, setEditingMember] = createSignal<Member | null>(null);
	const [formName, setFormName] = createSignal("");
	const [formRole, setFormRole] = createSignal<"admin" | "member">("member");
	const [submitting, setSubmitting] = createSignal(false);
	const [copiedId, setCopiedId] = createSignal<number | null>(null);

	function openAddDialog() {
		setEditingMember(null);
		setFormName("");
		setFormRole("member");
		setDialogOpen(true);
	}

	function openEditDialog(member: Member) {
		setEditingMember(member);
		setFormName(member.name);
		setFormRole(member.role);
		setDialogOpen(true);
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		setSubmitting(true);
		try {
			const editing = editingMember();
			if (editing) {
				await fetch(`/api/admin/members/${editing.id}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ name: formName(), role: formRole() }),
				});
			} else {
				await fetch("/api/admin/members", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ name: formName(), role: formRole() }),
				});
			}
			setDialogOpen(false);
			await refetch();
		} finally {
			setSubmitting(false);
		}
	}

	async function handleDeactivate(member: Member) {
		if (!confirm(`${member.name} を無効化しますか？`)) return;
		await fetch(`/api/admin/members/${member.id}`, { method: "DELETE" });
		await refetch();
	}

	async function handleReinvite(member: Member) {
		if (
			!confirm(
				`${member.name} のLINE連携を解除し、新しい招待リンクを発行しますか？`,
			)
		)
			return;
		await fetch(`/api/admin/members/${member.id}/reinvite`, {
			method: "POST",
		});
		await refetch();
	}

	async function copyInviteLink(member: Member) {
		const url = `${window.location.origin}/api/invite/${member.inviteToken}`;
		await navigator.clipboard.writeText(url);
		setCopiedId(member.id);
		setTimeout(() => setCopiedId(null), 2000);
	}

	return (
		<div class={styles.container}>
			<div class={styles.header}>
				<h1 class={styles.title}>メンバー管理</h1>
				<button type="button" class={styles.addButton} onClick={openAddDialog}>
					<Plus size={16} stroke-width={1.5} />
					追加
				</button>
			</div>

			<Show
				when={!members.loading}
				fallback={<p class={styles.loading}>読み込み中...</p>}
			>
				<Show
					when={members()?.length}
					fallback={<p class={styles.empty}>メンバーがいません</p>}
				>
					<ul class={styles.list}>
						<For each={members()}>
							{(member) => (
								<li class={styles.card}>
									<div class={styles.cardHeader}>
										<h2 class={styles.memberName}>{member.name}</h2>
										<div class={styles.badges}>
											<span
												class={
													member.role === "admin"
														? styles.badgeAdmin
														: styles.badgeMember
												}
											>
												{member.role === "admin" ? "管理者" : "メンバー"}
											</span>
											<Show when={!member.isActive}>
												<span class={styles.badgeInactive}>無効</span>
											</Show>
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
															LINE連携済
														</>
													) : (
														<>
															<Link2Off size={10} stroke-width={1.5} />
															未連携
														</>
													)}
												</span>
											</Show>
										</div>
									</div>

									<Show when={member.isActive}>
										<div class={styles.cardActions}>
											<button
												type="button"
												class={styles.actionButton}
												onClick={() => openEditDialog(member)}
											>
												<Pencil size={14} stroke-width={1.5} />
												編集
											</button>
											<Show when={!member.inviteUsed}>
												<button
													type="button"
													class={styles.actionButton}
													onClick={() => copyInviteLink(member)}
												>
													<ClipboardCopy size={14} stroke-width={1.5} />
													招待リンク
													<Show when={copiedId() === member.id}>
														<span class={styles.copySuccess}>copied!</span>
													</Show>
												</button>
											</Show>
											<Show when={member.lineUserId}>
												<button
													type="button"
													class={styles.actionButton}
													onClick={() => handleReinvite(member)}
												>
													<RefreshCw size={14} stroke-width={1.5} />
													再招待
												</button>
											</Show>
											<Show when={member.id !== user().id}>
												<button
													type="button"
													class={styles.destructiveButton}
													onClick={() => handleDeactivate(member)}
												>
													<UserMinus size={14} stroke-width={1.5} />
													無効化
												</button>
											</Show>
										</div>
									</Show>
								</li>
							)}
						</For>
					</ul>
				</Show>
			</Show>

			<Dialog open={dialogOpen()} onOpenChange={setDialogOpen}>
				<Dialog.Portal>
					<Dialog.Overlay class={styles.overlay} />
					<Dialog.Content class={styles.dialogContent}>
						<Dialog.Title class={styles.dialogTitle}>
							{editingMember() ? "メンバー編集" : "メンバー追加"}
						</Dialog.Title>
						<form onSubmit={handleSubmit}>
							<div class={styles.formGroup}>
								<label for="member-name" class={styles.label}>
									名前
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
									ロール
								</label>
								<select
									id="member-role"
									class={styles.select}
									value={formRole()}
									onChange={(e) =>
										setFormRole(e.currentTarget.value as "admin" | "member")
									}
								>
									<option value="member">メンバー</option>
									<option value="admin">管理者</option>
								</select>
							</div>
							<div class={styles.dialogActions}>
								<Dialog.CloseButton class={styles.cancelButton}>
									キャンセル
								</Dialog.CloseButton>
								<button
									type="submit"
									class={styles.submitButton}
									disabled={submitting() || formName().trim() === ""}
								>
									{editingMember() ? "更新" : "追加"}
								</button>
							</div>
						</form>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog>
		</div>
	);
}
