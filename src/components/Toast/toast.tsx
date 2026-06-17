import { Toast, toaster } from "@kobalte/core/toast";
import { X } from "lucide-solid";
import styles from "./Toast.module.css";

const TOAST_DURATION_MS = 3000;

export function showToast(
  message: string,
  variant: "success" | "error" = "success",
): void {
  toaster.show((props) => (
    <Toast
      toastId={props.toastId}
      class={variant === "success" ? styles.toastSuccess : styles.toastError}
      duration={TOAST_DURATION_MS}
    >
      <Toast.Title class={styles.title}>{message}</Toast.Title>
      <Toast.CloseButton class={styles.closeButton}>
        <X size={14} stroke-width={1.5} />
      </Toast.CloseButton>
    </Toast>
  ));
}
