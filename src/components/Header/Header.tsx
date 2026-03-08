import { useNavigate } from "@solidjs/router";
import { ChevronLeft } from "lucide-solid";
import type { JSX } from "solid-js";
import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { useLocale } from "@/store/LocaleContext.tsx";
import styles from "./Header.module.css";

type HeaderProps = {
	title?: string;
	rightAction?: JSX.Element;
	backTo?: string;
};

export function Header(props: HeaderProps) {
	const { t } = useLocale();
	const navigate = useNavigate();
	const [scrolled, setScrolled] = createSignal(false);

	function handleScroll() {
		setScrolled(window.scrollY > 0);
	}

	onMount(() => {
		handleScroll();
		window.addEventListener("scroll", handleScroll, { passive: true });
		onCleanup(() => window.removeEventListener("scroll", handleScroll));
	});

	return (
		<header class={styles.header} classList={{ [styles.scrolled]: scrolled() }}>
			<Show when={props.backTo} fallback={<span class={styles.spacer} />}>
				{(backTo) => (
					<button
						type="button"
						class={styles.backButton}
						onClick={() => navigate(backTo())}
					>
						<ChevronLeft size={24} stroke-width={1.5} />
					</button>
				)}
			</Show>
			<span class={styles.title}>{props.title ?? t("common.churchName")}</span>
			<div class={styles.actions}>{props.rightAction}</div>
		</header>
	);
}
