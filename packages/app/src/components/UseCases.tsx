import styles from "./UseCases.module.css";

const useCases = [
  { icon: "📚", label: "Documentation Sites" },
  { icon: "✍️", label: "Blogs & Content" },
  { icon: "🚀", label: "SaaS Products" },
  { icon: "🛒", label: "E-commerce" },
  { icon: "💼", label: "Company Sites" },
];

export default function UseCases() {
  return (
    <section className={styles.useCases}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Who is this for?</h2>
          <div className={styles.useCaseChips}>
            {useCases.map((useCase, index) => (
              <div key={index} className={styles.chip}>
                <span className={styles.chipIcon}>{useCase.icon}</span>
                <span className={styles.chipLabel}>{useCase.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.cta}>
          <p className={styles.ctaText}>
            See real-world integrations and working examples
          </p>
          <a href="/examples" className={styles.ctaButton}>
            View Examples →
          </a>
        </div>
      </div>
    </section>
  );
}
