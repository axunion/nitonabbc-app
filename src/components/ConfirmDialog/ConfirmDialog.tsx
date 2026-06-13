import { Dialog } from "@kobalte/core/dialog";
import { createEffect, createSignal, Show } from "solid-js";
import styles from "./ConfirmDialog.module.css";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	confirmLabel: string;
	cancelLabel: string;
	variant?: "default" | "destructive";
	onConfirm: () => void | Promise<void>;
};

export function ConfirmDialog(props: Props) {
	const [running, setRunning] = createSignal(false);

	createEffect(() => {
		if (props.open) setRunning(false);
	});

	async function handleConfirm() {
		setRunning(true);
		try {
			await props.onConfirm();
			props.onOpenChange(false);
		} catch {
			// onConfirm is responsible for error feedback; dialog stays open for retry
		} finally {
			setRunning(false);
		}
	}

	return (
		<Dialog open={props.open} onOpenChange={props.onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay class={styles.overlay} />
				<Dialog.Content class={styles.content}>
					<Dialog.Title class={styles.title}>{props.title}</Dialog.Title>
					<Show when={props.description}>
						{(desc) => <p class={styles.description}>{desc()}</p>}
					</Show>
					<div class={styles.actions}>
						<Dialog.CloseButton class={styles.cancelButton}>
							{props.cancelLabel}
						</Dialog.CloseButton>
						<button
							type="button"
							class={
								props.variant === "destructive"
									? styles.confirmButtonDestructive
									: styles.confirmButton
							}
							disabled={running()}
							onClick={handleConfirm}
						>
							{props.confirmLabel}
						</button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog>
	);
}
