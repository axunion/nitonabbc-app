import type { RouteSectionProps } from "@solidjs/router";
import { useLocation } from "@solidjs/router";
import { TabBar } from "@/components/TabBar";
import { useLocale } from "@/store/LocaleContext.tsx";
import styles from "./MemberLayout.module.css";

export function MemberLayout(props: RouteSectionProps) {
  const { t } = useLocale();
  const location = useLocation();

  return (
    <div class={styles.layout}>
      <a href="#main-content" class={styles.skipLink}>
        {t("common.skipToContent")}
      </a>
      <TabBar />
      <main
        id="main-content"
        class={styles.main}
        classList={{
          [styles.mainNoTabBar]:
            location.pathname !== "/" && location.pathname !== "/settings",
        }}
        data-scroll-container
      >
        {props.children}
      </main>
    </div>
  );
}
