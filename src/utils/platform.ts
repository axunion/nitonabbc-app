export function isIos(): boolean {
	return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function isStandalone(): boolean {
	return window.matchMedia("(display-mode: standalone)").matches;
}
