import type { Flatten, Translator } from "@solid-primitives/i18n";
import { flatten, resolveTemplate, translator } from "@solid-primitives/i18n";
import {
	type Accessor,
	createContext,
	createMemo,
	createSignal,
	type JSX,
	useContext,
} from "solid-js";
import type { Dictionary, Locale } from "@/locales/index.ts";
import { ja } from "@/locales/ja.ts";

const STORAGE_KEY = "locale";

function detectLocale(): Locale {
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === "ja" || stored === "en") return stored;
	return navigator.language.startsWith("en") ? "en" : "ja";
}

async function loadDictionary(locale: Locale): Promise<Dictionary> {
	if (locale === "ja") return ja;
	const { en } = await import("@/locales/en.ts");
	return en;
}

type LocaleContextValue = {
	t: Translator<Flatten<Dictionary>>;
	locale: Accessor<Locale>;
	setLocale: (l: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue>();

export function LocaleProvider(props: { children: JSX.Element }) {
	const [locale, setLocaleSignal] = createSignal<Locale>(detectLocale());
	const [dict, setDict] = createSignal<Flatten<Dictionary>>(flatten(ja));

	function setLocale(l: Locale) {
		setLocaleSignal(l);
		localStorage.setItem(STORAGE_KEY, l);
		loadDictionary(l).then((d) => setDict(flatten(d)));
	}

	// Load initial dictionary if not Japanese
	if (locale() !== "ja") {
		loadDictionary(locale()).then((d) => setDict(flatten(d)));
	}

	const t = createMemo(() => translator(() => dict(), resolveTemplate));

	return (
		<LocaleContext.Provider
			value={{
				get t() {
					return t();
				},
				locale,
				setLocale,
			}}
		>
			{props.children}
		</LocaleContext.Provider>
	);
}

export function useLocale(): LocaleContextValue {
	const ctx = useContext(LocaleContext);
	if (!ctx) {
		throw new Error("useLocale must be used within LocaleProvider");
	}
	return ctx;
}
