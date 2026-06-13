import { Toast } from "@kobalte/core/toast";
import styles from "./Toast.module.css";

export function Toaster() {
	return (
		<Toast.Region>
			<Toast.List class={styles.region} />
		</Toast.Region>
	);
}
