import { X } from "lucide-solid";
import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
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

	// Reset loader when panel closes so the spinner shows on next open
	createEffect(() => {
		if (!props.open) setLoaded(false);
	});

	// postMessage: respond to receipt-snap:ready with the user's name
	onMount(() => {
		const targetOrigin = new URL(props.url).origin;

		function onMessage(e: MessageEvent) {
			if (!props.open) return;
			if (e.origin !== targetOrigin) return;
			if (e.data === "receipt-snap:ready") {
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
	onMount(() => {
		function onKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape" && props.open) {
				props.onClose();
			}
		}
		document.addEventListener("keydown", onKeyDown);
		onCleanup(() => document.removeEventListener("keydown", onKeyDown));
	});

	// Swipe-to-close gesture (left-edge rightward drag)
	onMount(() => {
		let startX = 0;
		let startTime = 0;
		let currentDelta = 0;
		let isEdgeSwipe = false;

		function onTouchStart(e: TouchEvent) {
			if (!props.open) return;
			const touch = e.touches[0];
			if (touch.clientX <= 20) {
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

			if (currentDelta > window.innerWidth * 0.3 || velocity > 0.5) {
				props.onClose();
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
				onClick={props.onClose}
				aria-hidden="true"
			/>
			<div
				ref={contentRef}
				class={styles.content}
				classList={{ [styles.contentOpen]: props.open }}
				role="dialog"
				aria-modal="true"
				aria-label={props.title}
			>
				{/* Transparent strip on the left edge captures swipe gestures above the iframe */}
				<div class={styles.edgeStrip} aria-hidden="true" />
				{!loaded() && (
					<div class={styles.loader} aria-hidden="true">
						<div class={styles.loaderSpinner} />
					</div>
				)}
				{props.open && (
					<iframe
						ref={iframeRef}
						src={props.url}
						class={styles.iframe}
						title={props.title}
						onLoad={() => setLoaded(true)}
					/>
				)}
				<button
					type="button"
					class={styles.closeButton}
					onClick={props.onClose}
					aria-label={t("common.close")}
				>
					<X size={20} stroke-width={1.5} />
				</button>
			</div>
		</Portal>
	);
}
