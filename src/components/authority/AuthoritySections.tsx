import { requestHref } from "@/lib/intake/context";
import Link from "next/link";
import { SITE } from "@config/site";
import { CtaBlock } from "@/components/CtaBlock";
import { renderableContentLinks } from "@/lib/authority/links";
import type {
  ContentLink,
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


function sectionTone(heading: string | null | undefined): string {
  const text = heading ?? "";
  if (/local context|nearby areas|sources/i.test(text)) return styles.quiet;
  if (/photo/i.test(text)) return styles.callout;
  return styles.block;
}

function ContentLinks({ links }: { links: ContentLink[] | undefined }) {
  const safe = renderableContentLinks(links);
  if (safe.length === 0) return null;
  return (
    <ul className={styles.linkList}>
      {safe.map((link) => (
        <li key={`${link.href}-${link.label}`}>
          <Link href={link.href}>
            {link.label}
            <span aria-hidden="true">→</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

type Props = {
  page: PublicContentPage;
};

export function AuthoritySections({ page }: Props) {
  return (
    <div className={styles.stack}>
      {page.primary_question && page.direct_answer ? (
        <section className={styles.directAnswer} aria-labelledby="direct-answer-heading">
          <h2 id="direct-answer-heading" className={styles.question}>
            {page.primary_question}
          </h2>
          <p className={styles.answer}>{page.direct_answer}</p>
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
        <section className={styles.directAnswer} aria-label="Answer">
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
          {section.items?.length ? (
            <ul className={styles.itemList}>
              {section.items.map((item) => (
                <li key={item.title} className={styles.item}>
                  <h3 className={styles.itemTitle}>{item.title}</h3>
                  <p className={styles.itemBody}>{item.body}</p>
                  <ContentLinks links={item.links} />
                </li>
              ))}
            </ul>
          ) : null}
          <ContentLinks links={section.links} />
          {section.closing?.map((paragraph) => (
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
        <section className={styles.quiet} aria-label="Sources">
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
            primaryHref={requestHref({service: page.primary_service_id, location: page.primary_location_id, problem: page.problem?.slug})}
            primaryCta="authority-request-service"
            primaryLabel={section.primaryLabel}
            secondaryLabel={
              section.callLabel ? `${section.callLabel} ${SITE.phone}` : undefined
            }
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
          <h2 className={styles.heading}>How to tell them apart</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">What to look at</th>
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
