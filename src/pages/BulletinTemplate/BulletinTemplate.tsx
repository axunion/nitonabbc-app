import { useNavigate } from "@solidjs/router";
import { Plus } from "lucide-solid";
import { createEffect, For, Show } from "solid-js";
import { Header } from "@/components/Header";
import { useAuth } from "@/store/AuthContext.tsx";
import { useLocale } from "@/store/LocaleContext.tsx";
import styles from "./BulletinTemplate.module.css";
import { TemplateItemRow } from "./components/TemplateItemRow.tsx";
import { useTemplateEditor } from "./hooks/useTemplateEditor.ts";

export function BulletinTemplate() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { t } = useLocale();

	createEffect(() => {
		if (user().role !== "admin") {
			navigate("/", { replace: true });
		}
	});

	const editor = useTemplateEditor();

	return (
		<>
			<Header title={t("worshipTemplate.title")} backTo="/settings" />
			<div class={styles.container}>
				<Show
					when={editor.initialized()}
					fallback={<p class={styles.loading}>{t("common.loading")}</p>}
				>
					<p class={styles.description}>{t("worshipTemplate.description")}</p>

					<Show when={editor.message()}>
						{(msg) => (
							<p
								class={msg().type === "success" ? styles.success : styles.error}
							>
								{msg().text}
							</p>
						)}
					</Show>

					<form onSubmit={editor.handleSave} class={styles.form}>
						<ul class={styles.itemList}>
							<For each={editor.items()}>
								{(item, index) => (
									<TemplateItemRow
										item={item}
										index={index()}
										total={editor.items().length}
										isExpanded={editor.expandedIndex() === index()}
										onToggle={editor.toggleExpand}
										onMoveUp={(i) => editor.moveItem(i, -1)}
										onMoveDown={(i) => editor.moveItem(i, 1)}
										onUpdateItem={editor.updateItem}
										onToggleFieldMode={editor.toggleFieldMode}
										onAddField={editor.addField}
										onRemoveField={editor.removeField}
										onUpdateField={editor.updateField}
										onRemoveItem={editor.removeItem}
									/>
								)}
							</For>
						</ul>

						<button
							type="button"
							class={styles.addButton}
							onClick={editor.addItem}
						>
							<Plus size={16} stroke-width={1.5} />
							{t("worshipTemplate.addItem")}
						</button>

						<div class={styles.actions}>
							<button
								type="button"
								class={styles.cancelButton}
								onClick={() => navigate("/settings")}
							>
								{t("common.cancel")}
							</button>
							<button
								type="submit"
								class={styles.saveButton}
								disabled={editor.saving() || !editor.isValid()}
							>
								{t("worshipTemplate.save")}
							</button>
						</div>
					</form>
				</Show>
			</div>
		</>
	);
}
