type Props = { direction?: "right" | "left" | "up-right" };

/** Decorative vector icon: never rendered through the system emoji font. */
export function ArrowIcon({ direction = "right" }: Props) {
  const paths = {
    right: "M4 12h16m-6-6 6 6-6 6",
    left: "M20 12H4m6-6-6 6 6 6",
    "up-right": "M5 19 19 5M5 5h14v14",
  };
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "inline-block", verticalAlign: "-0.125em", flexShrink: 0 }}
    >
      <path d={paths[direction]} />
    </svg>
  );
}
