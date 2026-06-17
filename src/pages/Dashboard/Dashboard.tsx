import { useNavigate } from "@solidjs/router";
import {
  FileText,
  FolderOpen,
  PictureInPicture2,
  ReceiptText,
} from "lucide-solid";
import { createSignal } from "solid-js";
import { Header } from "@/components/Header";
import { IframeViewer } from "@/components/IframeViewer";
import { FILE_BROWSER_URL, RECEIPT_SNAP_URL } from "@/config/iframes.ts";
import { useLocale } from "@/store/LocaleContext.tsx";
import styles from "./Dashboard.module.css";

export function Dashboard() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const [iframeOpen, setIframeOpen] = createSignal(false);
  const [fileBrowserOpen, setFileBrowserOpen] = createSignal(false);

  return (
    <>
      <Header />
      <div class={styles.container}>
        <div class={styles.grid}>
          <button
            type="button"
            class={styles.widgetPrimary}
            onClick={() => navigate("/bulletin")}
          >
            <span class={styles.widgetIcon}>
              <FileText size={24} stroke-width={1.5} />
            </span>
            <span class={styles.widgetLabel}>{t("dashboard.bulletin")}</span>
          </button>
          <button
            type="button"
            class={styles.widget}
            onClick={() => setIframeOpen(true)}
          >
            <span class={styles.widgetIcon}>
              <ReceiptText size={24} stroke-width={1.5} />
            </span>
            <span class={styles.widgetLabelRow}>
              <span class={styles.widgetLabel}>{t("dashboard.expense")}</span>
              <PictureInPicture2
                size={12}
                stroke-width={1.5}
                class={styles.widgetExternalBadge}
              />
            </span>
          </button>
          <button
            type="button"
            class={styles.widget}
            onClick={() => setFileBrowserOpen(true)}
          >
            <span class={styles.widgetIcon}>
              <FolderOpen size={24} stroke-width={1.5} />
            </span>
            <span class={styles.widgetLabelRow}>
              <span class={styles.widgetLabel}>{t("dashboard.files")}</span>
              <PictureInPicture2
                size={12}
                stroke-width={1.5}
                class={styles.widgetExternalBadge}
              />
            </span>
          </button>
        </div>
      </div>
      <IframeViewer
        open={iframeOpen()}
        url={RECEIPT_SNAP_URL}
        title={t("dashboard.expense")}
        onClose={() => setIframeOpen(false)}
      />
      <IframeViewer
        open={fileBrowserOpen()}
        url={FILE_BROWSER_URL}
        title={t("dashboard.files")}
        onClose={() => setFileBrowserOpen(false)}
      />
    </>
  );
}
