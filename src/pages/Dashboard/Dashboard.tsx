import { FileText, ReceiptText } from "lucide-solid";
import { For } from "solid-js";
import { AppIcon } from "@/components/AppIcon";
import styles from "./Dashboard.module.css";

type AppItem = {
	id: string;
	label: string;
	icon: ReturnType<typeof FileText>;
	disabled: boolean;
};

const APP_ITEMS: AppItem[] = [
	{
		id: "bulletin",
		label: "週報",
		icon: <FileText size={48} stroke-width={1.5} />,
		disabled: true,
	},
	{
		id: "expense",
		label: "経費精算",
		icon: <ReceiptText size={48} stroke-width={1.5} />,
		disabled: true,
	},
];

export function Dashboard() {
	return (
		<div class={styles.container}>
			<ul class={styles.grid}>
				<For each={APP_ITEMS}>
					{(item) => (
						<li>
							<AppIcon
								label={item.label}
								icon={item.icon}
								onClick={() => {}}
								disabled={item.disabled}
							/>
						</li>
					)}
				</For>
			</ul>
		</div>
	);
}
