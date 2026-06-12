import { For, type JSX } from "solid-js";
import { useLocale } from "@/store/LocaleContext.tsx";
import type { Member, TemplateItem, WorshipItem } from "@/types/bulletin.ts";
import { getTemplateItem } from "@/utils/bulletin.ts";
import styles from "../BulletinForm.module.css";

interface WorshipInputProps {
	item: WorshipItem;
	index: number;
	template: TemplateItem[] | undefined;
	members: Member[] | undefined;
	onUpdateDetails: (index: number, value: string) => void;
	onUpdateFieldValue: (index: number, key: string, value: string) => void;
}

function MemberSelect(props: {
	value: string | undefined;
	members: Member[] | undefined;
	onChange: (val: string) => void;
}): JSX.Element {
	const { t } = useLocale();
	return (
		<select
			class={styles.select}
			value={props.value ?? ""}
			onChange={(e) => props.onChange(e.currentTarget.value)}
		>
			<option value="">{t("bulletinForm.selectMember")}</option>
			<For each={props.members ?? []}>
				{(m) => <option value={String(m.id)}>{m.name}</option>}
			</For>
		</select>
	);
}

export function WorshipInput(props: WorshipInputProps): JSX.Element {
	const { t } = useLocale();
	const tmpl = () => getTemplateItem(props.template, props.item.type);
	const inputType = () => tmpl()?.inputType ?? "text";

	// Compound fields mode
	if ((tmpl()?.fields?.length ?? 0) > 0) {
		return (
			<div class={styles.compoundFields}>
				<For each={tmpl()?.fields ?? []}>
					{(field) => {
						if (field.inputType === "none") return null;
						if (field.inputType === "member") {
							return (
								<div class={styles.fieldRow}>
									<span class={styles.fieldLabel}>{field.label}</span>
									<MemberSelect
										value={props.item.fieldValues?.[field.key]}
										members={props.members}
										onChange={(val) =>
											props.onUpdateFieldValue(props.index, field.key, val)
										}
									/>
								</div>
							);
						}
						return (
							<div class={styles.fieldRow}>
								<span class={styles.fieldLabel}>{field.label}</span>
								<input
									type="text"
									class={styles.input}
									placeholder={t("bulletinForm.detailsPlaceholder")}
									value={props.item.fieldValues?.[field.key] ?? ""}
									onInput={(e) =>
										props.onUpdateFieldValue(
											props.index,
											field.key,
											e.currentTarget.value,
										)
									}
								/>
							</div>
						);
					}}
				</For>
			</div>
		);
	}

	// None type — no input needed
	if (inputType() === "none") {
		return null;
	}

	// Member select
	if (inputType() === "member") {
		return (
			<MemberSelect
				value={props.item.details}
				members={props.members}
				onChange={(val) => props.onUpdateDetails(props.index, val)}
			/>
		);
	}

	return (
		<input
			type="text"
			class={styles.input}
			placeholder={t("bulletinForm.detailsPlaceholder")}
			value={props.item.details ?? ""}
			onInput={(e) => props.onUpdateDetails(props.index, e.currentTarget.value)}
		/>
	);
}
