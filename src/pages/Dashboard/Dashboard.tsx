import { useNavigate } from "@solidjs/router";
import { FileText, ReceiptText } from "lucide-solid";
import { createSignal } from "solid-js";
import { Header } from "@/components/Header";
import { IframeViewer } from "@/components/IframeViewer";
import { useLocale } from "@/store/LocaleContext.tsx";
import styles from "./Dashboard.module.css";

export function Dashboard() {
	const navigate = useNavigate();
	const { t } = useLocale();
	const [iframeOpen, setIframeOpen] = createSignal(false);

	return (
		<>
			<Header />
			<div class={styles.container}>
				<div class={styles.grid}>
					<button
						type="button"
						class={styles.widgetLarge}
						onClick={() => navigate("/bulletin")}
					>
						<span class={styles.widgetIcon}>
							<FileText size={28} stroke-width={1.5} />
						</span>
						<span class={styles.widgetLabel}>{t("dashboard.bulletin")}</span>
						<span class={styles.widgetSubtitle}>
							{t("dashboard.bulletinHint")}
						</span>
					</button>
					<button
						type="button"
						class={styles.widgetSmall}
						onClick={() => setIframeOpen(true)}
					>
						<span class={styles.widgetIcon}>
							<ReceiptText size={24} stroke-width={1.5} />
						</span>
						<span class={styles.widgetLabel}>{t("dashboard.expense")}</span>
					</button>
				</div>
			</div>
			<IframeViewer
				open={iframeOpen()}
				url="https://receipt-snap.nitonabbc.org/"
				onClose={() => setIframeOpen(false)}
			/>
		</>
	);
}
