import { useNavigate, useParams } from "@solidjs/router";
import { Pencil, Plus } from "lucide-solid";
import { createMemo, createSignal, For, onCleanup, Show } from "solid-js";
import { Header } from "@/components/Header";
import { ProgressBar } from "@/components/ProgressBar";
import { useLocale } from "@/store/LocaleContext.tsx";
import { hasSectionViewContent } from "@/utils/bulletin.ts";
import { formatDate } from "@/utils/date.ts";
import styles from "./Bulletin.module.css";
import { SectionEditor } from "./components/SectionEditor.tsx";
import { SectionView } from "./components/SectionView.tsx";
import editorStyles from "./editorFields.module.css";
import { useBulletinForm } from "./hooks/useBulletinForm.ts";

function sectionAnchorId(sectionId: string): string {
  return `bulletin-section-${sectionId}`;
}

export function Bulletin() {
  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { t, locale } = useLocale();
  const isNew = () => !params.id;
  const mq = window.matchMedia("(min-width: 900px)");
  const [isDesktop, setIsDesktop] = createSignal(mq.matches);
  const onMqChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
  mq.addEventListener("change", onMqChange);
  onCleanup(() => mq.removeEventListener("change", onMqChange));

  // For existing bulletins: which section (if any) is open for editing
  const [editingSectionId, setEditingSectionId] = createSignal<string | null>(
    null,
  );

  const form = useBulletinForm();

  const handleSectionEdit = (sectionId: string) => {
    // Reset any in-progress edits before opening a new section
    if (editingSectionId() && editingSectionId() !== sectionId) {
      form.resetToExisting();
    }
    setEditingSectionId(sectionId);
  };

  const handleSectionCancel = () => {
    form.clearError();
    form.resetToExisting();
    setEditingSectionId(null);
  };

  const handleSectionSave = async () => {
    const result = await form.save();
    if (result.ok) {
      form.refetchExisting();
      setEditingSectionId(null);
    }
  };

  // New bulletin: form submit via sticky bar
  const handleNewBulletinSave = async (e: SubmitEvent) => {
    e.preventDefault();
    const result = await form.save();
    if (result.ok && result.id != null) {
      navigate(`/bulletin/${result.id}`);
    }
  };

  const template = () => form.template() ?? [];

  const visibleTocSections = createMemo(() => {
    if (isNew()) return form.sections();
    return form
      .sections()
      .filter(
        (s) =>
          editingSectionId() === s.id || hasSectionViewContent(s, template()),
      );
  });

  return (
    <>
      <Header title={t("bulletin.title")} backTo="/bulletin" />
      <div class={styles.container}>
        <Show
          when={form.initialized()}
          fallback={<p class={styles.loading}>{t("common.loading")}</p>}
        >
          <form
            onSubmit={
              isNew() ? handleNewBulletinSave : (e) => e.preventDefault()
            }
            class={styles.form}
          >
            <div class={styles.layoutGrid}>
              <Show when={isDesktop()}>
                <nav class={styles.toc} aria-label={t("bulletinForm.tocLabel")}>
                  <For each={visibleTocSections()}>
                    {(section) => (
                      <button
                        type="button"
                        class={styles.tocLink}
                        onClick={() => {
                          document
                            .getElementById(sectionAnchorId(section.id))
                            ?.scrollIntoView({ behavior: "smooth" });
                        }}
                      >
                        {section.label ?? "…"}
                      </button>
                    )}
                  </For>
                </nav>
              </Show>

              <div class={styles.formBody}>
                {/* Existing bulletin: date heading + progress */}
                <Show when={!isNew()}>
                  <h1 class={styles.title}>
                    {formatDate(form.serviceDate(), locale())}
                  </h1>
                  <Show when={form.totalItems() > 0}>
                    <div class={styles.progressRow}>
                      <ProgressBar
                        filled={form.filledItems()}
                        total={form.totalItems()}
                        label={t("bulletin.progressCount", {
                          filled: String(form.filledItems()),
                          total: String(form.totalItems()),
                        })}
                      />
                    </div>
                  </Show>
                </Show>

                {/* New bulletin: date input */}
                <Show when={isNew()}>
                  <div class={editorStyles.field}>
                    <label for="service-date" class={editorStyles.fieldLabel}>
                      {t("bulletinForm.serviceDate")}
                    </label>
                    <input
                      id="service-date"
                      type="date"
                      class={editorStyles.input}
                      value={form.serviceDate()}
                      onInput={(e) =>
                        form.setServiceDate(e.currentTarget.value)
                      }
                      required
                    />
                  </div>
                </Show>

                <Show when={form.error()}>
                  <p class={styles.error}>{form.error()}</p>
                </Show>

                <div class={styles.sectionsGrid}>
                  <For each={form.sections()}>
                    {(section) => {
                      const isEditing = () => editingSectionId() === section.id;
                      const hasContent = () =>
                        hasSectionViewContent(section, template());

                      const renderEditor = () => (
                        <SectionEditor
                          section={section}
                          template={template()}
                          members={form.members()}
                          onUpdateDetails={form.updateWorshipDetails}
                          onUpdateFieldValue={form.updateWorshipFieldValue}
                          onAddAnnouncement={form.addAnnouncement}
                          onRemoveAnnouncement={form.removeAnnouncement}
                          onUpdateAnnouncement={form.updateAnnouncement}
                          onUpdateAssignment={form.updateAssignment}
                          onUpdateWeeklyVerse={form.updateWeeklyVerse}
                          onUpdateMonthlySong={form.updateMonthlySong}
                          onUpdateTextBlock={form.updateTextBlock}
                          onUpdateWeeklyPrayer={form.updateWeeklyPrayer}
                          onAddUpcomingEvent={form.addUpcomingEvent}
                          onRemoveUpcomingEvent={form.removeUpcomingEvent}
                          onUpdateUpcomingEvent={form.updateUpcomingEvent}
                          onAddBirthday={form.addBirthday}
                          onRemoveBirthday={form.removeBirthday}
                          onUpdateBirthday={form.updateBirthday}
                          onAddScriptureQuote={form.addScriptureQuote}
                          onRemoveScriptureQuote={form.removeScriptureQuote}
                          onUpdateScriptureQuote={form.updateScriptureQuote}
                          onUpdateAttendance={form.updateAttendance}
                          onUpdateServiceMeta={form.updateServiceMeta}
                          onUpdateFinancialSummary={form.updateFinancialSummary}
                        />
                      );

                      // New bulletin: all sections always in edit mode
                      if (isNew()) {
                        return (
                          <fieldset
                            id={sectionAnchorId(section.id)}
                            class={styles.section}
                          >
                            <legend class={styles.sectionTitle}>
                              {section.label}
                            </legend>
                            <div class={styles.sectionBody}>
                              {renderEditor()}
                            </div>
                          </fieldset>
                        );
                      }

                      // Existing bulletin: per-section editing
                      return (
                        <Show
                          when={isEditing()}
                          fallback={
                            // View mode for this section
                            <div id={sectionAnchorId(section.id)}>
                              <Show
                                when={hasContent()}
                                fallback={
                                  // Empty section: compact add placeholder
                                  <button
                                    type="button"
                                    class={styles.emptySection}
                                    onClick={() =>
                                      handleSectionEdit(section.id)
                                    }
                                  >
                                    <span class={styles.sectionTitle}>
                                      {section.label}
                                    </span>
                                    <span class={styles.emptySectionIcon}>
                                      <Plus size={14} stroke-width={1.5} />
                                    </span>
                                  </button>
                                }
                              >
                                {/* Filled section: view + pencil */}
                                <div class={styles.filledSection}>
                                  <SectionView
                                    section={section}
                                    template={template()}
                                    members={form.members()}
                                  />
                                  <button
                                    type="button"
                                    class={styles.sectionPencilBtn}
                                    onClick={() =>
                                      handleSectionEdit(section.id)
                                    }
                                    aria-label={t("common.edit")}
                                  >
                                    <Pencil size={12} stroke-width={1.5} />
                                  </button>
                                </div>
                              </Show>
                            </div>
                          }
                        >
                          {/* Edit mode for this section */}
                          <fieldset
                            id={sectionAnchorId(section.id)}
                            class={styles.section}
                          >
                            <legend class={styles.sectionTitle}>
                              {section.label}
                            </legend>
                            <div class={styles.sectionBody}>
                              {renderEditor()}
                            </div>
                            <div class={styles.sectionActions}>
                              <button
                                type="button"
                                class={styles.cancelButton}
                                onClick={handleSectionCancel}
                              >
                                {t("common.cancel")}
                              </button>
                              <button
                                type="button"
                                class={styles.submitButton}
                                disabled={form.submitting()}
                                onClick={handleSectionSave}
                              >
                                {t("common.save")}
                              </button>
                            </div>
                          </fieldset>
                        </Show>
                      );
                    }}
                  </For>
                </div>
              </div>
            </div>

            {/* Sticky bar: only for new bulletin creation */}
            <Show when={isNew()}>
              <div class={styles.stickyBar}>
                <div class={styles.stickyBarInner}>
                  <Show when={form.serviceDate() && !form.hasContent()}>
                    <p class={styles.validationHint}>
                      {t("bulletinForm.fillAtLeastOne")}
                    </p>
                  </Show>
                  <div class={styles.actions}>
                    <button
                      type="button"
                      class={styles.cancelButton}
                      onClick={() => navigate("/bulletin")}
                    >
                      {t("common.cancel")}
                    </button>
                    <button
                      type="submit"
                      class={styles.submitButton}
                      disabled={
                        form.submitting() ||
                        !form.serviceDate() ||
                        !form.hasContent()
                      }
                    >
                      {t("common.create")}
                    </button>
                  </div>
                </div>
              </div>
            </Show>
          </form>
        </Show>
      </div>
    </>
  );
}
