import { useNavigate } from "@solidjs/router";
import { ChevronDown, ChevronUp, Minus, Plus } from "lucide-solid";
import { createResource, createSignal, For, Show } from "solid-js";
import { useAuth } from "@/store/AuthContext.tsx";
import { useLocale } from "@/store/LocaleContext.tsx";
import styles from "./BulletinTemplate.module.css";

type TemplateItem = { type: string; label: string };

async function fetchTemplate(): Promise<TemplateItem[]> {
	const res = await fetch("/api/bulletin-template");
	if (!res.ok) throw new Error("Failed to fetch template");
	return res.json() as Promise<TemplateItem[]>;
}

export function BulletinTemplate() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { t } = useLocale();

	// Redirect non-admin
	if (user()?.role !== "admin") {
		navigate("/", { replace: true });
	}

	const [templateData] = createResource(fetchTemplate);
	const [items, setItems] = createSignal<TemplateItem[]>([]);
	const [initialized, setInitialized] = createSignal(false);
	const [saving, setSaving] = createSignal(false);
	const [message, setMessage] = createSignal<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	const initItems = () => {
		const data = templateData();
		if (data && !initialized()) {
			setItems(data.map((i) => ({ type: i.type, label: i.label })));
			setInitialized(true);
		}
		return null;
	};

	function updateItem(index: number, field: "type" | "label", value: string) {
		setItems((prev) =>
			prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
		);
	}

	function addItem() {
		setItems((prev) => [...prev, { type: "", label: "" }]);
	}

	function removeItem(index: number) {
		setItems((prev) => prev.filter((_, i) => i !== index));
	}

	function moveItem(index: number, direction: -1 | 1) {
		setItems((prev) => {
			const next = [...prev];
			const target = index + direction;
			if (target < 0 || target >= next.length) return prev;
			[next[index], next[target]] = [next[target], next[index]];
			return next;
		});
	}

	async function handleSave(e: SubmitEvent) {
		e.preventDefault();
		setMessage(null);
		setSaving(true);

		try {
			const res = await fetch("/api/bulletin-template", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(items()),
			});

			if (!res.ok) {
				const data = (await res.json()) as { error?: string };
				setMessage({
					type: "error",
					text: data.error ?? t("worshipTemplate.saveError"),
				});
				return;
			}

			setMessage({ type: "success", text: t("worshipTemplate.saved") });
		} catch {
			setMessage({ type: "error", text: t("worshipTemplate.saveError") });
		} finally {
			setSaving(false);
		}
	}

	const isValid = () =>
		items().length > 0 &&
		items().every((i) => i.type.trim() !== "" && i.label.trim() !== "");

	return (
		<div class={styles.container}>
			{initItems()}

			<Show
				when={initialized()}
				fallback={<p class={styles.loading}>{t("common.loading")}</p>}
			>
				<h1 class={styles.title}>{t("worshipTemplate.title")}</h1>
				<p class={styles.description}>{t("worshipTemplate.description")}</p>

				<Show when={message()}>
					{(msg) => (
						<p class={msg().type === "success" ? styles.success : styles.error}>
							{msg().text}
						</p>
					)}
				</Show>

				<form onSubmit={handleSave} class={styles.form}>
					<For each={items()}>
						{(item, index) => (
							<div class={styles.itemRow}>
								<div class={styles.orderButtons}>
									<button
										type="button"
										class={styles.orderButton}
										onClick={() => moveItem(index(), -1)}
										disabled={index() === 0}
										title={t("worshipTemplate.moveUp")}
									>
										<ChevronUp size={14} stroke-width={1.5} />
									</button>
									<button
										type="button"
										class={styles.orderButton}
										onClick={() => moveItem(index(), 1)}
										disabled={index() === items().length - 1}
										title={t("worshipTemplate.moveDown")}
									>
										<ChevronDown size={14} stroke-width={1.5} />
									</button>
								</div>
								<div class={styles.inputs}>
									<input
										type="text"
										class={styles.input}
										placeholder={t("worshipTemplate.typePlaceholder")}
										value={item.type}
										onInput={(e) =>
											updateItem(index(), "type", e.currentTarget.value)
										}
									/>
									<input
										type="text"
										class={styles.input}
										placeholder={t("worshipTemplate.labelPlaceholder")}
										value={item.label}
										onInput={(e) =>
											updateItem(index(), "label", e.currentTarget.value)
										}
									/>
								</div>
								<button
									type="button"
									class={styles.removeButton}
									onClick={() => removeItem(index())}
									title={t("worshipTemplate.deleteItem")}
								>
									<Minus size={16} stroke-width={1.5} />
								</button>
							</div>
						)}
					</For>

					<button type="button" class={styles.addButton} onClick={addItem}>
						<Plus size={16} stroke-width={1.5} />
						{t("worshipTemplate.addItem")}
					</button>

					<div class={styles.actions}>
						<button
							type="button"
							class={styles.cancelButton}
							onClick={() => navigate("/admin")}
						>
							{t("common.cancel")}
						</button>
						<button
							type="submit"
							class={styles.saveButton}
							disabled={saving() || !isValid()}
						>
							{t("worshipTemplate.save")}
						</button>
					</div>
				</form>
			</Show>
		</div>
	);
}
