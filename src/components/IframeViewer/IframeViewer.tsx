import { ChevronLeft, ExternalLink } from "lucide-solid";
import { createEffect, createSignal, on, onCleanup, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { useAuth } from "@/store/AuthContext.tsx";
import { useLocale } from "@/store/LocaleContext.tsx";
import styles from "./IframeViewer.module.css";

interface IframeViewerProps {
  open: boolean;
  url: string;
  title: string;
  onClose: () => void;
}

export function IframeViewer(props: IframeViewerProps) {
  const { t } = useLocale();
  const { user } = useAuth();
  let contentRef: HTMLDivElement | undefined;
  let overlayRef: HTMLDivElement | undefined;
  let iframeRef: HTMLIFrameElement | undefined;
  const [loaded, setLoaded] = createSignal(false);
  const [isMounted, setIsMounted] = createSignal(false);

  // Mount immediately on open; unmount only after the closing animation finishes
  createEffect(() => {
    if (props.open) setIsMounted(true);
  });

  function handleTransitionEnd(e: TransitionEvent) {
    if (e.target !== contentRef) return;
    if (!props.open) {
      setIsMounted(false);
      setLoaded(false);
    }
  }

  // Shown when the page has not loaded after this long (e.g. offline or blocked)
  const SLOW_LOAD_MS = 10_000;
  const [slow, setSlow] = createSignal(false);
  createEffect(() => {
    if (!props.open || loaded()) return;
    setSlow(false);
    const timer = setTimeout(() => setSlow(true), SLOW_LOAD_MS);
    onCleanup(() => clearTimeout(timer));
  });

  // Push a history entry while open so the browser/Android back action closes
  // the viewer instead of leaving the page underneath. Each open gets its own
  // token so entries left by earlier opens (forward, reload) are not mistaken
  // for the current one.
  const HISTORY_KEY = "iframeViewer";
  let historyToken: string | null = null;
  const onOwnEntry = () =>
    historyToken !== null &&
    (window.history.state as Record<string, unknown> | null)?.[HISTORY_KEY] ===
      historyToken;

  createEffect(
    on(
      () => props.open,
      (open) => {
        if (!open) return;
        const token = crypto.randomUUID();
        historyToken = token;
        window.history.pushState(
          { ...(window.history.state ?? {}), [HISTORY_KEY]: token },
          "",
        );
        const onPopState = () => {
          if (!onOwnEntry()) props.onClose();
        };
        window.addEventListener("popstate", onPopState);
        onCleanup(() => {
          window.removeEventListener("popstate", onPopState);
          historyToken = null;
        });
      },
    ),
  );

  function close() {
    // Pages navigated inside the iframe share this history, so history.back()
    // may only move the iframe; close directly and drop our entry when it is
    // still on top.
    const dropEntry = onOwnEntry();
    if (contentRef) contentRef.style.transform = "";
    if (overlayRef) overlayRef.style.opacity = "";
    props.onClose();
    if (dropEntry) window.history.back();
  }

  const EDGE_THRESHOLD = 20;
  const SWIPE_DISTANCE_RATIO = 0.3;
  const SWIPE_VELOCITY_THRESHOLD = 0.5;

  // postMessage: respond to receipt-snap:ready with the user's name
  createEffect(() => {
    if (!props.open) return;
    const targetOrigin = new URL(props.url).origin;

    function onMessage(e: MessageEvent<{ type?: string }>) {
      if (e.origin !== targetOrigin) return;
      if (e.data?.type === "receipt-snap:ready") {
        iframeRef?.contentWindow?.postMessage(
          { type: "receipt-snap:set-name", name: user().name },
          targetOrigin,
        );
      }
    }

    window.addEventListener("message", onMessage);
    onCleanup(() => window.removeEventListener("message", onMessage));
  });

  // Escape key to close
  createEffect(() => {
    if (!props.open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        close();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    onCleanup(() => document.removeEventListener("keydown", onKeyDown));
  });

  // Swipe-to-close gesture (left-edge rightward drag)
  createEffect(() => {
    if (!props.open) return;

    let startX = 0;
    let startTime = 0;
    let currentDelta = 0;
    let isEdgeSwipe = false;

    function onTouchStart(e: TouchEvent) {
      const touch = e.touches[0];
      if (touch.clientX <= EDGE_THRESHOLD) {
        isEdgeSwipe = true;
        startX = touch.clientX;
        startTime = Date.now();
        currentDelta = 0;
        contentRef?.classList.add(styles.swiping);
      }
    }

    function onTouchMove(e: TouchEvent) {
      if (!isEdgeSwipe || !contentRef || !overlayRef) return;
      const delta = Math.max(0, e.touches[0].clientX - startX);
      currentDelta = delta;
      const progress = delta / window.innerWidth;
      contentRef.style.transform = `translateX(${delta}px)`;
      overlayRef.style.opacity = String(Math.max(0, 0.4 * (1 - progress)));
    }

    function onTouchEnd() {
      if (!isEdgeSwipe || !contentRef || !overlayRef) return;
      isEdgeSwipe = false;
      contentRef.classList.remove(styles.swiping);

      const elapsed = Date.now() - startTime;
      const velocity = elapsed > 0 ? currentDelta / elapsed : 0;

      if (
        currentDelta > window.innerWidth * SWIPE_DISTANCE_RATIO ||
        velocity > SWIPE_VELOCITY_THRESHOLD
      ) {
        close();
      } else {
        contentRef.style.transform = "";
        overlayRef.style.opacity = "";
      }
      currentDelta = 0;
    }

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd);

    onCleanup(() => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    });
  });

  return (
    <Portal mount={document.body}>
      <div
        ref={overlayRef}
        class={styles.overlay}
        classList={{ [styles.overlayOpen]: props.open }}
        onClick={close}
        aria-hidden="true"
      />
      <div
        ref={contentRef}
        class={styles.content}
        classList={{ [styles.contentOpen]: props.open }}
        role="dialog"
        aria-modal="true"
        aria-label={props.title}
        // Stays mounted while closed for the slide animation; hide it from
        // assistive tech and focus until opened
        inert={!props.open}
        onTransitionEnd={handleTransitionEnd}
      >
        <header class={styles.header}>
          <button
            type="button"
            class={styles.headerButton}
            onClick={close}
            aria-label={t("common.close")}
          >
            <ChevronLeft size={24} stroke-width={1.5} />
          </button>
          <span class={styles.title}>{props.title}</span>
          <a
            href={props.url}
            target="_blank"
            rel="noopener noreferrer"
            class={styles.headerButton}
            aria-label={t("iframeViewer.openInNewTab")}
            title={t("iframeViewer.openInNewTab")}
          >
            <ExternalLink size={18} stroke-width={1.5} />
          </a>
        </header>
        <div class={styles.body}>
          {/* Transparent strip on the left edge captures swipe gestures above the iframe */}
          <div class={styles.edgeStrip} aria-hidden="true" />
          <Show when={!loaded()}>
            <div class={styles.loader}>
              <div class={styles.loaderSpinner} aria-hidden="true" />
              <Show when={slow()}>
                <p class={styles.slowText}>{t("iframeViewer.slow")}</p>
                <a
                  href={props.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class={styles.slowLink}
                >
                  {t("iframeViewer.openInNewTab")}
                </a>
              </Show>
            </div>
          </Show>
          {isMounted() && (
            <iframe
              ref={iframeRef}
              src={props.url}
              class={styles.iframe}
              title={props.title}
              onLoad={() => setLoaded(true)}
            />
          )}
        </div>
      </div>
    </Portal>
  );
}
