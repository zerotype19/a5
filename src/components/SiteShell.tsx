import { Footer } from "./Footer";
import { Header } from "./Header";
import styles from "./SiteShell.module.css";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <Header />
      <div className={styles.content}>{children}</div>
      <Footer />
    </div>
  );
}
