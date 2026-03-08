import { useNavigate } from "@solidjs/router";
import { FileText, ReceiptText } from "lucide-solid";
import { Header } from "@/components/Header";
import { useLocale } from "@/store/LocaleContext.tsx";
import styles from "./Dashboard.module.css";

export function Dashboard() {
	const navigate = useNavigate();
	const { t } = useLocale();

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
					<button type="button" class={styles.widgetSmall} disabled>
						<span class={styles.widgetIcon}>
							<ReceiptText size={24} stroke-width={1.5} />
						</span>
						<span class={styles.widgetLabel}>{t("dashboard.expense")}</span>
					</button>
				</div>
			</div>
		</>
	);
}
