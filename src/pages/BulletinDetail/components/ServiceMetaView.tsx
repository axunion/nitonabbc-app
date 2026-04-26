import { For, Show } from "solid-js";
import type {
	SectionTemplate,
	ServiceMetaSectionData,
	ServiceMetaSectionTemplate,
} from "@/types/bulletin.ts";

type Props = {
	section: ServiceMetaSectionData;
	template: SectionTemplate[];
};

export function ServiceMetaView(props: Props) {
	const tmpl = () =>
		props.template.find(
			(t): t is ServiceMetaSectionTemplate =>
				t.id === props.section.id && t.type === "service-meta",
		);

	return (
		<Show when={tmpl()}>
			{(t) => (
				<For each={t().config.fieldDefs}>
					{(def) => {
						const value = () =>
							props.section.data.fieldValues[def.key]?.trim() ?? "";
						return (
							<Show when={value()}>
								<div>
									<span>{def.label}: </span>
									<span>{value()}</span>
								</div>
							</Show>
						);
					}}
				</For>
			)}
		</Show>
	);
}
