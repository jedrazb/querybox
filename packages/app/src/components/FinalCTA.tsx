import styles from "./FinalCTA.module.css";

export default function FinalCTA() {
  return (
    <section className={styles.ctaWrapper}>
      {/* Animated Background */}
      <div className={styles.background}>
        <div className={styles.gradientGlow}></div>
      </div>

      <div className={styles.cta}>
        <div className={styles.container}>
          <div className={styles.content}>
            <h2 className={styles.title}>Ready to Add Search & Chat?</h2>
            <p className={styles.subtitle}>
              Add QueryBox to your website in under 3 minutes.
            </p>
            <div className={styles.buttons}>
              <a href="/get-started" className={styles.primaryButton}>
                Start Free Now
              </a>
              <a
                href="https://github.com/jedrazb/querybox"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.secondaryButton}
              >
                ⭐ Star on GitHub
              </a>
            </div>
            <p className={styles.hint}>
              Questions?{" "}
              <a href="mailto:jedrazb@gmail.com" className={styles.contactLink}>
                Get in touch
              </a>{" "}
              or{" "}
              <a
                href="https://github.com/jedrazb/querybox/issues"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactLink}
              >
                open an issue
              </a>
            </p>

            <div className={styles.buildingInPublic}>
              <p className={styles.buildingInPublicText}>
                🚀 <strong>Building in public:</strong> QueryBox is currently
                free for everyone while we build and improve the platform. Help
                us shape the future by{" "}
                <a
                  href="https://github.com/jedrazb/querybox/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactLink}
                >
                  sharing feedback
                </a>
                !
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
