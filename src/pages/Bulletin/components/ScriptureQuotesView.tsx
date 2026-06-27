import { For, Show } from "solid-js";
import type { ScriptureQuotesSectionData } from "@/types/bulletin.ts";
import sectionStyles from "../Bulletin.module.css";
import styles from "./ScriptureQuotesView.module.css";

type Props = {
  section: ScriptureQuotesSectionData;
};

export function ScriptureQuotesView(props: Props) {
  return (
    <Show when={props.section.data.length > 0}>
      <section class={sectionStyles.section}>
        <h2 class={sectionStyles.sectionTitle}>{props.section.label}</h2>
        <div class={sectionStyles.sectionBody}>
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
        </div>
      </section>
    </Show>
  );
}
