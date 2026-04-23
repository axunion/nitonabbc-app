import { For, Show } from "solid-js";
import type { AssignmentsSectionData } from "@/types/bulletin.ts";
import styles from "../BulletinDetail.module.css";

type Props = {
	section: AssignmentsSectionData;
};

export function AssignmentsView(props: Props) {
	const entries = () => Object.entries(props.section.data).filter(([, v]) => v);

	return (
		<Show when={entries().length > 0}>
			<section class={styles.section}>
				<h2 class={styles.sectionTitle}>{props.section.label}</h2>
				<dl class={styles.assignmentList}>
					<For each={entries()}>
						{([role, person]) => (
							<>
								<dt class={styles.assignmentRole}>{role}</dt>
								<dd class={styles.assignmentPerson}>{person}</dd>
							</>
						)}
					</For>
				</dl>
			</section>
		</Show>
	);
}
