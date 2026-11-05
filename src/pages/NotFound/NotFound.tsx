import { A } from "@solidjs/router";
import { Header } from "@/components/Header";
import { useLocale } from "@/store/LocaleContext.tsx";
import styles from "./NotFound.module.css";

export function NotFound() {
  const { t } = useLocale();

  return (
    <>
      <Header title={t("notFound.title")} backTo="/" />
      <div class={styles.container}>
        <p class={styles.message}>{t("notFound.message")}</p>
        <A href="/" class={styles.homeLink}>
          {t("notFound.backHome")}
        </A>
      </div>
    </>
  );
}
