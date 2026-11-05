import { useNavigate } from "@solidjs/router";
import { Check, Plus } from "lucide-solid";
import {
  createEffect,
  createMemo,
  createResource,
  createSignal,
  For,
  on,
  Show,
} from "solid-js";
import { fetchBulletins, generateBulletin } from "@/api/bulletin.ts";
import { Header } from "@/components/Header";
import { ProgressBar } from "@/components/ProgressBar";
import { showToast } from "@/components/Toast/toast.tsx";
import { BULLETIN_START_YEAR } from "@/config/app.ts";
import { useLocale } from "@/store/LocaleContext.tsx";
import type { BulletinSummary } from "@/types/bulletin.ts";
import { formatDate } from "@/utils/date.ts";
import styles from "./BulletinList.module.css";

type DayEntry = {
  dateStr: string;
  bulletin: BulletinSummary | null;
  isNextSunday: boolean;
};

export function BulletinList() {
  const [data] = createResource(fetchBulletins);
  const { t, locale } = useLocale();
  const navigate = useNavigate();

  const now = new Date();
  const [selectedYear, setSelectedYear] = createSignal(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = createSignal(now.getMonth() + 1);
  const [creating, setCreating] = createSignal(false);
  const [showNewForm, setShowNewForm] = createSignal(false);
  const [newDate, setNewDate] = createSignal("");

  // Open on the month of the next Sunday, which may already be next month
  createEffect(
    on(
      () => data()?.nextSunday,
      (nextSunday) => {
        if (!nextSunday) return;
        const [y, m] = nextSunday.split("-").map(Number);
        setSelectedYear(y);
        setSelectedMonth(m);
      },
      { defer: true },
    ),
  );

  // Year options: next year (for late-December planning) down to BULLETIN_START_YEAR
  const years: number[] = [];
  for (let y = now.getFullYear() + 1; y >= BULLETIN_START_YEAR; y--) {
    years.push(y);
  }

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const yearName = (y: number) =>
    new Intl.DateTimeFormat(locale(), { year: "numeric" }).format(
      new Date(y, 0, 1),
    );
  const monthName = (m: number) =>
    new Intl.DateTimeFormat(locale(), { month: "long" }).format(
      new Date(2000, m - 1, 1),
    );

  // Entries for selected year/month: created bulletins + next Sunday if applicable
  const entries = createMemo((): DayEntry[] => {
    const d = data();
    if (!d) return [];
    const y = selectedYear();
    const m = selectedMonth();
    const prefix = `${y}-${String(m).padStart(2, "0")}`;
    const { nextSunday } = d;

    const result: DayEntry[] = [];
    let nextSundayFound = false;

    for (const b of d.bulletins) {
      if (b.serviceDate.startsWith(prefix)) {
        if (b.serviceDate === nextSunday) nextSundayFound = true;
        result.push({
          dateStr: b.serviceDate,
          bulletin: b,
          isNextSunday: b.serviceDate === nextSunday,
        });
      }
    }

    // Add next Sunday if it's in this month and not yet created
    if (!nextSundayFound && nextSunday.startsWith(prefix)) {
      result.push({
        dateStr: nextSunday,
        bulletin: null,
        isNextSunday: true,
      });
    }

    result.sort((a, b) => a.dateStr.localeCompare(b.dateStr));
    return result;
  });

  async function createFor(dateStr: string) {
    // An existing bulletin for the date is opened instead of failing
    const existing = data()?.bulletins.find((b) => b.serviceDate === dateStr);
    if (existing) {
      navigate(`/bulletin/${existing.id}`);
      return;
    }
    setCreating(true);
    const result = await generateBulletin(dateStr);
    setCreating(false);
    if (result.ok && result.id != null) {
      navigate(`/bulletin/${result.id}`);
    } else {
      showToast(
        t(result.status === 409 ? "bulletin.alreadyExists" : "common.error"),
        "error",
      );
    }
  }

  function handleDayClick(entry: DayEntry) {
    if (entry.bulletin) {
      navigate(`/bulletin/${entry.bulletin.id}`);
    } else {
      createFor(entry.dateStr);
    }
  }

  function openNewForm() {
    // Suggest the first Sunday from the next one onward that has no bulletin yet
    const d = data();
    let date = d?.nextSunday ?? "";
    const taken = new Set(d?.bulletins.map((b) => b.serviceDate));
    while (taken.has(date)) {
      const next = new Date(`${date}T00:00:00Z`);
      next.setUTCDate(next.getUTCDate() + 7);
      date = next.toISOString().slice(0, 10);
    }
    setNewDate(date);
    setShowNewForm(true);
  }

  return (
    <>
      <Header title={t("bulletin.title")} backTo="/" />
      <div class={styles.container}>
        <Show
          when={!data.loading}
          fallback={<p class={styles.loading}>{t("common.loading")}</p>}
        >
          {/* Year / Month selectors */}
          <div class={styles.selectorRow}>
            <select
              class={styles.selector}
              value={selectedYear()}
              onChange={(e) => setSelectedYear(Number(e.currentTarget.value))}
              aria-label={t("bulletin.yearLabel")}
            >
              <For each={years}>
                {(y) => <option value={y}>{yearName(y)}</option>}
              </For>
            </select>
            <select
              class={styles.selector}
              value={selectedMonth()}
              onChange={(e) => setSelectedMonth(Number(e.currentTarget.value))}
              aria-label={t("bulletin.monthLabel")}
            >
              <For each={months}>
                {(m) => <option value={m}>{monthName(m)}</option>}
              </For>
            </select>
          </div>

          {/* Bulletin entries */}
          <ul class={styles.list}>
            <For each={entries()}>
              {(entry) => (
                <li>
                  <button
                    type="button"
                    class={styles.dayCard}
                    classList={{
                      [styles.dayCardExists]: !!entry.bulletin,
                      [styles.dayCardPending]:
                        !entry.bulletin && entry.isNextSunday,
                    }}
                    disabled={creating()}
                    onClick={() => handleDayClick(entry)}
                  >
                    <span class={styles.dayDate}>
                      {formatDate(entry.dateStr, locale())}
                    </span>
                    <div class={styles.dayMeta}>
                      <Show
                        when={entry.bulletin}
                        keyed
                        fallback={
                          <span class={styles.pendingLabel}>
                            {t("bulletin.notCreated")}
                          </span>
                        }
                      >
                        {(b) => (
                          <>
                            <ProgressBar
                              filled={b.filledItems}
                              total={b.totalItems}
                              label={t("bulletin.progressCount", {
                                filled: String(b.filledItems),
                                total: String(b.totalItems),
                              })}
                            />
                            <Check
                              size={16}
                              stroke-width={2}
                              class={styles.checkIcon}
                            />
                          </>
                        )}
                      </Show>
                    </div>
                  </button>
                </li>
              )}
            </For>
          </ul>

          {/* Create a bulletin for any date */}
          <Show
            when={showNewForm()}
            fallback={
              <button
                type="button"
                class={styles.newButton}
                onClick={openNewForm}
              >
                <Plus size={16} stroke-width={1.5} />
                {t("bulletin.newBulletin")}
              </button>
            }
          >
            <form
              class={styles.newForm}
              onSubmit={(e) => {
                e.preventDefault();
                if (newDate()) createFor(newDate());
              }}
            >
              <label for="new-bulletin-date" class={styles.newFormLabel}>
                {t("bulletinForm.serviceDate")}
              </label>
              <input
                id="new-bulletin-date"
                type="date"
                class={styles.dateInput}
                value={newDate()}
                onInput={(e) => setNewDate(e.currentTarget.value)}
                required
              />
              <div class={styles.newFormActions}>
                <button
                  type="button"
                  class={styles.cancelButton}
                  onClick={() => setShowNewForm(false)}
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  class={styles.submitButton}
                  disabled={creating() || !newDate()}
                >
                  {t("common.create")}
                </button>
              </div>
            </form>
          </Show>
        </Show>
      </div>
    </>
  );
}
