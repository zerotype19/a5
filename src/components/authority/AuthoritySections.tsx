import Link from "next/link";
import { CtaBlock } from "@/components/CtaBlock";
import type {
  ContentPageType,
  ContentSection,
  PublicContentPage,
} from "@/lib/authority/types";
import styles from "./AuthoritySections.module.css";

const RELATED_TYPE: Partial<Record<ContentPageType, string>> = {
  SERVICE: "Service",
  PROBLEM: "Problem",
  LOCATION: "Town",
  GUIDE: "Guide",
  COST_GUIDE: "Guide",
  COMPARISON: "Comparison",
  SERVICE_LOCATION: "Local service",
};

const RELATED_REASON: Partial<Record<ContentPageType, string>> = {
  SERVICE: "The kind of work A5 coordinates",
  PROBLEM: "What you are seeing, and what to photograph",
  LOCATION: "Home services in this town",
  GUIDE: "A longer explanation",
  COST_GUIDE: "What tends to change the scope",
  COMPARISON: "How the options differ",
  SERVICE_LOCATION: "This service in this town",
};

function sectionTone(heading: string | null | undefined): string {
  const text = heading ?? "";
  if (/local context|nearby areas|sources/i.test(text)) return styles.quiet;
  if (/photo/i.test(text)) return styles.callout;
  return styles.block;
}

type Props = {
  page: PublicContentPage;
};

export function AuthoritySections({ page }: Props) {
  return (
    <div className={styles.stack}>
      {page.primary_question && page.direct_answer ? (
        <section className={styles.directAnswer} aria-labelledby="direct-answer-heading">
          <h2 id="direct-answer-heading" className={styles.eyebrow}>
            Direct answer
          </h2>
          <p className={styles.question}>{page.primary_question}</p>
          <p className={styles.answer}>{page.direct_answer}</p>
          <p className={styles.answerAction}>
            <Link href="/request-service" data-cta="authority-direct-request">
              Tell us what needs fixing
            </Link>
          </p>
        </section>
      ) : null}

      {page.sections.map((section, index) => (
        <SectionBlock
          key={`${section.type}-${index}`}
          section={section}
          page={page}
        />
      ))}
    </div>
  );
}

function SectionBlock({
  section,
  page,
}: {
  section: ContentSection;
  page: PublicContentPage;
}) {
  switch (section.type) {
    case "INTRO":
      return <p className={styles.lead}>{section.body}</p>;
    case "DIRECT_ANSWER":
      return (
        <section className={styles.directAnswer} aria-label="Direct answer">
          <p className={styles.answer}>{section.body}</p>
        </section>
      );
    case "RICH_TEXT":
      return (
        <section className={sectionTone(section.heading)}>
          {section.heading ? (
            <h2 className={styles.heading}>{section.heading}</h2>
          ) : null}
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)} className={styles.body}>
              {paragraph}
            </p>
          ))}
        </section>
      );
    case "QUESTION_ANSWER":
      return (
        <section className={styles.block} aria-label="Questions">
          <h2 className={styles.heading}>Questions</h2>
          <dl className={styles.qa}>
            {section.items.map((item) => (
              <div key={item.question} className={styles.qaItem}>
                <dt>{item.question}</dt>
                <dd>{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      );
    case "SOURCE_LIST":
      if (page.sources.length === 0) return null;
      return (
        <section className={styles.block} aria-label="Sources">
          <h2 className={styles.heading}>{section.heading ?? "Sources"}</h2>
          <ul className={styles.sourceList}>
            {page.sources.map((source) => (
              <li key={source.id}>
                <a href={source.url} rel="noopener noreferrer">
                  {source.title}
                </a>
                {source.publisher ? (
                  <span className={styles.muted}> — {source.publisher}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      );
    case "RELATED_CONTENT":
      if (page.related_content.length === 0) return null;
      return (
        <section className={styles.block} aria-label="Related">
          <h2 className={styles.heading}>
            {section.heading ?? "Related"}
          </h2>
          <ul className={styles.relatedGrid}>
            {page.related_content.map((item) => {
              const compact =
                item.page_type === "SERVICE" || item.page_type === "LOCATION";
              return (
                <li key={item.id}>
                  <Link
                    className={compact ? styles.relatedChip : styles.relatedCard}
                    href={item.path}
                  >
                    <span className={styles.relatedType}>
                      {RELATED_TYPE[item.page_type] ?? "Related"}
                    </span>
                    <span className={styles.relatedTitle}>{item.title}</span>
                    {compact ? null : (
                      <span className={styles.relatedReason}>
                        {RELATED_REASON[item.page_type] ?? "Related help"}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      );
    case "CTA":
      return (
        <section className={styles.ctaBand} aria-label="Request service">
          <CtaBlock
            title={section.title ?? "Request service"}
            description={
              section.description ??
              "Tell A5 what your home needs. We will review and coordinate next steps."
            }
            primaryHref="/request-service"
            primaryCta="authority-request-service"
          />
        </section>
      );
    case "COST_FACTORS":
      return (
        <section className={styles.block}>
          <h2 className={styles.heading}>
            {section.heading ?? "What affects cost"}
          </h2>
          <ul>
            {section.factors.map((factor) => (
              <li key={factor}>{factor}</li>
            ))}
          </ul>
        </section>
      );
    case "COMPARISON_TABLE":
      return (
        <section className={styles.block}>
          <h2 className={styles.heading}>Comparison</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Criterion</th>
                  <th scope="col">{section.optionALabel}</th>
                  <th scope="col">{section.optionBLabel}</th>
                </tr>
              </thead>
              <tbody>
                {section.rows.map((row) => (
                  <tr key={row.criterion}>
                    <th scope="row">{row.criterion}</th>
                    <td>{row.optionA}</td>
                    <td>{row.optionB}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      );
    case "PROJECT_EVIDENCE":
      return (
        <section className={styles.block}>
          {section.heading ? (
            <h2 className={styles.heading}>{section.heading}</h2>
          ) : (
            <h2 className={styles.heading}>Project evidence</h2>
          )}
          <p className={styles.body}>{section.body}</p>
        </section>
      );
    default:
      return null;
  }
}
