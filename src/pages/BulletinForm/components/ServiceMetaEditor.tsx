import { For, Match, Show, Switch } from "solid-js";
import { useLocale } from "@/store/LocaleContext.tsx";
import type {
	Member,
	SectionTemplate,
	ServiceMetaSectionData,
	ServiceMetaSectionTemplate,
} from "@/types/bulletin.ts";

type Props = {
	section: ServiceMetaSectionData;
	template: SectionTemplate[];
	members: Member[] | undefined;
	onUpdate: (sectionId: string, key: string, value: string) => void;
};

export function ServiceMetaEditor(props: Props) {
	const { t } = useLocale();

	const tmpl = () =>
		props.template.find(
			(s): s is ServiceMetaSectionTemplate =>
				s.id === props.section.id && s.type === "service-meta",
		);

	return (
		<Show when={tmpl()}>
			{(t_) => (
				<For each={t_().config.fieldDefs}>
					{(def) => (
						<div>
							<label for={`sm-${def.key}`}>{def.label}</label>
							<Switch>
								<Match when={def.inputType === "member"}>
									<select
										id={`sm-${def.key}`}
										value={props.section.data.fieldValues[def.key] ?? ""}
										onChange={(e) =>
											props.onUpdate(
												props.section.id,
												def.key,
												e.currentTarget.value,
											)
										}
									>
										<option value="">{t("bulletinForm.selectMember")}</option>
										<For each={props.members ?? []}>
											{(m) => <option value={m.name}>{m.name}</option>}
										</For>
									</select>
								</Match>
								<Match when={def.inputType === "time"}>
									<input
										id={`sm-${def.key}`}
										type="time"
										value={props.section.data.fieldValues[def.key] ?? ""}
										onInput={(e) =>
											props.onUpdate(
												props.section.id,
												def.key,
												e.currentTarget.value,
											)
										}
									/>
								</Match>
								<Match when={true}>
									<input
										id={`sm-${def.key}`}
										type="text"
										value={props.section.data.fieldValues[def.key] ?? ""}
										onInput={(e) =>
											props.onUpdate(
												props.section.id,
												def.key,
												e.currentTarget.value,
											)
										}
									/>
								</Match>
							</Switch>
						</div>
					)}
				</For>
			)}
		</Show>
	);
}
