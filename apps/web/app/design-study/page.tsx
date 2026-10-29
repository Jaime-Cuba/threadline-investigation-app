import styles from "./design-study.module.css";

const points = [
  {
    title: "What we know",
    body: "Some customer profiles may be linking, but the process can also send the same welcome email again.",
  },
  {
    title: "What is still unclear",
    body: "We do not yet know if the old workaround is still being used or if it works for this UK setup.",
  },
  {
    title: "What happens next",
    body: "Confirm the current setup, then get a fresh example of the failed postback.",
  },
];

const variants = [
  {
    id: "warm",
    label: "Option 1",
    name: "Warm cream",
    description: "The clearest and calmest version. Keeps the yellow accent without making the section feel loud.",
    className: styles.variantWarm,
  },
  {
    id: "yellow",
    label: "Option 2",
    name: "Soft yellow wash",
    description: "Feels more distinctly Threadline. The pale yellow surface adds warmth while the white panels keep it easy to scan.",
    className: styles.variantYellow,
  },
  {
    id: "neutral",
    label: "Option 3",
    name: "Neutral accent",
    description: "The most understated option. Uses a small yellow accent and lets the content carry the visual weight.",
    className: styles.variantNeutral,
  },
];

export default function DesignStudyPage() {
  return (
    <main className={styles.studyShell}>
      <header className={styles.studyHeader}>
        <p className={styles.eyebrow}>Threadline design study</p>
        <h1>Three lighter directions for Quick read</h1>
        <p className={styles.intro}>
          Same message, same information hierarchy, less visual weight. Pick the tone that feels right for the investigation experience.
        </p>
      </header>

      <div className={styles.optionsGrid}>
        {variants.map((variant) => (
          <section className={styles.option} key={variant.id}>
            <div className={styles.optionHeading}>
              <div>
                <p className={styles.optionLabel}>{variant.label}</p>
                <h2>{variant.name}</h2>
              </div>
              <span className={styles.choiceHint}>Choose this</span>
            </div>
            <p className={styles.optionDescription}>{variant.description}</p>

            <article className={`${styles.quickRead} ${variant.className}`} aria-label={`${variant.name} Quick read mockup`}>
              <div className={styles.decorativeOrb} aria-hidden="true" />
              <div className={styles.quickReadTopline}>
                <h3>Quick read</h3>
                <span className={styles.summaryBadge}>Plain-language summary</span>
              </div>
              <p className={styles.summary}>
                <strong>In short:</strong> Jellycat may have two related issues: profile matching can trigger duplicate welcome behavior, while a Bloomreach postback may be failing separately.
              </p>
              <div className={styles.pointGrid}>
                {points.map((point) => (
                  <div className={styles.point} key={point.title}>
                    <p className={styles.pointTitle}>{point.title}</p>
                    <p>{point.body}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>
        ))}
      </div>
    </main>
  );
}
