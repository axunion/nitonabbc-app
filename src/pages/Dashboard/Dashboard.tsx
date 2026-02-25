import { useNavigate } from "@solidjs/router";
import { FileText, ReceiptText } from "lucide-solid";
import { For } from "solid-js";
import { AppIcon } from "@/components/AppIcon";
import { useLocale } from "@/store/LocaleContext.tsx";
import styles from "./Dashboard.module.css";

type AppItem = {
	id: string;
	label: string;
	icon: ReturnType<typeof FileText>;
	disabled: boolean;
	onClick?: () => void;
};

export function Dashboard() {
	const navigate = useNavigate();
	const { t } = useLocale();

	const APP_ITEMS: AppItem[] = [
		{
			id: "bulletin",
			label: t("dashboard.bulletin"),
			icon: <FileText size={48} stroke-width={1.5} />,
			disabled: false,
			onClick: () => navigate("/bulletin"),
		},
		{
			id: "expense",
			label: t("dashboard.expense"),
			icon: <ReceiptText size={48} stroke-width={1.5} />,
			disabled: true,
		},
	];

	return (
		<div class={styles.container}>
			<ul class={styles.grid}>
				<For each={APP_ITEMS}>
					{(item) => (
						<li>
							<AppIcon
								label={item.label}
								icon={item.icon}
								onClick={item.onClick ?? (() => {})}
								disabled={item.disabled}
							/>
						</li>
					)}
				</For>
			</ul>
		</div>
	);
}
