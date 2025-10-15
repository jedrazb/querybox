import styles from "./Features.module.css";

const features = [
  {
    icon: "🔍",
    title: "Instant Search",
    description:
      "Hybrid search on crawled content with highlighting and fuzzy matching powered by Elasticsearch",
  },
  {
    icon: "💬",
    title: "AI Chat",
    description:
      "Agent instantly helps users chat about data on your website using Elasticsearch agents",
  },
  {
    icon: "🎨",
    title: "Customizable UI",
    description:
      "Customize the UI to match your brand with themes, colors, and options",
  },
  {
    icon: "⚡",
    title: "Lightning Fast",
    description: "Optimized bundle size (~25KB) with instant search results",
  },
  {
    icon: "🔒",
    title: "Privacy First",
    description:
      "No chat history logging. Your data is never used for AI training",
  },
  {
    icon: "📱",
    title: "Responsive",
    description: "Works perfectly on all devices and screen sizes",
  },
];

export default function Features() {
  return (
    <section className={styles.features}>
      <div className={styles.container}>
        <h2 className={styles.title}>Everything You Need</h2>
        <div className={styles.grid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.icon}>{feature.icon}</div>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p className={styles.cardDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
