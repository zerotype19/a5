import styles from './intake.module.css';
import type { IntakeStep } from './types';
export function IntakeProgress({step}:{step:IntakeStep}) {
 const stage = step==='service'||step==='location' ? 0 : step==='details'||step==='timing' ? 1 : 2;
 const labels=['Your project','Details & photos','Contact & review'];
 return <div className={styles.progress} aria-live="polite"><p className={styles.progressLabel}>Step {stage+1} of 3 <span className={styles.progressMuted}>· {labels[stage]}</span></p><ol className={styles.progressTrack} aria-hidden="true">{labels.map((l,i)=><li key={l} className={i<stage?styles.progressDotDone:i===stage?styles.progressDotCurrent:styles.progressDot}/>)}</ol></div>;
}
