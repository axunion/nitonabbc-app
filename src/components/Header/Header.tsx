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
  let headerRef!: HTMLElement;

  onMount(() => {
    // Scroll happens inside the MemberLayout .main container (overflow-y:auto),
    // not on window. Find the nearest data-scroll-container ancestor and listen there.
    const found = headerRef.closest<HTMLElement>("[data-scroll-container]");
    if (import.meta.env.DEV && !found) {
      console.warn(
        "Header: no [data-scroll-container] ancestor — scroll detection will not work",
      );
    }
    const container = found ?? window;
    const getScrollTop =
      container instanceof Window
        ? () => container.scrollY
        : () => container.scrollTop;

    function handleScroll() {
      setScrolled(getScrollTop() > 0);
    }

    handleScroll();
    container.addEventListener("scroll", handleScroll, { passive: true });
    onCleanup(() => container.removeEventListener("scroll", handleScroll));
  });

  return (
    <header
      ref={headerRef}
      class={styles.header}
      classList={{ [styles.scrolled]: scrolled() }}
    >
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
