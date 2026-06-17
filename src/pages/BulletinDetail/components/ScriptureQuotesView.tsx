import { For, Show } from "solid-js";
import type { ScriptureQuotesSectionData } from "@/types/bulletin.ts";
import detailStyles from "../BulletinDetail.module.css";
import styles from "./ScriptureQuotesView.module.css";

type Props = {
  section: ScriptureQuotesSectionData;
};

export function ScriptureQuotesView(props: Props) {
  return (
    <Show when={props.section.data.length > 0}>
      <section class={detailStyles.section}>
        <h2 class={detailStyles.sectionTitle}>{props.section.label}</h2>
        <For each={props.section.data}>
          {(quote) => (
            <div class={styles.quoteItem}>
              <Show when={quote.reference}>
                <p class={styles.reference}>{quote.reference}</p>
              </Show>
              <p class={styles.quoteText}>{quote.text}</p>
            </div>
          )}
        </For>
      </section>
    </Show>
  );
}
